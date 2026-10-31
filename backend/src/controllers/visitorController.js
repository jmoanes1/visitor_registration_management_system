import {
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
} from '../services/visitorService.js';

const getVisitors = (req, res) => {
  const { search, status, visitorType, department, dateFrom, dateTo } = req.query;

  let results = getAllVisitors();

  if (search) {
    results = searchVisitors(search);
  }

  if (status || visitorType || department || dateFrom || dateTo) {
    results = filterVisitors({ status, visitorType, department, dateFrom, dateTo });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginated = results.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page,
      limit,
      total: results.length,
      totalPages: Math.ceil(results.length / limit),
    },
  });
};

const getVisitor = (req, res) => {
  const visitor = getVisitorById(req.params.id);
  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, data: visitor });
};

const createVisitorEntry = (req, res) => {
  const visitor = createVisitor(req.body);
  res.status(201).json({ success: true, data: visitor });
};

const updateVisitorEntry = (req, res) => {
  const visitor = updateVisitor(req.params.id, req.body);
  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, data: visitor });
};

const checkIn = (req, res) => {
  const visitor = checkInVisitor(req.params.id);
  if (!visitor) {
    const error = new Error('Visitor not found or already checked in');
    error.statusCode = 400;
    throw error;
  }
  res.json({ success: true, data: visitor });
};

const checkOut = (req, res) => {
  const visitor = checkOutVisitor(req.params.id);
  if (!visitor) {
    const error = new Error('Visitor not found or not checked in');
    error.statusCode = 400;
    throw error;
  }
  res.json({ success: true, data: visitor });
};

const cancel = (req, res) => {
  const visitor = cancelVisitor(req.params.id);
  if (!visitor) {
    const error = new Error('Visitor not found or already cancelled');
    error.statusCode = 400;
    throw error;
  }
  res.json({ success: true, data: visitor });
};

const deleteVisitorEntry = (req, res) => {
  const visitor = deleteVisitor(req.params.id);
  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, data: visitor });
};

export {
  getVisitors,
  getVisitor,
  createVisitorEntry,
  updateVisitorEntry,
  checkIn,
  checkOut,
  cancel,
  deleteVisitorEntry,
};
