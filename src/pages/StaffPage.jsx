import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck, UserPlus } from 'lucide-react';
import Avatar from '@/components/Avatar.jsx';
import Badge from '@/components/Badge.jsx';
import EmptyState from '@/components/EmptyState.jsx';
import { SelectField, TextField } from '@/components/FormFields.jsx';
import Loading from '@/components/Loading.jsx';
import Modal from '@/components/Modal.jsx';
import PageHeader from '@/components/PageHeader.jsx';
import { staffApi } from '@/services/staff.js';
import { STAFF_ROLES } from '@shared/staffRoles.js';
import { apiErrorMessage } from '@/utils/apiError.js';

const DEPARTMENTS = [
  'Engineering',
  'Operations',
  'Finance',
  'Product',
  'Design',
  'Front Desk',
  'Human Resources',
  'Security',
];

const emptyForm = { name: '', email: '', department: 'Operations', role: 'Receptionist' };

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await staffApi.list();
      setStaff(response.data.data || []);
    } catch (error) {
      alert(apiErrorMessage(error, 'Failed to load the staff directory'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const updateForm = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await staffApi.create(form);
      setIsFormOpen(false);
      setForm(emptyForm);
      setErrors({});
      await fetchStaff();
    } catch (error) {
      alert(apiErrorMessage(error, 'Failed to add the staff member'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (entry) => {
    try {
      await staffApi.toggleActive(entry.id);
      await fetchStaff();
    } catch (error) {
      alert(apiErrorMessage(error, 'Failed to update this account'));
    }
  };

  const visibleStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((entry) => {
      const matchesSearch =
        !query ||
        [entry.name, entry.email, entry.department].some((value) =>
          value?.toLowerCase().includes(query)
        );
      const matchesRole = !roleFilter || entry.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, search, roleFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Host Directory"
        description="Manage authorised staff members, host departments, and access roles."
        actions={
          <>
            <button
              type="button"
              onClick={fetchStaff}
              className="btn-secondary !w-10 !p-0 justify-center"
              title="Refresh"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button type="button" onClick={() => setIsFormOpen(true)} className="btn-primary">
              <UserPlus size={15} />
              <span>Add Staff Member</span>
            </button>
          </>
        }
      />

      <div className="card !p-4 flex flex-col md:flex-row gap-3">
        <TextField
          id="staff-search"
          label="Search"
          className="flex-1"
          placeholder="Name, email, or department"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex items-end gap-2">
          <SelectField
            id="staff-role-filter"
            label="Role"
            className="min-w-[160px]"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">All Roles</option>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </SelectField>

          {(search || roleFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setRoleFilter('');
              }}
              className="btn-secondary whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <Loading label="Loading staff directory..." />
        ) : visibleStaff.length === 0 ? (
          <EmptyState
            title="No staff members found"
            description="Try searching with a different term."
          />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-full divide-y divide-[#E2E8F0] text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] text-left font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="px-6 py-3.5">Staff Member</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {visibleStaff.map((entry) => {
                  const isActive = entry.active !== false;

                  return (
                    <tr key={entry.id} className="hover:bg-[#F1F5F9] transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={entry.name} />
                          <div>
                            <p className="font-semibold text-[#0F172A]">{entry.name}</p>
                            <p className="text-[11px] text-[#64748B]">{entry.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-[#475569]">
                        {entry.department || 'General'}
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Badge tone="navy" icon={ShieldCheck}>
                          {entry.role}
                        </Badge>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Badge tone={isActive ? 'emerald' : 'slate'} dot>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(entry)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                            isActive
                              ? 'text-[#DC2626] border-[#DC2626]/30 hover:bg-rose-50'
                              : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <Modal
          title="Add New Staff Member"
          subtitle="Entries populate the host list used when registering a visitor."
          onClose={() => setIsFormOpen(false)}
          width="max-w-md"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs" noValidate>
            <TextField
              id="staff-name"
              label="Full Name"
              required
              placeholder="e.g. Rachel Adams"
              value={form.name}
              onChange={updateForm('name')}
              error={errors.name}
            />

            <TextField
              id="staff-email"
              label="Email Address"
              type="email"
              required
              placeholder="rachel.adams@visitorreg.com"
              value={form.email}
              onChange={updateForm('email')}
              error={errors.email}
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                id="staff-department"
                label="Department"
                value={form.department}
                onChange={updateForm('department')}
              >
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </SelectField>

              <SelectField
                id="staff-role"
                label="Role & Permission"
                value={form.role}
                onChange={updateForm('role')}
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </SelectField>
            </div>

            <p className="text-[11px] text-[#64748B]">
              Sign-in uses the single admin account configured in .env, so no password is stored
              per staff member.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="btn-secondary !h-9"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="btn-primary !h-9">
                {isSaving ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StaffPage;
