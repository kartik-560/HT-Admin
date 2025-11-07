'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Image as ImageIcon, X, ChevronDown, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ModalForm } from '@/components/ui/modal-form';
import { Input, Select, Textarea } from '@/components/forms/input';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const router = useRouter();
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
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories/tree/hierarchy')
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setSelectedCategories([]);
    setImageFiles([]);
    setExpandedCategories(new Set());
    reset({
      name: '',
      brand: '',
      originalPrice: '',
      discountPercentage: '',
      discountedPrice: '',
      stockStatus: '',
      status: 'active',
      note: '',
      material: '',
      color: '',
      seaterCount: '',
      warrantyPeriod: '',
      delivery: '',
      installation: '',
      productCareInstructions: '',
      returnAndCancellationPolicy: '',
      priceIncludesTax: false,
      shippingIncluded: false,
    });
    setModalOpen(true);
  };


  const handleEdit = (product) => {
    setEditingProduct(product);
    setSelectedCategories(product.categoryIds || []);
    setImageFiles([]);
    reset({
      name: product.name,
      brand: product.brand,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      discountPercentage: product.discountPercentage,
      stockStatus: product.stockStatus,
      note: product.note,
      material: product.material,
      color: product.color,
      seaterCount: product.seaterCount,
      warrantyPeriod: product.warrantyPeriod,
      delivery: product.delivery,
      installation: product.installation,
      productCareInstructions: product.productCareInstructions,
      returnAndCancellationPolicy: product.returnAndCancellationPolicy,
      priceIncludesTax: product.priceIncludesTax,
      shippingIncluded: product.shippingIncluded,
      status: product.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      await api.delete(`/products/${product.id}`);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const handleStatusToggle = async (product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';

      await api.put(`/products/${product.id}`, {
        status: newStatus,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success(`Product marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('Error updating status:', error);
    }
  };

  const toggleExpandCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data) => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    if (!editingProduct && imageFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append('name', data.name);
      formData.append('brand', data.brand || '');
      formData.append('originalPrice', parseFloat(data.originalPrice) || 0);
      formData.append('discountedPrice', parseFloat(data.discountedPrice) || 0);
      formData.append('discountPercentage', parseFloat(data.discountPercentage) || 0);
      formData.append('stockStatus', data.stockStatus);
      formData.append('note', data.note || '');
      formData.append('material', data.material || '');
      formData.append('color', data.color || '');
      formData.append('seaterCount', data.seaterCount ? parseInt(data.seaterCount) : null);
      formData.append('warrantyPeriod', data.warrantyPeriod || '');
      formData.append('delivery', data.delivery || '');
      formData.append('installation', data.installation || '');
      formData.append('productCareInstructions', data.productCareInstructions || '');
      formData.append('returnAndCancellationPolicy', data.returnAndCancellationPolicy || '');
      formData.append('priceIncludesTax', data.priceIncludesTax || false);
      formData.append('shippingIncluded', data.shippingIncluded || false);
      formData.append('status', data.status || 'active');

      selectedCategories.forEach((categoryId) => {
        formData.append('categoryIds', categoryId);
      });

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Product created successfully');
      }

      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);

      if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryInfo = (categoryIds) => {
    const parentCategories = [];
    const subCategories = [];
    const seenParents = new Set();
    const seenSubs = new Set();

    categoryIds.forEach(catId => {
      const searchCategory = (cats) => {
        for (let cat of cats) {
          if (cat.id === catId) {
            if (cat.children && cat.children.length > 0) {
              if (!seenParents.has(cat.name)) {
                parentCategories.push(cat.name);
                seenParents.add(cat.name);
              }
            } else if (cat.parentId) {
              if (!seenSubs.has(cat.name)) {
                subCategories.push(cat.name);
                seenSubs.add(cat.name);
              }
            }
            return;
          }
          if (cat.children) {
            for (let child of cat.children) {
              if (child.id === catId) {
                if (!seenParents.has(cat.name)) {
                  parentCategories.push(cat.name);
                  seenParents.add(cat.name);
                }
                if (!seenSubs.has(child.name)) {
                  subCategories.push(child.name);
                  seenSubs.add(child.name);
                }
                return;
              }
            }
          }
        }
      };
      searchCategory(categories);
    });

    return { parentCategories, subCategories };
  };

  const filteredProducts = products.filter(product => {
    if (activeTab === 'active') return product.status === 'active';
    if (activeTab === 'inactive') return product.status === 'inactive';
    return true;
  });

  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (name, row) => (
        <button
          onClick={() => router.push(`/admin/products/${row.id}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {name}
        </button>
      )
    },
    { key: 'brand', label: 'Brand', sortable: true },
    {
      key: 'originalPrice',
      label: 'Original Price',
      render: (price) => `₹${parseFloat(price || 0).toFixed(2)}`
    },
    {
      key: 'discountedPrice',
      label: 'Discounted Price',
      render: (price) => `₹${parseFloat(price || 0).toFixed(2)}`
    },
    {
      key: 'discountPercentage',
      label: 'Discount',
      render: (discount) => `${discount || 0}%`
    },
    {
      key: 'stockStatus',
      label: 'Stock Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${status === 'In Stock'
          ? 'bg-green-100 text-green-800'
          : status === 'Low Stock'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {status || 'Unknown'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'active'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'parentCategories',
      label: 'Categories',
      render: (_, row) => {
        if (!row.categoryIds || row.categoryIds.length === 0) return 'No categories';
        const { parentCategories } = getCategoryInfo(row.categoryIds);
        return parentCategories.length > 0 ? parentCategories.join(', ') : 'N/A';
      }
    },
    {
      key: 'subCategories',
      label: 'Subcategories',
      render: (_, row) => {
        if (!row.categoryIds || row.categoryIds.length === 0) return 'No subcategories';
        const { subCategories } = getCategoryInfo(row.categoryIds);
        return subCategories.length > 0
          ? <span className="text-blue-600 font-medium">{subCategories.join(', ')}</span>
          : 'N/A';
      }
    }
  ];



  const stockOptions = [
    { value: 'In Stock', label: 'In Stock' },
    { value: 'Low Stock', label: 'Low Stock' },
    { value: 'Out of Stock', label: 'Out of Stock' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const CategoryTreeItem = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <div key={category.id}>
        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpandCategory(category.id)}
              className="p-0 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCategoryToggle(category.id)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />

          <span className={`text-sm flex-1 ${level === 0
            ? 'text-gray-900 font-semibold'
            : 'text-blue-600 font-medium'
            }`}>
            {level > 0 && <span className="text-gray-400 mr-2">{'└─'}</span>}
            {category.name}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1">
            {category.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Products
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your product inventory
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center sm:justify-start gap-2 font-medium text-sm sm:text-base"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Active ({products.filter(p => p.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'inactive'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Inactive ({products.filter(p => p.status === 'inactive').length})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              onStatusToggle={handleStatusToggle}
            />
          </div>
        </div>

        <ModalForm
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingProduct ? 'Edit Product' : 'Create Product'}
          onSubmit={handleSubmit(handleFormSubmit)}
          loading={submitting}
        >
          <div className="space-y-4 md:space-y-5 max-h-96 overflow-y-auto">
            <Input
              label="Product Name *"
              placeholder="Enter product name"
              type="text"
              {...register('name', { required: 'Product name is required' })}
              error={errors.name?.message}
            />

            <Input
              label="Brand"
              placeholder="Enter brand name"
              type="text"
              {...register('brand')}
              error={errors.brand?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Original Price *"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('originalPrice', { required: 'Original price is required' })}
                error={errors.originalPrice?.message}
              />

              <Input
                label="Discounted Price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('discountedPrice')}
                error={errors.discountedPrice?.message}
              />

              <Input
                label="Discount %"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                {...register('discountPercentage')}
                error={errors.discountPercentage?.message}
              />
            </div>

            <Select
              label="Stock Status *"
              options={[{ value: '', label: 'Select Status' }, ...stockOptions]}
              {...register('stockStatus', { required: 'Stock status is required' })}
              error={errors.stockStatus?.message}
            />

            <Select
              label="Product Status"
              options={statusOptions}
              {...register('status')}
              error={errors.status?.message}
            />

            <Textarea
              label="Description/Note"
              placeholder="Enter product description"
              {...register('note')}
              error={errors.note?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Material"
                placeholder="e.g., Wood, Leather"
                type="text"
                {...register('material')}
                error={errors.material?.message}
              />

              <Input
                label="Color"
                placeholder="e.g., Black, Brown"
                type="text"
                {...register('color')}
                error={errors.color?.message}
              />

              <Input
                label="Seater Count"
                type="number"
                placeholder="For furniture"
                {...register('seaterCount')}
                error={errors.seaterCount?.message}
              />

              <Input
                label="Warranty Period"
                placeholder="e.g., 1 year"
                type="text"
                {...register('warrantyPeriod')}
                error={errors.warrantyPeriod?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Delivery Info"
                placeholder="e.g., Free delivery"
                type="text"
                {...register('delivery')}
                error={errors.delivery?.message}
              />

              <Input
                label="Installation Info"
                placeholder="e.g., Free installation"
                type="text"
                {...register('installation')}
                error={errors.installation?.message}
              />
            </div>

            <Textarea
              label="Care Instructions"
              placeholder="Enter product care instructions"
              {...register('productCareInstructions')}
              error={errors.productCareInstructions?.message}
            />

            <Textarea
              label="Return & Cancellation Policy"
              placeholder="Enter return policy details"
              {...register('returnAndCancellationPolicy')}
              error={errors.returnAndCancellationPolicy?.message}
            />

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('priceIncludesTax')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Price includes tax</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('shippingIncluded')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Shipping included</span>
              </label>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categories & Subcategories *
              </label>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <CategoryTreeItem
                      key={category.id}
                      category={category}
                      level={0}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No categories available
                  </p>
                )}
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images {!editingProduct && '*'}
              </label>

              {imageFiles.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {Array.from(imageFiles).map((file, index) => (
                    <div
                      key={index}
                      className="relative group border border-gray-200 rounded p-2"
                    >
                      <p className="text-xs text-gray-600 truncate">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer block">
                <div className="flex justify-center mb-3">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upload product images
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  PNG, JPG up to 5 images
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </ModalForm>
      </div>
    </div>
  );
}
