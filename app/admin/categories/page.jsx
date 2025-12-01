'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, FolderTree, Image as ImageIcon, Trash2, Edit2, Package } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ModalForm } from '@/components/ui/modal-form';
import { Input, Textarea } from '@/components/forms/input';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';

function CategoriesPage() {
  const [allCategories, setAllCategories] = useState([]);
  const [rootCategories, setRootCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
    setImageFile(null);
    setImagePreview(null);
    reset({
      name: '',
      comment: ''
    });
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setImageFile(null);
    setImagePreview(category.imageUrl || null);
    reset({
      name: category.name,
      comment: category.comment || ''
    });
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('comment', data.comment || '');
      formData.append('parentId', '');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Category created successfully');
      }

      setModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
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
    {
      key: 'imageUrl',
      label: 'Image',
      render: (_, category) => {
        return category.imageUrl ? (
          <div className="relative group">
            <img 
              src={category.imageUrl} 
              alt={category.name}
              className="w-16 h-16 object-cover rounded-xl shadow-md border-2 border-slate-200 group-hover:border-blue-400 transition-all"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm border-2 border-slate-200">
            <ImageIcon size={24} className="text-slate-400" />
          </div>
        );
      }
    },
    { 
      key: 'name', 
      label: 'Category Name', 
      sortable: true,
      render: (name) => (
        <span className="font-semibold text-slate-900">{name}</span>
      )
    },
    {
      key: 'children',
      label: 'Subcategories',
      render: (_, category) => {
        const childCount = allCategories.filter(c => c.parentId === category.id).length;
        return (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
              childCount > 0 
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {childCount}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <FolderTree size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-slate-700">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <FolderTree size={28} className="text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  Category Management
                </h1>
              </div>
              <p className="text-slate-600 text-lg ml-14">
                Organize and manage your product categories
              </p>
            </div>

            {/* Add Category Button */}
            <button
              onClick={handleCreate}
              className="group relative px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-slate-900">{rootCategories.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FolderTree size={24} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Subcategories</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {allCategories.filter(c => c.parentId).length}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Package size={24} className="text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Display */}
        {rootCategories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-purple-100 rounded-full blur-xl opacity-50"></div>
              <FolderTree size={64} className="relative text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No categories yet</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first category</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Category
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
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

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="md:hidden space-y-4">
              {rootCategories.map((category) => {
                const childCount = allCategories.filter(c => c.parentId === category.id).length;
                
                return (
                  <div 
                    key={category.id}
                    className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
                  >
                    {/* Card Header with Image */}
                    <div className="relative">
                      {category.imageUrl ? (
                        <div className="relative h-40 overflow-hidden">
                          <img 
                            src={category.imageUrl} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 flex items-center justify-center">
                          <ImageIcon size={48} className="text-purple-300" />
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      {/* Category Name */}
                      <h3 className="text-lg font-bold text-slate-900">
                        {category.name}
                      </h3>

                      {/* Description */}
                      {category.comment && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {category.comment}
                        </p>
                      )}

                      {/* Subcategories Count */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">Subcategories:</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          childCount > 0 
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {childCount}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <Edit2 size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
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
          onClose={() => {
            setModalOpen(false);
            setImageFile(null);
            setImagePreview(null);
          }}
          title={editingCategory ? 'Edit Category' : 'Create Category'}
          onSubmit={handleSubmit(onSubmit)}
          loading={submitting}
        >
          <div className="space-y-6">
            <Input
              label="Category Name *"
              placeholder="Enter category name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />

            <Textarea
              label="Description"
              placeholder="Enter optional description"
              rows={3}
              {...register('comment')}
              error={errors.comment?.message}
            />

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Category Image
              </label>
              
              {imagePreview ? (
                <div className="relative inline-block group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-2xl border-4 border-slate-200 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-2 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg transform hover:scale-110 transition-all"
                  >
                    <X size={18} />
                  </button>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-2xl transition-all" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-gradient-to-br from-slate-50 to-blue-50 hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                    <div className="flex flex-col items-center justify-center pt-7 pb-7">
                      <div className="p-4 bg-blue-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="w-10 h-10 text-blue-600" />
                      </div>
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        <span className="text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium">
                  💡 Tip: Images are displayed for parent categories. Choose clear, high-quality images for best results.
                </p>
              </div>
            </div>
          </div>
        </ModalForm>
      </div>
    </div>
  );
}

export default CategoriesPage;
