import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiUsers, FiFileText, FiCheckCircle, FiSettings, FiList } from 'react-icons/fi';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getExams } from '../../api/services/exams';
import { getCurrentUser } from '../../api/services/auth';

const AdminDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          router.push('/admin');
          return;
        }
        
        setUser(currentUser);
        
        // Get exams
        const result = await getExams();
        if (result.success) {
          setExams(result.exams);
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  const adminModules = [
    { 
      name: 'Exam Management', 
      description: 'Create, edit, and manage exams',
      icon: FiFileText, 
      color: 'bg-blue-500',
      link: '/admin/exams'
    },
    { 
      name: 'Question Bank', 
      description: 'Manage questions and create question pools',
      icon: FiList, 
      color: 'bg-green-500',
      link: '/admin/questions'
    },
    { 
      name: 'Candidate Management', 
      description: 'Add, edit, and manage candidates',
      icon: FiUsers, 
      color: 'bg-purple-500',
      link: '/admin/candidates'
    },
    { 
      name: 'Results & Reports', 
      description: 'View and export exam results',
      icon: FiCheckCircle, 
      color: 'bg-yellow-500',
      link: '/admin/results'
    },
    { 
      name: 'System Settings', 
      description: 'Configure system settings and preferences',
      icon: FiSettings, 
      color: 'bg-gray-500',
      link: '/admin/settings'
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>
      
      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminModules.map((module) => (
          <Card key={module.name} className="hover:shadow-lg transition-shadow duration-200">
            <Link href={module.link} className="block">
              <div className="flex items-center mb-4">
                <div className={`${module.color} p-3 rounded-full mr-4`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
              </div>
              <p className="text-gray-600">{module.description}</p>
            </Link>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        
        {isLoading ? (
          <p>Loading activity...</p>
        ) : (
          <Card>
            <p className="text-gray-500">No recent activity to display.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

AdminDashboard.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default AdminDashboard; 