import { STAFF_ROLES } from '../../shared/staffRoles.js';

// In-memory staff directory. There is no database, so changes reset on restart.
let staff = [
  {
    id: 'u-001',
    name: 'Admin User',
    email: 'admin@visitorreg.com',
    department: 'Operations',
    role: 'Administrator',
    active: true,
  },
  {
    id: 'u-002',
    name: 'Receptionist User',
    email: 'reception@visitorreg.com',
    department: 'Front Desk',
    role: 'Receptionist',
    active: true,
  },
  {
    id: 'u-003',
    name: 'Viewer User',
    email: 'viewer@visitorreg.com',
    department: 'Security',
    role: 'Viewer',
    active: true,
  },
];

const pad = (value) => String(value).padStart(3, '0');

const list = () => [...staff];

const create = (data) => {
  const highestId = staff.reduce(
    (highest, entry) => Math.max(highest, Number(entry.id.split('-')[1]) || 0),
    0
  );

  const entry = {
    id: `u-${pad(highestId + 1)}`,
    name: data.name.trim(),
    email: data.email.trim(),
    department: data.department || 'General',
    role: data.role || STAFF_ROLES.at(-1),
    active: data.active !== false,
  };

  staff.push(entry);
  return entry;
};

const toggleActive = (id) => {
  const index = staff.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  staff[index] = { ...staff[index], active: !staff[index].active };
  return staff[index];
};

export { list, create, toggleActive };
