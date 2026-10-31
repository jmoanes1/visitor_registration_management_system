import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
} from '../services/staffService.js';

const getStaff = (req, res) => {
  const staff = getAllStaff();
  res.json({ success: true, data: staff });
};

const getStaffEntry = (req, res) => {
  const staff = getStaffById(req.params.id);
  if (!staff) {
    const error = new Error('Staff not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, data: staff });
};

const createStaffEntry = (req, res) => {
  const staff = createStaff(req.body);
  res.status(201).json({ success: true, data: staff });
};

const updateStaffEntry = (req, res) => {
  const staff = updateStaff(req.params.id, req.body);
  if (!staff) {
    const error = new Error('Staff not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, data: staff });
};

const toggleStaff = (req, res) => {
  const staff = toggleStaffStatus(req.params.id);
  if (!staff) {
    const error = new Error('Staff not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, data: staff });
};

export { getStaff, getStaffEntry, createStaffEntry, updateStaffEntry, toggleStaff };
