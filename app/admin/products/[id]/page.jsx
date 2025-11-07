'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/axios';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    features: false,
    details: false,
    care: false,
    policy: false,
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchCategories();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with ID:', id);
      const response = await api.get(`/products/${id}`);
      console.log('Product fetched:', response.data);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/tree/hierarchy');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return [];
    
    const names = [];
    const searchCategory = (cats) => {
      for (let cat of cats) {
        if (categoryIds.includes(cat.id)) {
          names.push(cat.name);
        }
        if (cat.children) {
          for (let child of cat.children) {
            if (categoryIds.includes(child.id)) {
              names.push(child.name);
            }
          }
        }
      }
    };
    searchCategory(categories);
    return names;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const categoryNames = getCategoryNames(product.categoryIds);
  const discount = product.discountPercentage || 0;
  const hasDiscount = discount > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow p-6">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              {product.imageUrls && product.imageUrls.length > 0 ? (
                <img
                  src={product.imageUrls[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-400">No image available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.imageUrls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col gap-6">
            {/* Category Badge */}
            {categoryNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categoryNames.map((name, index) => (
                  <span
                    key={index}
                    className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Title and Brand */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-gray-600 text-lg">{product.brand}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{parseFloat(product.discountedPrice || product.originalPrice || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{parseFloat(product.originalPrice || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>
              {product.priceIncludesTax && (
                <p className="text-sm text-gray-600">Inclusive of all prices</p>
              )}
              {product.shippingIncluded && (
                <p className="text-sm text-gray-600">Shipping included</p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.stockStatus === 'In Stock'
                    ? 'bg-green-500'
                    : product.stockStatus === 'Low Stock'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <span className="font-medium text-gray-700">{product.stockStatus || 'Unknown'}</span>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl mb-2">🚚</div>
                <p className="text-sm font-medium text-gray-700">
                  {product.delivery || 'Delivery available'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <p className="text-sm font-medium text-gray-700">
                  {product.installation || 'Installation available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Sections */}
        <div className="mt-8 space-y-4 bg-white rounded-lg shadow">
          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="border-b">
              <button
                onClick={() => toggleSection('features')}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50"
              >
                <h3 className="text-lg font-bold text-gray-900">Features</h3>
                <span className={`transform transition ${expandedSections.features ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.features && (
                <div className="px-6 pb-6">
                  <ul className="space-y-2">
                    {Array.isArray(product.features) ? (
                      product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-600">{product.features}</p>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="border-b">
            <button
              onClick={() => toggleSection('details')}
              className="w-full flex justify-between items-center p-6 hover:bg-gray-50"
            >
              <h3 className="text-lg font-bold text-gray-900">Details</h3>
              <span className={`transform transition ${expandedSections.details ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.details && (
              <div className="px-6 pb-6 space-y-3">
                {product.brand && <p className="text-gray-700"><strong>Brand:</strong> {product.brand}</p>}
                {product.color && <p className="text-gray-700"><strong>Color:</strong> {product.color}</p>}
                {product.material && <p className="text-gray-700"><strong>Material:</strong> {product.material}</p>}
                {product.seaterCount && <p className="text-gray-700"><strong>Seater Count:</strong> {product.seaterCount}</p>}
                {product.warrantyPeriod && <p className="text-gray-700"><strong>Warranty:</strong> {product.warrantyPeriod}</p>}
                {product.note && <p className="text-gray-700"><strong>Description:</strong> {product.note}</p>}
              </div>
            )}
          </div>

          {/* Product Care Instructions */}
          {product.productCareInstructions && (
            <div className="border-b">
              <button
                onClick={() => toggleSection('care')}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50"
              >
                <h3 className="text-lg font-bold text-gray-900">Product Care Instruction</h3>
                <span className={`transform transition ${expandedSections.care ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.care && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 whitespace-pre-line">{product.productCareInstructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Return and Cancellation Policy */}
          {product.returnAndCancellationPolicy && (
            <div>
              <button
                onClick={() => toggleSection('policy')}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50"
              >
                <h3 className="text-lg font-bold text-gray-900">Return and cancellation policy</h3>
                <span className={`transform transition ${expandedSections.policy ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.policy && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 whitespace-pre-line">{product.returnAndCancellationPolicy}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
