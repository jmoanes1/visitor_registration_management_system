import { VISITOR_STATUSES, VISITOR_TYPES } from '../../shared/visitorStatuses.js';
import httpError from '../utils/httpError.js';

const REQUIRED_FIELDS = [
  { key: 'firstName', label: 'first name' },
  { key: 'lastName', label: 'last name' },
  { key: 'personToVisit', label: 'person to visit' },
  { key: 'purpose', label: 'purpose of visit' },
];

const isFilled = (value) => typeof value === 'string' && value.trim() !== '';

// Defaults such as department or visit type are applied when the record is
// created, so a partial update keeps the stored value instead of blanking it.
const enumError = (body) => {
  if (body.status && !VISITOR_STATUSES.includes(body.status)) {
    return `Invalid status. Must be one of: ${VISITOR_STATUSES.join(', ')}`;
  }
  if (body.visitorType && !VISITOR_TYPES.includes(body.visitorType)) {
    return `Invalid visitor type. Must be one of: ${VISITOR_TYPES.join(', ')}`;
  }
  return null;
};

// A POST carries the whole record, so every required field has to be present.
const validateCreate = (req, res, next) => {
  const body = req.body || {};

  // roomOrUnit is the current name; older clients still send company.
  const missing = REQUIRED_FIELDS.filter(({ key }) => !isFilled(body[key]))
    .map(({ label }) => label)
    .concat(isFilled(body.roomOrUnit) || isFilled(body.company) ? [] : ['room or unit']);

  if (missing.length > 0) {
    return next(httpError(400, `Missing required fields: ${missing.join(', ')}`));
  }

  const message = enumError(body);
  return message ? next(httpError(400, message)) : next();
};

// A PATCH may omit fields, but one it does send cannot be blank.
const validateUpdate = (req, res, next) => {
  const body = req.body || {};

  const blank = REQUIRED_FIELDS.filter(
    ({ key }) => key in body && !isFilled(body[key])
  ).map(({ label }) => label);

  if ('roomOrUnit' in body && !isFilled(body.roomOrUnit) && !isFilled(body.company)) {
    blank.push('room or unit');
  }

  const message = enumError(body);
  if (message) return next(httpError(400, message));
  if (blank.length > 0) return next(httpError(400, `Cannot be blank: ${blank.join(', ')}`));

  return next();
};

export { validateCreate, validateUpdate };
