'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Users as UsersIcon, UserCheck, UserPlus, Shield, Calendar, Lock, Eye, EyeOff, Edit2, Trash2, Phone } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ModalForm } from '@/components/ui/modal-form';
import { Input } from '@/components/forms/input';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const [currentUserRoleId, setCurrentUserRoleId] = useState(null);
  const {
    register: registerForm,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    watch,
    formState: { errors: formErrors }
  } = useForm();

  // Watch password fields for validation
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/profile/me');
      setCurrentUserId(response.data.id);
      setCurrentUserRoleId(response.data.roleId);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    resetForm({
      name: user.name,
      phone: user.phone,
    });
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingUser) {
        const updateData = {
          name: data.name,
          phone: data.phone,
        };

        // Only allow password update for current user
        if (editingUser.id === currentUserId && data.password) {
          if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match');
            setSubmitting(false);
            return;
          }
          updateData.password = data.password;
        }

        await api.put(`/users/${editingUser.id}`, updateData);
        toast.success('User updated successfully');
      } else {
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          setSubmitting(false);
          return;
        }

        await api.post('/users/register', {
          name: data.name,
          phone: data.phone,
          password: data.password,
        });
        toast.success('User created successfully');
      }

      setModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Failed to ${editingUser ? 'update' : 'create'} user: ${errorMsg}`);
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditingSelf = editingUser && editingUser.id === currentUserId;
  const isAdmin = currentUserRoleId === 1;

  const canEditUser = (user) =>
    isAdmin || user.id === currentUserId;

  const canDeleteUser = (user) =>
    isAdmin && user.id !== currentUserId;


  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (name, user) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
              {name?.charAt(0).toUpperCase()}
            </div>
            {user.id === currentUserId && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="You" />
            )}
          </div>
          <div>
            <span className="font-semibold text-slate-900">{name}</span>
            {user.id === currentUserId && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">You</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (phone) => (
        <span className="text-slate-700 font-medium">{phone}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-slate-600 text-sm">
            {date ? new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => {
        const canEdit = canEditUser(user);
        const canDelete = canDeleteUser(user);

        return (
          <div className="flex gap-2">
            <button
              onClick={canEdit ? () => handleEdit(user) : undefined}
              disabled={!canEdit}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1
            ${canEdit
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              title={canEdit ? 'Edit user' : 'You can only edit your own profile'}
            >
              <Edit2 size={14} />
              Edit
            </button>

            <button
              onClick={canDelete ? () => handleDelete(user) : undefined}
              disabled={!canDelete}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1
            ${canDelete
                  ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              title={
                canDelete
                  ? 'Delete user'
                  : user.id === currentUserId
                    ? 'You cannot delete your own account'
                    : 'Only admin can delete users'
              }
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        );
      }
    }

  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-indigo-600 mx-auto"></div>
            <UsersIcon size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-slate-700">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-lg">
                  <UsersIcon size={28} className="text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  User Management
                </h1>
              </div>
              <p className="text-slate-600 text-lg ml-14">
                Manage user accounts and access control
              </p>
            </div>

            {/* Add User Button */}
            {isAdmin && (
              <button
                onClick={handleCreate}
                className="group relative px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2.5"
              >
                <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Add User</span>
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <UsersIcon size={24} className="text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">{users.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">New This Month</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {users.filter(u => {
                      if (!u.createdAt) return false;
                      const created = new Date(u.createdAt);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() &&
                        created.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserPlus size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Display */}
        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50"></div>
              <UsersIcon size={64} className="relative text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No users yet</h3>
            <p className="text-slate-600 mb-6">Start by adding your first user to the system</p>
            {isAdmin && (
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add User
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={users}
                  loading={loading}
                  showActions={false}
                />
              </div>
            </div>

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="md:hidden space-y-4">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className={`p-4 border-b border-slate-200 ${isCurrentUser
                      ? 'bg-gradient-to-r from-green-100 via-emerald-100 to-green-100'
                      : 'bg-gradient-to-r from-indigo-100 via-blue-100 to-indigo-100'
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          {isCurrentUser && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <UserCheck size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {user.name}
                          </h3>
                          {isCurrentUser && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                              <UserCheck size={12} />
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      {/* Phone Number */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Phone Number
                        </p>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-indigo-600" />
                          <span className="text-sm font-semibold text-slate-900">{user.phone}</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Member Since
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          <Edit2 size={16} />
                          <span>Edit</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* User Form Modal */}
        <ModalForm
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
          title={editingUser ? 'Edit User' : 'Create User'}
          onSubmit={handleFormSubmit(onSubmit)}
          loading={submitting}
        >
          <div className="space-y-6">
            {!editingUser && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg mt-0.5">
                    <Shield size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900 mb-1">Creating New User</p>
                    <p className="text-xs text-indigo-700">All new users will have standard access. You can modify permissions after creation.</p>
                  </div>
                </div>
              </div>
            )}

            {isEditingSelf && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                    <Lock size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">Editing Your Account</p>
                    <p className="text-xs text-green-700">You can update your own password. Other users passwords can only be changed by them.</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Input
                label="Full Name *"
                placeholder="Enter full name"
                type="text"
                blockDigits
                {...registerForm('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  validate: (v) => (!/\d/.test((v || '').trim()) || 'Name cannot contain numbers')
                })}
                error={formErrors.name?.message}
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Enter the users full name as it should appear in the system
              </p>
            </div>

            <div>
              <Input
                label="Phone Number *"
                placeholder="Enter phone number"
                numericOnly
                maxLength={10}
                {...registerForm('phone', {
                  required: 'Phone is required',
                  validate: (v) =>
                    /^\d{10}$/.test(v || '') || 'Enter a valid 10-digit phone number'
                })}
                error={formErrors.phone?.message}
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Phone number will be used for authentication and notifications
              </p>
            </div>

            {/* Password Fields */}
            {(!editingUser || isEditingSelf) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password {!editingUser && '*'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={editingUser ? "Enter new password (leave blank to keep current)" : "Enter secure password"}
                      {...registerForm('password', !editingUser ? {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      } : {
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      error={formErrors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {editingUser
                      ? "Leave blank to keep current password. Minimum 6 characters if changing."
                      : "Choose a strong password with at least 6 characters"
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password {!editingUser && '*'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={editingUser ? "Confirm new password" : "Confirm password"}
                      {...registerForm('confirmPassword', !editingUser ? {
                        required: 'Please confirm password',
                        validate: value => value === password || 'Passwords do not match'
                      } : {
                        validate: value => !password || value === password || 'Passwords do not match'
                      })}
                      error={formErrors.confirmPassword?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && confirmPassword && password === confirmPassword && (
                    <p className="mt-1.5 text-xs text-green-600 font-medium flex items-center gap-1">
                      <UserCheck size={14} /> Passwords match
                    </p>
                  )}
                </div>
              </>
            )}

            {editingUser && !isEditingSelf && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 font-medium">
                    🔒 Security Policy: Only users can update their own passwords. This user must change their password through their own account settings.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <UserCheck size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 font-medium">
                  💡 Tip: Ensure all user information is accurate before saving. {!editingUser && 'Users will receive access immediately upon creation.'}
                </p>
              </div>
            </div>
          </div>
        </ModalForm>
      </div>
    </div>
  );
}
