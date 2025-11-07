'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ModalForm } from '@/components/ui/modal-form';
import { Input, Textarea } from '@/components/forms/input';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState([]);
  const [rootCategories, setRootCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const allCats = response.data || [];
      setAllCategories(allCats);

      // Filter only root categories (no parentId)
      const roots = allCats.filter(c => !c.parentId);
      setRootCategories(roots);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    reset({
      name: '',
      comment: ''
    });
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      comment: category.comment || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      const hasSubcategories = allCategories.filter(c => c.parentId === category.id).length > 0;
      
      if (hasSubcategories) {
        const deleteAll = confirm(
          `This category has subcategories. Delete all of them as well?`
        );
        if (deleteAll) {
          await api.delete(`/categories/${category.id}?deleteChildren=true`);
          toast.success('Category and subcategories deleted successfully');
        } else {
          return;
        }
      } else {
        await api.delete(`/categories/${category.id}`);
        toast.success('Category deleted successfully');
      }
      
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        comment: data.comment || null,
        parentId: null // Always null for root categories
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created successfully');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category: ${errorMsg}`);
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Category Name', sortable: true },
    {
      key: 'children',
      label: 'Subcategories',
      render: (_, category) => {
        const childCount = allCategories.filter(c => c.parentId === category.id).length;
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {childCount}
          </span>
        );
      }
    },
    { key: 'comment', label: 'Comment' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Categories
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage main product categories
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-medium"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={rootCategories}
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
          title={editingCategory ? 'Edit Category' : 'Create Category'}
          onSubmit={handleSubmit(onSubmit)}
          loading={submitting}
        >
          <div className="space-y-4">
            <Input
              label="Category Name"
              placeholder="Enter category name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
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
