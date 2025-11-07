'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ModalForm } from '@/components/ui/modal-form';
import { Input, Select, Textarea } from '@/components/forms/input';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all categories (flat list)
      const response = await api.get('/categories');
      const allCategories = response.data || [];
      setCategories(allCategories);

      // Filter only subcategories (those with parentId)
      const subs = allCategories.filter(
        cat => cat.parentId !== null && cat.parentId !== undefined
      );
      setSubcategories(subs);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubcategory(null);
    reset();
    setModalOpen(true);
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    reset({
      name: subcategory.name,
      parentId: subcategory.parentId,
      comment: subcategory.comment || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (subcategory) => {
    if (!confirm(`Are you sure you want to delete "${subcategory.name}"?`)) return;

    try {
      await api.delete(`/categories/${subcategory.id}`);
      toast.success('Subcategory deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subcategory');
      console.error('Error deleting subcategory:', error);
    }
  };

  const onSubmit = async (data) => {
    if (!data.parentId) {
      toast.error('Please select a parent category');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        parentId: data.parentId,
        comment: data.comment || null
      };

      if (editingSubcategory) {
        await api.put(`/categories/${editingSubcategory.id}`, payload);
        toast.success('Subcategory updated successfully');
      } else {
        await api.post('/categories', payload);
        toast.success('Subcategory created successfully');
      }

      setModalOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Failed to ${editingSubcategory ? 'update' : 'create'} subcategory: ${errorMsg}`);
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Subcategory Name', sortable: true },
    {
      key: 'parentId',
      label: 'Parent Category',
      render: (parentId) => {
        const parent = categories.find(c => c.id === parentId);
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {parent ? parent.name : 'Unknown'}
          </span>
        );
      }
    },
    { key: 'comment', label: 'Comment' }
  ];

  // Only show root categories (without parentId) as parent options
  const parentOptions = categories
    .filter(c => !c.parentId)
    .map(c => ({ value: c.id, label: c.name }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Sub-Categories
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage subcategories under parent categories
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-medium"
          >
            <Plus size={20} />
            <span>Add Subcategory</span>
          </button>
        </div>

        {/* Data Table Wrapper */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={subcategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>

        {/* Modal Form */}
        <ModalForm
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSubcategory ? 'Edit Subcategory' : 'Create Subcategory'}
          onSubmit={handleSubmit(onSubmit)}
          loading={submitting}
        >
          <div className="space-y-4 md:space-y-5">
            <Input
              label="Subcategory Name"
              placeholder="Enter subcategory name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />

            <Select
              label="Parent Category"
              options={[
                { value: '', label: 'Select Parent Category' },
                ...parentOptions
              ]}
              {...register('parentId', { required: 'Parent category is required' })}
              error={errors.parentId?.message}
            />

            <Textarea
              label="Comment"
              placeholder="Enter optional comment"
              {...register('comment')}
              error={errors.comment?.message}
            />
          </div>
        </ModalForm>
      </div>
    </div>
  );
}
