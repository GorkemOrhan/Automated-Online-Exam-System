import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getExams, deleteExam } from '../../api/services/exams';

const ExamsList = () => {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchExams = async () => {
    setIsLoading(true);
    
    try {
      const result = await getExams();
      if (result.success) {
        setExams(result.exams);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch exams');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchExams();
  }, []);
  
  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const result = await deleteExam(examId);
        
        if (result.success) {
          toast.success('Exam deleted successfully');
          fetchExams();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to delete exam');
        console.error(error);
      }
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        <Button
          onClick={() => router.push('/exams/create')}
          className="flex items-center"
        >
          <FiPlus className="mr-2" />
          Create Exam
        </Button>
      </div>
      
      {isLoading ? (
        <p>Loading exams...</p>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              title={exam.title}
              subtitle={`${exam.question_count} questions • ${exam.duration_minutes} minutes`}
              footer={
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${exam.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/exams/${exam.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/exams/${exam.id}/edit`)}
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(exam.id)}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              }
            >
              <p className="text-gray-500 text-sm mb-2">{exam.description || 'No description'}</p>
              <p className="text-sm">Passing score: {exam.passing_score}%</p>
              
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => router.push(`/exams/${exam.id}/candidates`)}
                  className="flex items-center text-sm text-gray-600 hover:text-primary-600"
                >
                  <FiUsers className="mr-1 h-4 w-4" />
                  Candidates
                </button>
                <button
                  onClick={() => router.push(`/exams/${exam.id}/results`)}
                  className="flex items-center text-sm text-gray-600 hover:text-primary-600"
                >
                  <FiBarChart2 className="mr-1 h-4 w-4" />
                  Results
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No exams found</p>
          <Button
            onClick={() => router.push('/exams/create')}
            className="flex items-center mx-auto"
          >
            <FiPlus className="mr-2" />
            Create Your First Exam
          </Button>
        </div>
      )}
    </div>
  );
};

ExamsList.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default ExamsList; 