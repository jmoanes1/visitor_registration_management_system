import { create, list, toggleActive } from '../services/staff.js';
import { STAFF_ROLES } from '../../shared/staffRoles.js';
import httpError from '../utils/httpError.js';

const notFound = () => httpError(404, 'Staff member not found');

const listStaff = (req, res) => {
  res.json({ success: true, data: list() });
};

const createStaff = (req, res) => {
  const { name, email, role } = req.body || {};

  if (!name?.trim()) throw httpError(400, 'Full name is required');
  if (!email?.trim()) throw httpError(400, 'Email address is required');
  if (role && !STAFF_ROLES.includes(role)) {
    throw httpError(400, `Invalid role. Must be one of: ${STAFF_ROLES.join(', ')}`);
  }

  res.status(201).json({ success: true, data: create(req.body) });
};

const toggleStaff = (req, res) => {
  const entry = toggleActive(req.params.id);
  if (!entry) throw notFound();

  res.json({ success: true, data: entry });
};

export { listStaff, createStaff, toggleStaff };
