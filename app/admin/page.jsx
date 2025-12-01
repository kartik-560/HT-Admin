'use client';

import { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Package, 
  Users, 
  Activity, 
  TrendingUp, 
  Layers,
  ArrowRight,
  Plus,
  BarChart3,
  Clock
} from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
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

      const categories = categoriesRes.data || [];
      const rootCategories = categories.filter(c => !c.parentId);
      const subcategories = categories.filter(c => c.parentId);

      setStats({
        categories: rootCategories.length,
        subcategories: subcategories.length,
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
      title: 'Categories',
      value: stats.categories,
      subtitle: `${stats.subcategories} subcategories`,
      icon: FolderTree,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: '/admin/categories'
    },
    {
      title: 'Total Products',
      value: stats.products,
      subtitle: 'In inventory',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/admin/products'
    },
    {
      title: 'Total Users',
      value: stats.users,
      subtitle: 'Registered',
      icon: Users,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      href: '/admin/users'
    },
    {
      title: 'System Status',
      value: 'Active',
      subtitle: 'All systems operational',
      icon: Activity,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      href: '#'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Category',
      description: 'Create a new product category',
      icon: FolderTree,
      gradient: 'from-purple-500 to-indigo-600',
      href: '/admin/categories',
      action: 'Create'
    },
    {
      title: 'Add Subcategory',
      description: 'Organize products into subcategories',
      icon: Layers,
      gradient: 'from-teal-500 to-cyan-600',
      href: '/admin/subcategories',
      action: 'Create'
    },
    {
      title: 'Add New Product',
      description: 'Add products to your inventory',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-600',
      href: '/admin/products/add',
      action: 'Create'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      gradient: 'from-green-500 to-emerald-600',
      href: '/admin/users',
      action: 'View'
    }
  ];

  const recentActivities = [
    {
      text: 'System initialized successfully',
      time: 'Just now',
      color: 'bg-blue-500'
    },
    {
      text: 'Admin panel ready',
      time: '1 minute ago',
      color: 'bg-green-500'
    },
    {
      text: 'Database connected',
      time: '2 minutes ago',
      color: 'bg-purple-500'
    },
    {
      text: 'Authentication configured',
      time: '3 minutes ago',
      color: 'bg-teal-500'
    }
  ];

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-indigo-600 mx-auto"></div>
            <BarChart3 size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-slate-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
              <BarChart3 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-600 text-lg">
                Welcome back! Heres whats happening today
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.href} key={index}>
                <div className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 border border-slate-200 cursor-pointer group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.iconBg} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`${stat.iconColor}`} size={24} />
                    </div>
                    <div className={`bg-gradient-to-r ${stat.gradient} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
                      Live
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                      <TrendingUp className="text-green-600" size={16} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Actions Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="text-indigo-600" size={24} />
                  Quick Actions
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Common tasks to get you started
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link href={action.href} key={index}>
                    <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border-2 border-slate-200 hover:border-indigo-300 transition-all duration-300 cursor-pointer hover:shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className={`bg-gradient-to-br ${action.gradient} p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="text-white" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
                          {action.action}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Card */}
          {/* <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="text-indigo-600" size={24} />
                  Activity
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Recent system events
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-transparent rounded-lg hover:from-indigo-50 transition-colors group"
                >
                  <div className={`w-2 h-2 ${activity.color} rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium">
                      {activity.text}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="#">
              <button className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                View All Activity
                <ArrowRight size={16} />
              </button>
            </Link>
          </div> */}
        </div>

        {/* System Info Footer */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity size={24} />
              </div>
              <div>
                <p className="font-semibold text-lg">System Status: Operational</p>
                <p className="text-indigo-100 text-sm">All services running smoothly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
