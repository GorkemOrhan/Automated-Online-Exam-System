import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiHome, FiFileText, FiUsers, FiLogOut, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import { isAuthenticated, logout, getCurrentUser } from '../../api/services/auth';

const MainLayout = ({ children }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, [router]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const navigation = [
    { name: 'User Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Admin Dashboard', href: '/admin', icon: FiSettings },
    { name: 'Exams', href: '/admin/exams', icon: FiFileText },
    { name: 'Candidates', href: '/admin/candidates', icon: FiUsers },
  ];
  
  return (
    <div className="min-h-full">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Mobile menu button */}
          <button
            type="button"
            className="fixed top-4 right-4 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <FiX className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <FiMenu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
          
          {/* Mobile menu panel */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 flex">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <Link href="/dashboard" className="text-xl font-bold text-primary-600 hover:text-primary-700">
                      Exam System
                    </Link>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          item.href === '/dashboard' || item.href === '/admin'
                            ? router.pathname === item.href
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            : router.pathname.startsWith(item.href)
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-4 flex-shrink-0 h-6 w-6 ${
                            item.href === '/dashboard' || item.href === '/admin'
                              ? router.pathname === item.href
                                ? 'text-primary-500'
                                : 'text-gray-400 group-hover:text-gray-500'
                              : router.pathname.startsWith(item.href)
                                ? 'text-primary-500'
                                : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-base font-medium text-gray-600 hover:text-gray-900"
                  >
                    <FiLogOut className="mr-4 flex-shrink-0 h-6 w-6 text-gray-400" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/dashboard" className="text-xl font-bold text-primary-600 hover:text-primary-700">
                Exam System
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.href === '/dashboard' || item.href === '/admin'
                      ? router.pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      : router.pathname.startsWith(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      item.href === '/dashboard' || item.href === '/admin'
                        ? router.pathname === item.href
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                        : router.pathname.startsWith(item.href)
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary-100 text-primary-700">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.username || 'User'}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                  >
                    <FiLogOut className="mr-1 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-8">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 