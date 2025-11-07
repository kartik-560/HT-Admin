'use client';

import { useState, useEffect } from 'react';
import { FolderTree, Package, Users, Activity } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    users: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [categoriesRes, productsRes, usersRes] = await Promise.all([
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] }))
      ]);

      setStats({
        categories: categoriesRes.data.length || 0,
        products: productsRes.data.length || 0,
        users: usersRes.data.length || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Total Categories',
      value: stats.categories,
      icon: FolderTree,
      color: 'bg-blue-500',
      href: '/admin/categories'
    },
    {
      title: 'Total Products',
      value: stats.products,
      icon: Package,
      color: 'bg-green-500',
      href: '/admin/products'
    },
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/users'
    },
    {
      title: 'System Status',
      value: 'Active',
      icon: Activity,
      color: 'bg-orange-500',
      href: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Welcome to your admin panel
          </p>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 md:p-6"
              >
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
                      {stats.loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-2 sm:p-3 rounded-full text-white flex-shrink-0`}>
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow p-5 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2 md:space-y-3">
              <Link href="/admin/categories">
                <button
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  onClick={() => {/* Navigate to add category */ }}
                >
                  <div className="font-medium text-blue-900 text-sm md:text-base">
                    Add New Category
                  </div>
                  <div className="text-xs md:text-sm text-blue-600 mt-1">
                    Create a new product category
                  </div>
                </button>
              </Link>
              <Link href="/admin/products">
                <button
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  onClick={() => {/* Navigate to add product */ }}
                >
                  <div className="font-medium text-green-900 text-sm md:text-base">
                    Add New Product
                  </div>
                  <div className="text-xs md:text-sm text-green-600 mt-1">
                    Add a product to your inventory
                  </div>
                </button>
              </Link>

              <Link href="/admin/users">
                <button
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                  onClick={() => {/* Navigate to manage users */ }}
                >
                  <div className="font-medium text-purple-900 text-sm md:text-base">
                    Manage Users
                  </div>
                  <div className="text-xs md:text-sm text-purple-600 mt-1">
                    View and manage user accounts
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-lg shadow p-5 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                  System initialized
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                  Admin panel ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}