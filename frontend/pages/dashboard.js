import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiUsers, FiFileText, FiCheckCircle } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getExams } from '../api/services/exams';
import { getCurrentUser } from '../api/services/auth';

const Dashboard = () => {
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
        setUser(currentUser);
        
        // Get exams
        const result = await getExams();
        if (result.success) {
          setExams(result.exams);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const stats = [
    { name: 'Total Exams', value: exams.length, icon: FiFileText, color: 'bg-blue-500' },
    { name: 'Active Exams', value: exams.filter(exam => exam.is_active).length, icon: FiCheckCircle, color: 'bg-green-500' },
    { name: 'Total Candidates', value: '...', icon: FiUsers, color: 'bg-purple-500' },
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => router.push('/exams/create')}
          className="flex items-center"
        >
          <FiPlus className="mr-2" />
          Create Exam
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="flex items-center">
            <div className={`${stat.color} p-3 rounded-full mr-4`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Recent Exams */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Exams</h2>
          <Link href="/exams" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        
        {isLoading ? (
          <p>Loading exams...</p>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.slice(0, 3).map((exam) => (
              <Card
                key={exam.id}
                title={exam.title}
                subtitle={`${exam.question_count} questions • ${exam.duration_minutes} minutes`}
                footer={
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${exam.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {exam.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/exams/${exam.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                }
              >
                <p className="text-gray-500 text-sm mb-2">{exam.description || 'No description'}</p>
                <p className="text-sm">Passing score: {exam.passing_score}%</p>
              </Card>
            ))}
          </div>
        ) : (
          <p>No exams found. Create your first exam to get started.</p>
        )}
      </div>
    </div>
  );
};

Dashboard.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Dashboard; 