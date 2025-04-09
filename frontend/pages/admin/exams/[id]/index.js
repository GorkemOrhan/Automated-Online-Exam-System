import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiUsers, FiBarChart2, FiPlusCircle } from 'react-icons/fi';
import MainLayout from '../../../../components/layout/MainLayout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { getExam } from '../../../../api/services/exams';
import { getQuestions } from '../../../../api/services/questions';
import { getCurrentUser } from '../../../../api/services/auth';

const ExamDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          router.push('/dashboard');
          return;
        }
        
        // Get exam details
        const examResult = await getExam(id);
        if (!examResult.success) {
          console.error('Error fetching exam:', examResult.message);
          return;
        }
        
        setExam(examResult.exam);
        
        // Get questions for this exam
        const questionsResult = await getQuestions(id);
        if (questionsResult.success) {
          setQuestions(questionsResult.questions);
        }
      } catch (error) {
        console.error('Error fetching exam details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);
  
  if (isLoading) {
    return <p>Loading exam details...</p>;
  }
  
  if (!exam) {
    return <p>Exam not found</p>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/exams" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
      </div>
      
      <div className="flex justify-end space-x-3 mb-6">
        <Button
          onClick={() => router.push(`/admin/exams/${id}/edit`)}
          className="flex items-center"
          variant="outline"
        >
          <FiEdit2 className="mr-2" />
          Edit Exam
        </Button>
        <Button
          onClick={() => router.push(`/admin/exams/${id}/questions/create`)}
          className="flex items-center"
        >
          <FiPlusCircle className="mr-2" />
          Add Question
        </Button>
      </div>
      
      {/* Exam Details */}
      <Card className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Exam Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="mt-1">{exam.description || 'No description'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${exam.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {exam.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="mt-1">{exam.duration_minutes} minutes</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Passing Score</p>
            <p className="mt-1">{exam.passing_score}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Questions</p>
            <p className="mt-1">{questions.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Randomized</p>
            <p className="mt-1">{exam.is_randomized ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </Card>
      
      {/* Questions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Questions</h2>
          <Button
            onClick={() => router.push(`/admin/exams/${id}/questions/create`)}
            className="flex items-center"
            size="sm"
          >
            <FiPlusCircle className="mr-2" />
            Add Question
          </Button>
        </div>
        
        {questions.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {question.text.length > 100 
                          ? `${question.text.substring(0, 100)}...` 
                          : question.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.type === 'multiple_choice' ? 'Multiple Choice' : 
                       question.type === 'single_choice' ? 'Single Choice' :
                       question.type === 'true_false' ? 'True/False' :
                       question.type === 'text' ? 'Open-ended' :
                       question.question_type === 'multiple_choice' ? 'Multiple Choice' : 
                       question.question_type === 'single_choice' ? 'Single Choice' :
                       question.question_type === 'true_false' ? 'True/False' :
                       question.question_type === 'text' ? 'Open-ended' :
                       'Unknown Type'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {question.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <p className="text-gray-500 text-center py-8">
              No questions found for this exam. Add your first question to get started.
            </p>
          </Card>
        )}
      </div>
      
      {/* Quick Links */}
      <div className="flex space-x-4 mb-6">
        <Card className="flex-1 p-4 hover:shadow-lg transition-shadow duration-200">
          <Link href={`/admin/exams/${id}/candidates`} className="flex items-center text-primary-600">
            <FiUsers className="h-5 w-5 mr-2" />
            <span>Manage Candidates</span>
          </Link>
        </Card>
        <Card className="flex-1 p-4 hover:shadow-lg transition-shadow duration-200">
          <Link href={`/admin/exams/${id}/results`} className="flex items-center text-primary-600">
            <FiBarChart2 className="h-5 w-5 mr-2" />
            <span>View Results</span>
          </Link>
        </Card>
      </div>
    </div>
  );
};

ExamDetails.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default ExamDetails; 