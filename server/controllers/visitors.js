import {
  list,
  findById,
  create,
  update,
  checkIn,
  checkOut,
  cancel,
  remove,
} from '../services/visitors.js';
import httpError from '../utils/httpError.js';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const positiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const visitorNotFound = () => httpError(404, 'Visitor not found');

const listVisitors = (req, res) => {
  const { page, limit, ...filters } = req.query;

  const results = list(filters);
  const pageSize = Math.min(positiveNumber(limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const currentPage = positiveNumber(page, 1);
  const start = (currentPage - 1) * pageSize;

  res.json({
    success: true,
    data: results.slice(start, start + pageSize),
    pagination: {
      page: currentPage,
      limit: pageSize,
      total: results.length,
      totalPages: Math.ceil(results.length / pageSize),
    },
  });
};

const getVisitor = (req, res) => {
  const visitor = findById(req.params.id);
  if (!visitor) throw visitorNotFound();

  res.json({ success: true, data: visitor });
};

const createVisitor = (req, res) => {
  res.status(201).json({ success: true, data: create(req.body || {}) });
};

const updateVisitor = (req, res) => {
  const visitor = update(req.params.id, req.body || {});
  if (!visitor) throw visitorNotFound();

  res.json({ success: true, data: visitor });
};

// Each visit action returns 404 for a missing record and 409 when the record is
// not in a state that allows the change.
const visitAction = (id, apply, conflictMessage) => {
  if (!findById(id)) throw visitorNotFound();

  const visitor = apply(id);
  if (!visitor) throw httpError(409, conflictMessage);

  return visitor;
};

const checkInVisitor = (req, res) => {
  const visitor = visitAction(req.params.id, checkIn, 'Visitor is already checked in');
  res.json({ success: true, data: visitor });
};

const checkOutVisitor = (req, res) => {
  const visitor = visitAction(req.params.id, checkOut, 'Visitor is not checked in');
  res.json({ success: true, data: visitor });
};

const cancelVisitor = (req, res) => {
  const visitor = visitAction(req.params.id, cancel, 'Visit is already cancelled');
  res.json({ success: true, data: visitor });
};

const deleteVisitor = (req, res) => {
  const visitor = remove(req.params.id);
  if (!visitor) throw visitorNotFound();

  res.json({ success: true, data: visitor });
};

export {
  listVisitors,
  getVisitor,
  createVisitor,
  updateVisitor,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  deleteVisitor,
};
