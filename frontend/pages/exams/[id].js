import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiUsers, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getExam } from '../../api/services/exams';
import { getCurrentUser } from '../../api/services/auth';

const ExamDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Get exam details
        const result = await getExam(id);
        
        if (result.success) {
          setExam(result.exam);
        } else {
          setError(result.message || 'Failed to fetch exam details');
        }
      } catch (error) {
        console.error('Error fetching exam details:', error);
        setError('An unexpected error occurred while loading exam data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading exam details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 mb-6">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  if (!exam) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-6">
        <p className="font-medium">Exam not found</p>
        <p>The exam you're looking for does not exist or you don't have permission to view it.</p>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Exam Details</h1>
      </div>
      
      {/* Exam Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-semibold">{exam.title}</h2>
            <p className="text-gray-500">{exam.description || 'No description provided'}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {user && user.is_admin && (
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/exams/${exam.id}/edit`)}
                className="flex items-center"
              >
                <FiEdit2 className="mr-2" />
                Edit Exam
              </Button>
            )}
            {user && user.is_admin && (
              <Button
                onClick={() => router.push(`/admin/exams/${exam.id}/questions/create`)}
                className="flex items-center"
              >
                <FiEdit2 className="mr-2" />
                Add Questions
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {/* Exam Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FiUsers className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <p className="text-xl font-semibold">{exam.questions ? exam.questions.length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FiClock className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-xl font-semibold">{exam.duration_minutes} minutes</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FiCheckCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Passing Score</p>
              <p className="text-xl font-semibold">{exam.passing_score}%</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className={`${exam.is_active ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full mr-4`}>
              {exam.is_active 
                ? <FiCheckCircle className="h-5 w-5 text-green-500" />
                : <FiXCircle className="h-5 w-5 text-red-500" />
              }
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-xl font-semibold">{exam.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Exam Details */}
      <Card className="mb-6">
        <h3 className="text-lg font-medium mb-4">Exam Information</h3>
        
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex py-2">
            <dt className="w-1/3 text-gray-500">Created</dt>
            <dd className="w-2/3 font-medium">{formatDate(exam.created_at)}</dd>
          </div>
          
          <div className="flex py-2">
            <dt className="w-1/3 text-gray-500">Last Updated</dt>
            <dd className="w-2/3 font-medium">{formatDate(exam.updated_at)}</dd>
          </div>
          
          <div className="flex py-2">
            <dt className="w-1/3 text-gray-500">Randomize Questions</dt>
            <dd className="w-2/3 font-medium">{exam.randomize_questions ? 'Yes' : 'No'}</dd>
          </div>
          
          <div className="flex py-2">
            <dt className="w-1/3 text-gray-500">Randomize Options</dt>
            <dd className="w-2/3 font-medium">{exam.randomize_options ? 'Yes' : 'No'}</dd>
          </div>
          
          <div className="flex py-2">
            <dt className="w-1/3 text-gray-500">Show Results</dt>
            <dd className="w-2/3 font-medium">{exam.show_results ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </Card>
      
      {/* Question Preview */}
      {exam.questions && exam.questions.length > 0 && (
        <Card>
          <h3 className="text-lg font-medium mb-4">Questions Preview</h3>
          
          <ul className="divide-y divide-gray-200">
            {(exam.questions || []).slice(0, 5).map((question, index) => (
              <li key={question.id} className="py-3">
                <div className="flex justify-between">
                  <p className="font-medium">
                    {index + 1}. {question.text || 'Unknown question'}
                  </p>
                  <span className="text-sm text-gray-500">
                    {question.question_type === 'multiple_choice' && 'Multiple Choice'}
                    {question.question_type === 'single_choice' && 'Single Choice'}
                    {question.question_type === 'true_false' && 'True/False'}
                    {question.question_type === 'text' && 'Text Answer'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          
          {exam.questions.length > 5 && (
            <p className="text-gray-500 text-sm mt-4">
              Showing 5 of {exam.questions.length} questions.
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

ExamDetails.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default ExamDetails; 