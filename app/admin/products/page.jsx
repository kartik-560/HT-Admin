'use client';

import { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Grid3x3, List, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const router = useRouter();

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
    router.push('/admin/products/add');
  };

  const handleEdit = (product) => {
    router.push(`/admin/products/edit/${product.id}`);
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

  const handleStatusToggle = async (product, event) => {
    // Prevent event bubbling
    event.stopPropagation();

    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';

      await api.patch(`/products/${product.id}/status`, {
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

  const activeProducts = products.filter(p => p.status === 'active').length;
  const inactiveProducts = products.filter(p => p.status === 'inactive').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <Package size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-slate-700">Loading products...</p>
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
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Package size={28} className="text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  Product Inventory
                </h1>
              </div>
              <p className="text-slate-600 text-lg ml-14">
                Manage and organize your product catalog
              </p>
            </div>

            {/* Add Product Button */}
            <button
              onClick={handleCreate}
              className="group relative px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-slate-900">{products.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Products</p>
                  <p className="text-3xl font-bold text-green-600">{activeProducts}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Inactive Products</p>
                  <p className="text-3xl font-bold text-amber-600">{inactiveProducts}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <AlertCircle size={24} className="text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & View Controls */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 gap-3">
            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === 'active'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Active ({activeProducts})
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === 'inactive'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Inactive ({inactiveProducts})
              </button>
            </div>

          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
            <Package size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first product</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const { parentCategories } = getCategoryInfo(product.categoryIds);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {product.imageUrls && product.imageUrls[0] ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized={product.imageUrls[0].startsWith('http')}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-20 w-20 text-slate-300" />
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${product.stockStatus === 'In Stock'
                          ? 'bg-green-500/90 text-white'
                          : product.stockStatus === 'Low Stock'
                            ? 'bg-amber-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                        }`}>
                        {product.stockStatus}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <button
                        onClick={(e) => handleStatusToggle(product, e)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl ${product.status === 'active'
                            ? 'bg-blue-500/90 text-white hover:bg-blue-600/90'
                            : 'bg-slate-500/90 text-white hover:bg-slate-600/90'
                          }`}
                        title={`Click to mark as ${product.status === 'active' ? 'inactive' : 'active'}`}
                      >
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Product Name */}
                    <h3
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-tight"
                    >
                      {product.name}
                    </h3>

                    {/* Categories */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {parentCategories.length > 0 ? (
                          parentCategories.slice(0, 2).map((cat, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                            >
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">No category</span>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-5 mt-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-slate-900">
                          ₹{parseFloat(product.discountedPrice || 0).toFixed(2)}
                        </span>
                        {product.discountPercentage > 0 && (
                          <>
                            <span className="text-sm text-slate-500 line-through">
                              ₹{parseFloat(product.originalPrice || 0).toFixed(2)}
                            </span>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {product.discountPercentage}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product)}
                        className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
