import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  RefreshCw,
  Search,
  Building2,
  Mail,
  Lock,
  X,
} from 'lucide-react';
import { staffService } from '../services/staffService.js';

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    role: 'staff',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffService.getAll();
      setStaffList(res.data.data || []);
    } catch (err) {
      console.error('Failed to load staff list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleActive = async (id) => {
    try {
      await staffService.toggle(id);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.password.trim()) {
      errs.password = 'Initial password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await staffService.create(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        department: 'Engineering',
        role: 'staff',
        password: '',
      });
      setErrors({});
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const query = search.toLowerCase();
    const matchesSearch =
      s.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.department?.toLowerCase().includes(query);
    const matchesRole = roleFilter ? s.role?.toLowerCase() === roleFilter.toLowerCase() : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Staff & Host Directory
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage authorized staff members, host permissions, and user accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStaff}
            className="btn-secondary !w-10 !p-0 justify-center"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            <UserPlus size={15} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card !p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search staff by name, email, or department..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="select-field !w-auto min-w-[140px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="staff">Staff Host</option>
            <option value="receptionist">Receptionist</option>
          </select>

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

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#CBD5E1] border-t-[#1E3A5F]" />
            <p className="text-xs text-[#64748B]">Loading staff directory...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="text-sm font-semibold text-[#0F172A]">No staff members found</p>
            <p className="text-xs text-[#64748B]">Try searching with a different term.</p>
          </div>
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
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#F1F5F9] transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#1E3A5F] font-bold text-xs flex items-center justify-center border border-[#E2E8F0]">
                          {staff.name?.slice(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">{staff.name}</p>
                          <p className="text-[11px] text-[#64748B]">{staff.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap text-[#475569]">
                      {staff.department || 'General'}
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1E3A5F] capitalize">
                        <Shield size={11} />
                        {staff.role}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {staff.active !== false ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleToggleActive(staff.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                          staff.active !== false
                            ? 'text-[#DC2626] border-[#DC2626]/30 hover:bg-rose-50'
                            : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        {staff.active !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="bg-white rounded-xl shadow-card max-w-md w-full border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
              <h3 className="text-base font-bold text-[#0F172A]">Add New Staff Member</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1E293B] mb-1.5">
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rachel Adams"
                  className={`input-field ${errors.name ? '!border-[#DC2626]' : ''}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-[11px] text-[#DC2626] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#1E293B] mb-1.5">
                  Email Address <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="rachel.adams@visitorreg.com"
                  className={`input-field ${errors.email ? '!border-[#DC2626]' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-[11px] text-[#DC2626] mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">
                    Department
                  </label>
                  <select
                    className="select-field"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">
                    Role & Permission
                  </label>
                  <select
                    className="select-field"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="staff">Staff / Host</option>
                    <option value="admin">Administrator</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1E293B] mb-1.5">
                  Temporary Password <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className={`input-field ${errors.password ? '!border-[#DC2626]' : ''}`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <p className="text-[11px] text-[#DC2626] mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary !h-9"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary !h-9"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
