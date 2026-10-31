let staff = [
  {
    id: 'u-001',
    name: 'Admin User',
    email: 'admin@visitorreg.com',
    role: 'Administrator',
    active: true,
  },
  {
    id: 'u-002',
    name: 'Receptionist User',
    email: 'reception@visitorreg.com',
    role: 'Receptionist',
    active: true,
  },
  {
    id: 'u-003',
    name: 'Viewer User',
    email: 'viewer@visitorreg.com',
    role: 'Viewer',
    active: true,
  },
];

const getAllStaff = () => [...staff];

const getStaffById = (id) => staff.find((s) => s.id === id);

const createStaff = (staffData) => {
  const maxId =
    staff.length > 0 ? Math.max(...staff.map((s) => parseInt(s.id.split('-')[1]))) : 0;
  const newId = `u-${String(maxId + 1).padStart(3, '0')}`;

  const newStaff = {
    id: newId,
    name: staffData.name,
    email: staffData.email,
    role: staffData.role,
    active: staffData.active !== false,
  };
  staff.push(newStaff);
  return newStaff;
};

const updateStaff = (id, staffData) => {
  const index = staff.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedStaff = { ...staff[index], ...staffData };
  staff[index] = updatedStaff;
  return updatedStaff;
};

const toggleStaffStatus = (id) => {
  const index = staff.findIndex((s) => s.id === id);
  if (index === -1) return null;

  staff[index].active = !staff[index].active;
  return staff[index];
};

export { getAllStaff, getStaffById, createStaff, updateStaff, toggleStaffStatus };
