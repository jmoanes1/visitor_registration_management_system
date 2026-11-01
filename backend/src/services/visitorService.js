import {
  visitors,
  getMockVisitors,
  findMockVisitorById,
  findMockVisitorByReferenceNumber,
} from '../data/mockVisitors.js';

const getAllVisitors = () => {
  return getMockVisitors();
};

const getVisitorById = (id) => {
  return findMockVisitorById(id);
};

const createVisitor = (visitorData) => {
  const maxId =
    visitors.length > 0
      ? Math.max(...visitors.map((v) => parseInt(v.id.split('-')[1])))
      : 0;
  const newId = `v-${String(maxId + 1).padStart(3, '0')}`;

  const maxRef =
    visitors.length > 0
      ? Math.max(...visitors.map((v) => parseInt(v.referenceNumber.split('-')[2])))
      : 0;
  const newReferenceNumber = `VS-2026-${String(maxRef + 1).padStart(6, '0')}`;

  const now = new Date().toISOString();
  const newVisitor = {
    id: newId,
    referenceNumber: newReferenceNumber,
    firstName: visitorData.firstName,
    lastName: visitorData.lastName,
    company: visitorData.roomOrUnit || visitorData.company || null,
    roomOrUnit: visitorData.roomOrUnit || visitorData.company || null,
    address: visitorData.address || null,
    profilePicture: visitorData.profilePicture || null,
    idPicture: visitorData.idPicture || null,
    faceMatchScore: visitorData.faceMatchScore || null,
    faceVerified: visitorData.faceVerified || false,
    contactNumber: visitorData.contactNumber || null,
    email: visitorData.email || null,
    personToVisit: visitorData.personToVisit,
    department: visitorData.department || 'General',
    purpose: visitorData.purpose,
    visitorType: visitorData.visitorType || 'Walk-in',
    expectedArrival: visitorData.expectedArrival || null,
    status: 'Registered',
    checkInTime: null,
    checkOutTime: null,
    notes: visitorData.notes || null,
    registrationTimestamp: now,
    createdAt: now,
    updatedAt: now,
  };

  visitors.push(newVisitor);
  return newVisitor;
};

const updateVisitor = (id, visitorData) => {
  const index = visitors.findIndex((v) => v.id === id);
  if (index === -1) return null;

  const updatedVisitor = {
    ...visitors[index],
    ...visitorData,
    roomOrUnit: visitorData.roomOrUnit || visitors[index].roomOrUnit,
    address: visitorData.address !== undefined ? visitorData.address : visitors[index].address,
    profilePicture: visitorData.profilePicture !== undefined ? visitorData.profilePicture : visitors[index].profilePicture,
    idPicture: visitorData.idPicture !== undefined ? visitorData.idPicture : visitors[index].idPicture,
    faceMatchScore: visitorData.faceMatchScore !== undefined ? visitorData.faceMatchScore : visitors[index].faceMatchScore,
    faceVerified: visitorData.faceVerified !== undefined ? visitorData.faceVerified : visitors[index].faceVerified,
    updatedAt: new Date().toISOString(),
  };
  visitors[index] = updatedVisitor;
  return updatedVisitor;
};

const checkInVisitor = (id) => {
  const visitor = findMockVisitorById(id);
  if (!visitor) return null;
  if (visitor.status === 'Checked In') return null;

  const updatedVisitor = {
    ...visitor,
    status: 'Checked In',
    checkInTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = visitors.findIndex((v) => v.id === id);
  visitors[index] = updatedVisitor;
  return updatedVisitor;
};

const checkOutVisitor = (id) => {
  const visitor = findMockVisitorById(id);
  if (!visitor) return null;
  if (visitor.status !== 'Checked In') return null;

  const updatedVisitor = {
    ...visitor,
    status: 'Checked Out',
    checkOutTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = visitors.findIndex((v) => v.id === id);
  visitors[index] = updatedVisitor;
  return updatedVisitor;
};

const cancelVisitor = (id) => {
  const visitor = findMockVisitorById(id);
  if (!visitor) return null;
  if (visitor.status === 'Cancelled') return null;

  const updatedVisitor = {
    ...visitor,
    status: 'Cancelled',
    updatedAt: new Date().toISOString(),
  };

  const index = visitors.findIndex((v) => v.id === id);
  visitors[index] = updatedVisitor;
  return updatedVisitor;
};

const deleteVisitor = (id) => {
  const index = visitors.findIndex((v) => v.id === id);
  if (index === -1) return null;

  const [removed] = visitors.splice(index, 1);
  return removed;
};

const searchVisitors = (query) => {
  if (!query) return [...visitors];
  const lowerQuery = query.toLowerCase();
  return visitors.filter(
    (v) =>
      v.firstName?.toLowerCase().includes(lowerQuery) ||
      v.lastName?.toLowerCase().includes(lowerQuery) ||
      v.company?.toLowerCase().includes(lowerQuery) ||
      v.roomOrUnit?.toLowerCase().includes(lowerQuery) ||
      v.address?.toLowerCase().includes(lowerQuery) ||
      v.referenceNumber?.toLowerCase().includes(lowerQuery) ||
      v.personToVisit?.toLowerCase().includes(lowerQuery)
  );
};

const filterVisitors = (filters) => {
  let results = [...visitors];

  if (filters.status) {
    results = results.filter((v) => v.status === filters.status);
  }
  if (filters.visitorType) {
    results = results.filter((v) => v.visitorType === filters.visitorType);
  }
  if (filters.department) {
    results = results.filter((v) => v.department === filters.department);
  }
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom).toISOString();
    results = results.filter((v) => v.registrationTimestamp >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo).toISOString();
    results = results.filter((v) => v.registrationTimestamp <= toDate);
  }

  return results;
};

const getVisitorsByDateRange = (dateFrom, dateTo) => {
  const start = new Date(dateFrom).toISOString();
  const end = new Date(dateTo).toISOString();
  return visitors.filter(
    (v) => v.registrationTimestamp >= start && v.registrationTimestamp <= end
  );
};

export {
  getAllVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  deleteVisitor,
  searchVisitors,
  filterVisitors,
  getVisitorsByDateRange,
};
