'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, X, ChevronDown, ChevronRight, Package, DollarSign, Info, Palette, Shield, Truck } from 'lucide-react';
import { Input, Select, Textarea } from '@/components/forms/input';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';
import Image from 'next/image';

export default function AddProductPage() {
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [uploadMode, setUploadMode] = useState('bulk');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [showCustomInstallation, setShowCustomInstallation] = useState(false);
    const [selectedCareInstructions, setSelectedCareInstructions] = useState([]);
    const { toast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: '',
            brand: 'Wood Villa Furniture Factory',
            originalPrice: '',
            discountPercentage: '',
            discountedPrice: '',
            stockStatus: 'In Stock',
            status: 'active',
            note: '',
            material: '',
            color: '',
            seaterCount: '',
            warrantyPeriod: '',
            delivery: '',
            installation: 'Free installation included',
            productCareInstructions: '',
            returnAndCancellationPolicy: '',
            priceIncludesTax: false,
            priceExcludesTax: false,
            shippingIncluded: false,
            shippingChargesApply: false,
            installationIncluded: false,
            installationChargesApply: false,
            assemblyRequired: false,
            noAssemblyRequired: false,
            warrantyIncluded: false,
            warrantyNotIncluded: false,
            cashOnDelivery: false,
            noCashOnDelivery: false,
            isModifiable: false,
        }
    });


    const watchOriginalPrice = watch('originalPrice');
    const watchDiscountPercentage = watch('discountPercentage');

    // Auto-calculate discounted price when original price or discount percentage changes
    useEffect(() => {
        const originalPrice = parseFloat(watchOriginalPrice) || 0;
        const discountPercentage = parseFloat(watchDiscountPercentage) || 0;

        if (originalPrice > 0 && discountPercentage > 0 && discountPercentage <= 100) {
            const discountAmount = (originalPrice * discountPercentage) / 100;
            const discountedPrice = originalPrice - discountAmount;
            setValue('discountedPrice', discountedPrice.toFixed(2));
        } else if (discountPercentage === 0) {
            // If no discount, set discounted price equal to original price
            setValue('discountedPrice', originalPrice > 0 ? originalPrice.toFixed(2) : '');
        }
    }, [watchOriginalPrice, watchDiscountPercentage, setValue]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories/tree/hierarchy');
                setCategories(res.data || []);
            } catch (error) {
                toast.error('Failed to fetch categories');
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, [toast]);

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

        if (uploadMode === 'single') {
            // Single mode: Add one file at a time
            if (imageFiles.length >= 5) {
                toast.error('Maximum 5 images allowed');
                return;
            }
            if (files.length > 0) {
                setImageFiles(prev => {
                    const newFiles = [...prev, files[0]];
                    if (newFiles.length > 5) {
                        toast.error('Maximum 5 images allowed');
                        return prev;
                    }
                    return newFiles;
                });
            }
            // Reset the input to allow selecting the same file again
            e.target.value = '';
        } else {
            // Bulk mode: Replace all files at once
            if (files.length > 5) {
                toast.error('You can only upload maximum 5 images');
                setImageFiles(files.slice(0, 5));
            } else {
                setImageFiles(files);
            }
        }
    };

    const removeNewImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleFormSubmit = async (data) => {
        if (selectedCategories.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        if (imageFiles.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();

            formData.append('name', data.name);
            formData.append('brand', showCustomInput ? data.customBrand : data.brand);
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
            formData.append('priceExcludesTax', data.priceExcludesTax || false);
            formData.append('shippingIncluded', data.shippingIncluded || false);
            formData.append('shippingChargesApply', data.shippingChargesApply || false);
            formData.append('installationIncluded', data.installationIncluded || false);
            formData.append('installationChargesApply', data.installationChargesApply || false);
            formData.append('assemblyRequired', data.assemblyRequired || false);
            formData.append('noAssemblyRequired', data.noAssemblyRequired || false);
            formData.append('warrantyIncluded', data.warrantyIncluded || false);
            formData.append('warrantyNotIncluded', data.warrantyNotIncluded || false);
            formData.append('cashOnDelivery', data.cashOnDelivery || false);
            formData.append('noCashOnDelivery', data.noCashOnDelivery || false);
            formData.append('status', data.status || 'active');
            formData.append('isModifiable', data.isModifiable);

            selectedCategories.forEach((categoryId) => {
                formData.append('categoryIds', categoryId);
            });

            imageFiles.forEach((file) => {
                formData.append('images', file);
            });

            await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Product created successfully');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error submitting form:', error);
            if (error.response?.data?.error) {
                toast.error(`Error: ${error.response.data.error}`);
            } else {
                toast.error('Failed to create product');
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

                    <span className={`text-sm flex-1 ${level === 0 ? 'text-gray-900 font-semibold' : 'text-blue-600 font-medium'
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

    const handleCareInstructionChange = (instruction) => {
        const updatedInstructions = selectedCareInstructions.includes(instruction)
            ? selectedCareInstructions.filter(item => item !== instruction)
            : [...selectedCareInstructions, instruction];

        setSelectedCareInstructions(updatedInstructions);

        // Convert array to comma-separated string and update form value
        setValue('productCareInstructions', updatedInstructions.join(', '));
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

    const brandOptions = [
        { value: 'Wood Villa Furniture Factory', label: 'Wood Villa Furniture Factory' },
        { value: 'custom', label: 'Add custom Brand' }
    ];
    const installationOptions = [
        { value: 'Free installation included', label: 'Free installation included' },
        { value: 'Paid installation available', label: 'Paid installation available' },
        { value: 'Installation not available', label: 'Installation not available' }
    ];

    const warrantyOptions = [
        { value: '', label: 'Select warranty period' },
        { value: '1 year', label: '1 year' },
        { value: '2 years', label: '2 years' },
        { value: '3 years', label: '3 years' },
        { value: '4 years', label: '4 years' },
        { value: '5 years', label: '5 years' },
        { value: '6 years', label: '6 years' },
        { value: '7 years', label: '7 years' },
        { value: '8 years', label: '8 years' },
        { value: '9 years', label: '9 years' },
        { value: '10 years', label: '10 years' }
    ];

    const careInstructionsList = [
        'Wipe with a clean and dry cloth regularly',
        'Avoid direct sunlight and heat exposure',
        'Avoid harsh chemicals and abrasive cleaners',
        'Use furniture protectors under heavy objects',
        'Avoid dragging furniture across floors',
        'Clean with manufacturer-recommended products only',
        'Professional cleaning recommended annually'
    ];

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

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Package size={28} />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold">Add New Product</h1>
                        </div>
                        <p className="text-blue-100 text-lg ml-14">Fill in the details to create a new product in your inventory</p>
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

                            {/* Brand Dropdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Brand *"
                                    options={brandOptions}
                                    {...register('brand', { required: 'Brand is required' })}
                                    onChange={(e) => {
                                        setShowCustomInput(e.target.value === 'custom');
                                    }}
                                    error={errors.brand?.message}
                                />

                                {showCustomInput && (
                                    <Input
                                        label="Custom Brand Name *"
                                        placeholder="Enter custom brand name"
                                        type="text"
                                        {...register('customBrand', {
                                            required: showCustomInput ? 'Custom brand name is required' : false
                                        })}
                                        error={errors.customBrand?.message}
                                    />
                                )}
                            </div>

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
                                    label="Discount %"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    {...register('discountPercentage')}
                                    error={errors.discountPercentage?.message}
                                />

                                <div className="relative">
                                    <Input
                                        label="Discounted Price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('discountedPrice')}
                                        error={errors.discountedPrice?.message}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                    <div className="absolute top-0 right-0 mt-1">
                                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                            Auto-calculated
                                        </span>
                                    </div>
                                </div>


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

                            {/* <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-100">
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
                            </div> */}

                            <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('priceIncludesTax')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Price includes tax
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('priceExcludesTax')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Price excludes tax
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('shippingIncluded')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Shipping included in price
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('shippingChargesApply')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Shipping charges apply
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('installationIncluded')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Installation included in price
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('installationChargesApply')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Installation charges apply
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('assemblyRequired')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Assembly required
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('noAssemblyRequired')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        No assembly required
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('warrantyIncluded')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Warranty included
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('warrantyNotIncluded')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Warranty not included
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('cashOnDelivery')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Cash on delivery available
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('noCashOnDelivery')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Cash on delivery not available
                                    </span>
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

                            <Select
                                label="Warranty Period"
                                options={warrantyOptions}
                                {...register('warrantyPeriod')}
                                error={errors.warrantyPeriod?.message}
                            />
                        </div>
                    </div>

                    {/* Product Modifiable */}
                    <div className="mt-6">+
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Product Modifiable?
                        </label>

                        <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setValue('isModifiable', true)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${watch('isModifiable')
                                        ? 'bg-green-600 text-white shadow'
                                        : 'text-gray-600 hover:bg-white'
                                    }`}
                            >
                                Yes
                            </button>

                            <button
                                type="button"
                                onClick={() => setValue('isModifiable', false)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${!watch('isModifiable')
                                        ? 'bg-red-600 text-white shadow'
                                        : 'text-gray-600 hover:bg-white'
                                    }`}
                            >
                                No
                            </button>
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                            Choose whether this product can be modified after creation
                        </p>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Installation Info"
                                    options={installationOptions}
                                    {...register('installation')}
                                    error={errors.installation?.message}
                                />
                            </div>
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
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Care Instructions
                                </label>
                                <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-100">
                                    {careInstructionsList.map((instruction, index) => (
                                        <label key={index} className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedCareInstructions.includes(instruction)}
                                                onChange={() => handleCareInstructionChange(instruction)}
                                                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                                {instruction}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.productCareInstructions?.message && (
                                    <span className="text-sm text-red-600">{errors.productCareInstructions.message}</span>
                                )}
                            </div>

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
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <div className="p-2 bg-pink-100 rounded-lg">
                                <ImageIcon size={20} className="text-pink-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Product Images * (Max 5)</h2>
                        </div>

                        {/* Upload Mode Toggle */}
                        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Upload Mode</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('single')}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${uploadMode === 'single'
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <ImageIcon size={18} />
                                        <span>One by One</span>
                                    </div>
                                    <p className="text-xs mt-1 opacity-80">Add images individually</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('bulk')}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${uploadMode === 'bulk'
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Package size={18} />
                                        <span>Bulk Upload</span>
                                    </div>
                                    <p className="text-xs mt-1 opacity-80">Select multiple at once</p>
                                </button>
                            </div>
                        </div>

                        {imageFiles.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Selected Images ({imageFiles.length}/5)
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
                                                alt={`Preview ${index + 1}`}
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
                                                #{index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <label className="border-3 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer block group">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <ImageIcon className="h-12 w-12 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-base font-semibold text-gray-900 mb-2">
                                {uploadMode === 'single' ? 'Add an image' : 'Upload product images'}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">PNG, JPG or WEBP</p>
                            <p className="text-xs text-gray-500">
                                {uploadMode === 'single'
                                    ? `Click to add images one by one (${imageFiles.length}/5)`
                                    : 'Maximum 5 images, up to 5MB each'
                                }
                            </p>
                            <input
                                type="file"
                                multiple={uploadMode === 'bulk'}
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
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
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating Product...
                                    </span>
                                ) : (
                                    'Create Product'
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
