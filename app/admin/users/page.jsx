'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
  const { toast } = useToast();

  const {
    register: registerForm,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
    formState: { errors: formErrors }
  } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

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
        await api.put(`/users/${editingUser.id}`, {
          name: data.name,
          phone: data.phone,
        });
        toast.success('User updated successfully');
      } else {
        await api.post('/users/register', {
          name: data.name,
          phone: data.phone,
          password: data.password,
        });
        toast.success('User created successfully');
      }

      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${editingUser ? 'update' : 'create'} user`);
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Users
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage user accounts
            </p>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium text-sm sm:text-base"
          >
            <Plus size={20} />
            <span>Add User</span>
          </button>
        </div>

        {/* Data Table Wrapper */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>

        {/* User Form Modal */}
        <ModalForm
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingUser ? 'Edit User' : 'Create User'}
          onSubmit={handleFormSubmit(onSubmit)}
          loading={submitting}
        >
          <div className="space-y-4 md:space-y-5">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              type="text"
              {...registerForm('name', { required: 'Name is required' })}
              error={formErrors.name?.message}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="Enter phone number"
              {...registerForm('phone', { required: 'Phone is required' })}
              error={formErrors.phone?.message}
            />

            {!editingUser && (
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                {...registerForm('password', { required: 'Password is required' })}
                error={formErrors.password?.message}
              />
            )}
          </div>
        </ModalForm>
      </div>
    </div>
  );
}
