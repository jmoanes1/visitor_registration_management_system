import { visitors as seed } from '../data/visitorSeed.js';

const now = () => new Date().toISOString();

const pad = (value, digits) => String(value).padStart(digits, '0');

const withDestinationFields = (visitor) => {
  const destination = visitor.roomOrUnit ?? visitor.company ?? null;
  return { ...visitor, roomOrUnit: destination, company: destination };
};

// The oldest records only carry `company`, so both keys are mirrored on every
// record read or written and callers never have to guess which one is set.
const visitors = seed.map(withDestinationFields);

// Visitor ids and badge references both end in a sequence number, so the next
// value comes from the highest one currently in memory.
const nextNumberFrom = (values) =>
  values.reduce(
    (highest, value) => Math.max(highest, Number(value.match(/(\d+)$/)?.[1]) || 0),
    0
  );

const indexOf = (id) => visitors.findIndex((visitor) => visitor.id === id);

const isDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

// A bare "2026-11-03" parses as midnight, which would drop everything else in
// that day, so an upper bound widens it to the day's last millisecond.
const boundOf = (value, { endOfDay = false } = {}) => {
  const date = endOfDay && isDateOnly(value)
    ? new Date(`${value}T23:59:59.999Z`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const list = ({ search, status, visitorType, department, dateFrom, dateTo } = {}) => {
  let results = [...visitors];

  if (search) {
    const query = search.toLowerCase();
    const searchableFields = [
      'firstName',
      'lastName',
      'company',
      'roomOrUnit',
      'address',
      'referenceNumber',
      'personToVisit',
    ];
    results = results.filter((visitor) =>
      searchableFields.some((field) => visitor[field]?.toLowerCase().includes(query))
    );
  }

  if (status) results = results.filter((visitor) => visitor.status === status);
  if (visitorType) results = results.filter((visitor) => visitor.visitorType === visitorType);
  if (department) results = results.filter((visitor) => visitor.department === department);

  const from = dateFrom ? boundOf(dateFrom) : null;
  if (from) results = results.filter((visitor) => visitor.registrationTimestamp >= from);

  const to = dateTo ? boundOf(dateTo, { endOfDay: true }) : null;
  if (to) results = results.filter((visitor) => visitor.registrationTimestamp <= to);

  return results;
};

const findById = (id) => visitors.find((visitor) => visitor.id === id);

const create = (data) => {
  const timestamp = now();

  const visitor = withDestinationFields({
    id: `v-${pad(nextNumberFrom(visitors.map((v) => v.id)) + 1, 3)}`,
    referenceNumber: `VS-2026-${pad(
      nextNumberFrom(visitors.map((v) => v.referenceNumber)) + 1,
      6
    )}`,
    firstName: data.firstName,
    lastName: data.lastName,
    roomOrUnit: data.roomOrUnit ?? data.company ?? null,
    address: data.address ?? null,
    profilePicture: data.profilePicture ?? null,
    idPicture: data.idPicture ?? null,
    faceMatchScore: data.faceMatchScore ?? null,
    faceVerified: data.faceVerified ?? false,
    contactNumber: data.contactNumber ?? null,
    email: data.email ?? null,
    personToVisit: data.personToVisit,
    department: data.department || 'General',
    purpose: data.purpose,
    visitorType: data.visitorType || 'Walk-in',
    expectedArrival: data.expectedArrival ?? null,
    status: 'Registered',
    checkInTime: null,
    checkOutTime: null,
    notes: data.notes ?? null,
    registrationTimestamp: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  visitors.push(visitor);
  return visitor;
};

const IMMUTABLE_FIELDS = ['id', 'referenceNumber', 'createdAt'];

const update = (id, changes) => {
  const index = indexOf(id);
  if (index === -1) return null;

  const editable = Object.fromEntries(
    Object.entries(changes).filter(([key]) => !IMMUTABLE_FIELDS.includes(key))
  );

  const visitor = withDestinationFields({
    ...visitors[index],
    ...editable,
    updatedAt: now(),
  });

  visitors[index] = visitor;
  return visitor;
};

// Applies a status change to one record. Returns null when the record is missing
// or when it is not in a state that allows the change.
const transition = (id, isAllowed, changes) => {
  const index = indexOf(id);
  const current = visitors[index];

  if (!current || !isAllowed(current)) return null;

  const visitor = {
    ...current,
    ...changes(),
    updatedAt: now(),
  };

  visitors[index] = visitor;
  return visitor;
};

const checkIn = (id) =>
  transition(
    id,
    (visitor) => visitor.status !== 'Checked In',
    () => ({ status: 'Checked In', checkInTime: now() })
  );

const checkOut = (id) =>
  transition(
    id,
    (visitor) => visitor.status === 'Checked In',
    () => ({ status: 'Checked Out', checkOutTime: now() })
  );

const cancel = (id) =>
  transition(
    id,
    (visitor) => visitor.status !== 'Cancelled',
    () => ({ status: 'Cancelled' })
  );

const remove = (id) => {
  const index = indexOf(id);
  if (index === -1) return null;

  const [removed] = visitors.splice(index, 1);
  return removed;
};

export { list, findById, create, update, checkIn, checkOut, cancel, remove };
