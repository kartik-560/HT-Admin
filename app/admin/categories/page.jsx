// 'use client';

// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { Plus } from 'lucide-react';
// import { DataTable } from '@/components/ui/data-table';
// import { ModalForm } from '@/components/ui/modal-form';
// import { Input, Textarea } from '@/components/forms/input';
// import { useToast } from '@/components/ui/toast';
// import api from '@/lib/axios';

// export default function CategoriesPage() {
//   const [allCategories, setAllCategories] = useState([]);
//   const [rootCategories, setRootCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const { toast } = useToast();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors }
//   } = useForm();

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await api.get('/categories');
//       const allCats = response.data || [];
//       setAllCategories(allCats);

//       // Filter only root categories (no parentId)
//       const roots = allCats.filter(c => !c.parentId);
//       setRootCategories(roots);
//     } catch (error) {
//       toast.error('Failed to fetch categories');
//       console.error('Error fetching categories:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = () => {
//     setEditingCategory(null);
//     reset({
//       name: '',
//       comment: ''
//     });
//     setModalOpen(true);
//   };

//   const handleEdit = (category) => {
//     setEditingCategory(category);
//     reset({
//       name: category.name,
//       comment: category.comment || ''
//     });
//     setModalOpen(true);
//   };

//   const handleDelete = async (category) => {
//     if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

//     try {
//       const hasSubcategories = allCategories.filter(c => c.parentId === category.id).length > 0;
      
//       if (hasSubcategories) {
//         const deleteAll = confirm(
//           `This category has subcategories. Delete all of them as well?`
//         );
//         if (deleteAll) {
//           await api.delete(`/categories/${category.id}?deleteChildren=true`);
//           toast.success('Category and subcategories deleted successfully');
//         } else {
//           return;
//         }
//       } else {
//         await api.delete(`/categories/${category.id}`);
//         toast.success('Category deleted successfully');
//       }
      
//       fetchCategories();
//     } catch (error) {
//       toast.error('Failed to delete category');
//       console.error('Error deleting category:', error);
//     }
//   };

//   const onSubmit = async (data) => {
//     setSubmitting(true);
//     try {
//       const payload = {
//         name: data.name,
//         comment: data.comment || null,
//         parentId: null // Always null for root categories
//       };

//       if (editingCategory) {
//         await api.put(`/categories/${editingCategory.id}`, payload);
//         toast.success('Category updated successfully');
//       } else {
//         await api.post('/categories', payload);
//         toast.success('Category created successfully');
//       }

//       setModalOpen(false);
//       fetchCategories();
//     } catch (error) {
//       const errorMsg = error.response?.data?.error || error.message;
//       toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category: ${errorMsg}`);
//       console.error('Error submitting form:', error);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const columns = [
//     { key: 'name', label: 'Category Name', sortable: true },
//     {
//       key: 'children',
//       label: 'Subcategories',
//       render: (_, category) => {
//         const childCount = allCategories.filter(c => c.parentId === category.id).length;
//         return (
//           <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//             {childCount}
//           </span>
//         );
//       }
//     },
//     { key: 'comment', label: 'Comment' }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
//           <div>
//             <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
//               Categories
//             </h1>
//             <p className="text-sm sm:text-base text-gray-600 mt-1">
//               Manage main product categories
//             </p>
//           </div>
//           <button
//             onClick={handleCreate}
//             className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-medium"
//           >
//             <Plus size={20} />
//             <span>Add Category</span>
//           </button>
//         </div>

//         {/* Data Table */}
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <div className="overflow-x-auto">
//             <DataTable
//               columns={columns}
//               data={rootCategories}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               loading={loading}
//             />
//           </div>
//         </div>

//         {/* Modal Form */}
//         <ModalForm
//           isOpen={modalOpen}
//           onClose={() => setModalOpen(false)}
//           title={editingCategory ? 'Edit Category' : 'Create Category'}
//           onSubmit={handleSubmit(onSubmit)}
//           loading={submitting}
//         >
//           <div className="space-y-4">
//             <Input
//               label="Category Name"
//               placeholder="Enter category name"
//               type="text"
//               {...register('name', { required: 'Name is required' })}
//               error={errors.name?.message}
//             />

//             <Textarea
//               label="Comment"
//               placeholder="Enter optional comment"
//               {...register('comment')}
//               error={errors.comment?.message}
//             />
//           </div>
//         </ModalForm>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
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
          <img 
            src={category.imageUrl} 
            alt={category.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        );
      }
    },
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category Image
              </label>
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
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
              <p className="text-xs text-gray-500">
                Image is only for parent categories (not subcategories)
              </p>
            </div>
          </div>
        </ModalForm>
      </div>
    </div>
  );
}

// Explicit default export
export default CategoriesPage;


