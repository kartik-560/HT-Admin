'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, X, ChevronDown, ChevronRight, Package, DollarSign, Info, Palette, Shield, Truck } from 'lucide-react';
import { Input, Select, Textarea } from '@/components/forms/input';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';
import Image from 'next/image';

export default function EditProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/products/${params.id}`),
          api.get('/categories/tree/hierarchy')
        ]);

        const productData = productRes.data;
        setProduct(productData);
        setCategories(categoriesRes.data || []);
        setSelectedCategories(productData.categoryIds || []);
        setExistingImages(productData.imageUrls || []);

        reset({
          name: productData.name,
          brand: productData.brand,
          originalPrice: productData.originalPrice,
          discountedPrice: productData.discountedPrice,
          discountPercentage: productData.discountPercentage,
          stockStatus: productData.stockStatus,
          note: productData.note,
          material: productData.material,
          color: productData.color,
          seaterCount: productData.seaterCount,
          warrantyPeriod: productData.warrantyPeriod,
          delivery: productData.delivery,
          installation: productData.installation,
          productCareInstructions: productData.productCareInstructions,
          returnAndCancellationPolicy: productData.returnAndCancellationPolicy,
          priceIncludesTax: productData.priceIncludesTax,
          shippingIncluded: productData.shippingIncluded,
          status: productData.status,
        });
      } catch (error) {
        toast.error('Failed to fetch product data');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, reset, toast]);

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
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + imageFiles.length + files.length;
    
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed in total');
      const allowedCount = 5 - existingImages.length - imageFiles.length;
      setImageFiles([...imageFiles, ...files.slice(0, allowedCount)]);
    } else {
      setImageFiles([...imageFiles, ...files]);
    }
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleFormSubmit = async (data) => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error('Product must have at least one image');
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
      formData.append('seaterCount', data.seaterCount || '');
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

      formData.append('existingImageUrls', JSON.stringify(existingImages));

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.put(`/products/${params.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error('Failed to update product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const CategoryTreeItem = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <div key={category.id}>
        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200">
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpandCategory(category.id)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCategoryToggle(category.id)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />

          <span className={`text-sm flex-1 ${
            level === 0 ? 'text-gray-900 font-semibold' : 'text-blue-600 font-medium'
          }`}>
            {level > 0 && <span className="text-gray-400 mr-2">{'└─'}</span>}
            {category.name}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1 mt-1">
            {category.children.map((child) => (
              <CategoryTreeItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const stockOptions = [
    { value: 'In Stock', label: 'In Stock' },
    { value: 'Low Stock', label: 'Low Stock' },
    { value: 'Out of Stock', label: 'Out of Stock' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Package size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading product...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + imageFiles.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Gradient */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Products</span>
          </button>
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Package size={28} />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">Edit Product</h1>
            </div>
            <p className="text-indigo-100 text-lg ml-14">Update product details and information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="space-y-5">
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

              <Textarea
                label="Description/Note"
                placeholder="Enter detailed product description"
                rows={4}
                {...register('note')}
                error={errors.note?.message}
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pricing & Stock</h2>
            </div>
            
            <div className="space-y-5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('priceIncludesTax')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Price includes tax</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('shippingIncluded')}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Shipping included in price</span>
                </label>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Product Specifications</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Material"
                placeholder="e.g., Wood, Leather, Metal"
                type="text"
                {...register('material')}
                error={errors.material?.message}
              />

              <Input
                label="Color"
                placeholder="e.g., Black, Brown, White"
                type="text"
                {...register('color')}
                error={errors.color?.message}
              />

              <Input
                label="Seater Count"
                type="number"
                placeholder="e.g., 3 for sofa"
                {...register('seaterCount')}
                error={errors.seaterCount?.message}
              />

              <Input
                label="Warranty Period"
                placeholder="e.g., 1 year, 2 years"
                type="text"
                {...register('warrantyPeriod')}
                error={errors.warrantyPeriod?.message}
              />
            </div>
          </div>

          {/* Delivery & Services */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Truck size={20} className="text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delivery & Services</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Delivery Info"
                placeholder="e.g., Free delivery in 3-5 days"
                type="text"
                {...register('delivery')}
                error={errors.delivery?.message}
              />

              <Input
                label="Installation Info"
                placeholder="e.g., Free installation included"
                type="text"
                {...register('installation')}
                error={errors.installation?.message}
              />
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield size={20} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Care & Policies</h2>
            </div>
            
            <div className="space-y-5">
              <Textarea
                label="Care Instructions"
                placeholder="Enter product care and maintenance instructions"
                rows={3}
                {...register('productCareInstructions')}
                error={errors.productCareInstructions?.message}
              />

              <Textarea
                label="Return & Cancellation Policy"
                placeholder="Enter return and cancellation policy details"
                rows={3}
                {...register('returnAndCancellationPolicy')}
                error={errors.returnAndCancellationPolicy?.message}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Categories & Subcategories *</h2>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <div className="max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <CategoryTreeItem key={category.id} category={category} level={0} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No categories available</p>
                  </div>
                )}
              </div>
            </div>
            
            {selectedCategories.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                </p>
              </div>
            )}
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <ImageIcon size={20} className="text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Product Images * ({totalImages}/5)</h2>
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Current Images ({existingImages.length})
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {existingImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group border-2 border-gray-300 rounded-xl overflow-hidden aspect-square bg-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Existing ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={imageUrl.startsWith('http')}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <button
                        type="button"
                        onClick={() => removeExistingImage(imageUrl)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 z-10"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>

                      <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imageFiles.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    New Images ({imageFiles.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setImageFiles([])}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from(imageFiles).map((file, index) => (
                    <div
                      key={index}
                      className="relative group border-2 border-blue-300 rounded-xl overflow-hidden aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="truncate font-medium">{file.name}</p>
                        <p className="text-gray-300">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 z-10"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>

                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        NEW
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Area */}
            {totalImages < 5 && (
              <label className="border-3 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer block group">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <ImageIcon className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <p className="text-base font-semibold text-gray-900 mb-2">Add more images</p>
                <p className="text-sm text-gray-600 mb-1">PNG, JPG or WEBP</p>
                <p className="text-xs text-gray-500">{5 - totalImages} more image(s) can be added</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {totalImages >= 5 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-yellow-800">
                  Maximum limit reached (5 images)
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Remove an existing image to add a new one
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-4 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-300 transform hover:scale-[1.02]"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating Product...
                  </span>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
