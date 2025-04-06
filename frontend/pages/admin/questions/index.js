import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiFilter } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getQuestions, deleteQuestion } from '../../../api/services/questions';
import { getExams } from '../../../api/services/exams';
import { getCurrentUser } from '../../../api/services/auth';

const QuestionManagement = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({
    examId: '',
    type: '',
    search: '',
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          router.push('/dashboard');
          return;
        }
        
        // Get questions
        const questionsResult = await getQuestions(filters);
        if (questionsResult.success) {
          setQuestions(questionsResult.questions);
        }
        
        // Get exams for filter
        const examsResult = await getExams();
        if (examsResult.success) {
          setExams(examsResult.exams);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router, filters]);
  
  const handleDeleteQuestion = async (questionId) => {
    try {
      const result = await deleteQuestion(questionId);
      if (result.success) {
        setQuestions(questions.filter(question => question.id !== questionId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  
  const getQuestionTypeLabel = (type) => {
    const questionType = type || 'unknown';
    
    switch (questionType) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'single_choice':
        return 'Single Choice';
      case 'true_false':
        return 'True/False';
      case 'text':
      case 'open_ended':
        return 'Open Ended';
      default:
        return questionType;
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Question Management</h1>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto">
            <select
              name="examId"
              value={filters.examId}
              onChange={handleFilterChange}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="single_choice">Single Choice</option>
              <option value="true_false">True/False</option>
              <option value="text">Open Ended</option>
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search questions..."
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <Button
          onClick={() => router.push('/admin/questions/create')}
          className="flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Question
        </Button>
      </div>
      
      {isLoading ? (
        <p>Loading questions...</p>
      ) : questions.length > 0 ? (
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
                  Exam
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
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{question.text.substring(0, 100)}{question.text.length > 100 ? '...' : ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getQuestionTypeLabel(question.question_type || question.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {question.exam_title || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {question.points || 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/admin/questions/${question.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(question.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
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
          <p className="text-gray-500 text-center py-8">No questions found. Add your first question to get started.</p>
        </Card>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteQuestion(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

QuestionManagement.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default QuestionManagement; 