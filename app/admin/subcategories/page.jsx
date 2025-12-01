'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Layers, FolderTree, Package, GitBranch, Edit2, Trash2 } from 'lucide-react';
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
      const response = await api.get('/categories');
      const allCategories = response.data || [];
      setCategories(allCategories);

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
    { 
      key: 'name', 
      label: 'Subcategory Name', 
      sortable: true,
      render: (name) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg">
            <Layers size={16} className="text-teal-600" />
          </div>
          <span className="font-semibold text-slate-900">{name}</span>
        </div>
      )
    },
    {
      key: 'parentId',
      label: 'Parent Category',
      render: (parentId) => {
        const parent = categories.find(c => c.id === parentId);
        return (
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-purple-600" />
            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-bold shadow-sm">
              {parent ? parent.name : 'Unknown'}
            </span>
          </div>
        );
      }
    },
    { 
      key: 'comment', 
      label: 'Description',
      render: (comment) => (
        <span className="text-slate-600 text-sm">{comment || '-'}</span>
      )
    }
  ];

  const parentOptions = categories
    .filter(c => !c.parentId)
    .map(c => ({ value: c.id, label: c.name }));

  // Calculate stats
  const categoriesWithSubs = new Set(subcategories.map(s => s.parentId)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-teal-600 mx-auto"></div>
            <Layers size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-teal-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-slate-700">Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg">
                  <Layers size={28} className="text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  Subcategories
                </h1>
              </div>
              <p className="text-slate-600 text-lg ml-14">
                Organize products within parent categories
              </p>
            </div>

            {/* Add Subcategory Button */}
            <button
              onClick={handleCreate}
              className="group relative px-6 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Add Subcategory</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Subcategories</p>
                  <p className="text-3xl font-bold text-slate-900">{subcategories.length}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Layers size={24} className="text-teal-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Parent Categories</p>
                  <p className="text-3xl font-bold text-slate-900">{categoriesWithSubs}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FolderTree size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Available Parents</p>
                  <p className="text-3xl font-bold text-slate-900">{parentOptions.length}</p>
                </div>
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <GitBranch size={24} className="text-cyan-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Display */}
        {subcategories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-teal-100 rounded-full blur-xl opacity-50"></div>
              <Layers size={64} className="relative text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No subcategories yet</h3>
            <p className="text-slate-600 mb-6">Start organizing by creating your first subcategory</p>
            
            {parentOptions.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <Package size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-amber-900 mb-1">No Parent Categories</p>
                    <p className="text-xs text-amber-700">Please create at least one parent category first before adding subcategories.</p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Subcategory
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
                  data={subcategories}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              </div>
            </div>

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="md:hidden space-y-4">
              {subcategories.map((subcategory) => {
                const parent = categories.find(c => c.id === subcategory.parentId);
                
                return (
                  <div 
                    key={subcategory.id}
                    className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
                  >
                    {/* Card Header with Icon */}
                    <div className="bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100 p-4 border-b border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Layers size={24} className="text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {subcategory.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <FolderTree size={14} className="text-purple-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-purple-700 truncate">
                              {parent ? parent.name : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      {/* Parent Category Badge */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Parent Category
                        </p>
                        <span className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg text-sm font-bold shadow-sm">
                          <FolderTree size={16} />
                          {parent ? parent.name : 'Unknown'}
                        </span>
                      </div>

                      {/* Description */}
                      {subcategory.comment && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Description
                          </p>
                          <p className="text-sm text-slate-700">
                            {subcategory.comment}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => handleEdit(subcategory)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                        >
                          <Edit2 size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(subcategory)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Modal Form */}
        <ModalForm
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSubcategory ? 'Edit Subcategory' : 'Create Subcategory'}
          onSubmit={handleSubmit(onSubmit)}
          loading={submitting}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-100 rounded-lg mt-0.5">
                  <Layers size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-teal-900 mb-1">Creating a Subcategory</p>
                  <p className="text-xs text-teal-700">Subcategories help organize products within a parent category for better navigation and filtering.</p>
                </div>
              </div>
            </div>

            <Input
              label="Subcategory Name *"
              placeholder="e.g., Office Chairs, Dining Tables"
              type="text"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />

            <div>
              <Select
                label="Parent Category *"
                options={[
                  { value: '', label: 'Select Parent Category' },
                  ...parentOptions
                ]}
                {...register('parentId', { required: 'Parent category is required' })}
                error={errors.parentId?.message}
              />
              {parentOptions.length === 0 && (
                <p className="mt-2 text-xs text-amber-600 font-medium">
                  ⚠️ No parent categories available. Please create a parent category first.
                </p>
              )}
            </div>

            <Textarea
              label="Description"
              placeholder="Enter optional description or notes"
              rows={3}
              {...register('comment')}
              error={errors.comment?.message}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <GitBranch size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 font-medium">
                  💡 Tip: Use clear, descriptive names for subcategories to help customers find products easily.
                </p>
              </div>
            </div>
          </div>
        </ModalForm>
      </div>
    </div>
  );
}
