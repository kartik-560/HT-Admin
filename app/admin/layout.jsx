'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ToastProvider } from '@/components/ui/toast';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Users,
  Menu,
  X,
  LogOut,
  Layers,
  ChevronRight,
  Bell,
  User
} from 'lucide-react';
import api from '@/lib/axios';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree, color: 'text-purple-600', bg: 'bg-purple-100' },
  { name: 'Sub-Categories', href: '/admin/subcategories', icon: Layers, color: 'text-teal-600', bg: 'bg-teal-100' },
  { name: 'Products', href: '/admin/products', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Users', href: '/admin/users', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/profile/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout button clicked');

    try {
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');

        console.log('LocalStorage cleared');

        // Clear sessionStorage
        sessionStorage.clear();
        console.log('SessionStorage cleared');

        // Delete the basicAuth cookie by setting expiration to past date
        document.cookie = 'basicAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        console.log('Cookie deleted');

        // Hard redirect to login page
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
        
        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard size={18} className="text-white" />
                </div>
                <span className="font-bold text-slate-900">Admin</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl">
              {/* Mobile Sidebar Header */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <LayoutDashboard size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    <p className="text-xs text-indigo-100">Management System</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile User Profile */}
              {currentUser && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {getUserInitials(currentUser.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-600 truncate">{currentUser.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Navigation */}
              <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? `${item.bg} ${item.color} shadow-md`
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/50' : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
                          <Icon size={18} />
                        </div>
                        {item.name}
                      </div>
                      <ChevronRight size={16} className={`${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Sidebar Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="lg:flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-40">
            <div className="flex flex-col flex-grow bg-white shadow-xl border-r border-slate-200">
              {/* Sidebar Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <LayoutDashboard size={26} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <p className="text-xs text-indigo-100">Management System</p>
                  </div>
                </div>

                {/* User Profile */}
                {loadingUser ? (
                  <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl animate-pulse">
                    <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-3 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : currentUser ? (
                  <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600 shadow-md">
                      {getUserInitials(currentUser.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-indigo-200 truncate">{currentUser.phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <User size={20} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">Administrator</p>
                      <p className="text-xs text-indigo-200 truncate">Loading...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? `${item.bg} ${item.color} shadow-md transform scale-105`
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/70' : 'bg-slate-100 group-hover:bg-slate-200'} transition-colors`}>
                          <Icon size={18} />
                        </div>
                        {item.name}
                      </div>
                      <ChevronRight size={16} className={`${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-slate-200 space-y-2">
               

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-72">
            {/* Desktop Top Bar */}
            <div className="hidden lg:block bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
              <div className="px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                </div>

                <div className="flex items-center gap-3">
                 
                  
                  {currentUser ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {getUserInitials(currentUser.name)}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{currentUser.name}</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
                      <User size={20} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Page Content */}
            <main className="p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
