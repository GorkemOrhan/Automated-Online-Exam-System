import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { createQuestion } from '../../../api/services/questions';
import { getExams } from '../../../api/services/exams';
import { getCurrentUser } from '../../../api/services/auth';
import { toast } from 'react-toastify';

const CreateQuestion = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    text: '',
    question_type: 'multiple_choice',
    exam_id: '',
    points: 1,
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ],
    explanation: '',
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          toast.error('Admin access required');
          router.push('/dashboard');
          return;
        }
        
        // Get exams
        const result = await getExams();
        if (result.success) {
          setExams(result.exams);
          
          // Set default exam if available and not already set from URL params
          if (result.exams.length > 0 && !formData.exam_id) {
            setFormData(prev => ({
              ...prev,
              exam_id: result.exams[0].id
            }));
          }
        } else {
          toast.error('Failed to load exams');
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exams. Please try again.');
      }
    };
    
    // Check if we have an exam_id from the URL query
    if (router.query.exam_id) {
      setFormData(prev => ({
        ...prev,
        exam_id: parseInt(router.query.exam_id)
      }));
    }
    
    fetchExams();
  }, [router.query.exam_id, router]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'question_type') {
      // Reset options when changing question type
      let newOptions = [];
      
      if (value === 'multiple_choice') {
        newOptions = [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ];
      } else if (value === 'true_false') {
        newOptions = [
          { text: 'True', is_correct: false },
          { text: 'False', is_correct: false }
        ];
      }
      
      setFormData({
        ...formData,
        question_type: value,
        options: newOptions
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    
    if (field === 'is_correct' && formData.question_type === 'single_choice') {
      // For single choice, only one option can be correct
      newOptions.forEach((option, i) => {
        option.is_correct = i === index && value;
      });
    } else {
      newOptions[index][field] = value;
    }
    
    setFormData({
      ...formData,
      options: newOptions,
    });
    
    // Clear any options errors
    if (errors.options) {
      setErrors({
        ...errors,
        options: null
      });
    }
  };
  
  const addOption = () => {
    if (formData.question_type === 'true_false') {
      return; // Can't add options to true/false questions
    }
    
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', is_correct: false }],
    });
  };
  
  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setErrors({
        ...errors,
        options: 'Questions must have at least 2 options',
      });
      return;
    }
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    if (!formData.exam_id) {
      newErrors.exam_id = 'Please select an exam';
    }
    
    if (formData.points <= 0) {
      newErrors.points = 'Points must be greater than 0';
    }
    
    if (formData.question_type === 'multiple_choice' || formData.question_type === 'true_false' || formData.question_type === 'single_choice') {
      // Check if at least one option is marked as correct
      const hasCorrectOption = formData.options.some(option => option.is_correct);
      if (!hasCorrectOption) {
        newErrors.options = 'At least one option must be marked as correct';
      }
      
      // Check if all options have text
      const emptyOptions = formData.options.some(option => !option.text.trim());
      if (emptyOptions) {
        newErrors.options = newErrors.options || 'All options must have text';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const questionData = {
        exam_id: parseInt(formData.exam_id),
        text: formData.text,
        question_type: formData.question_type,
        points: parseFloat(formData.points),
        explanation: formData.explanation || ''
      };
      
      // Add options if applicable
      if (['multiple_choice', 'single_choice', 'true_false'].includes(formData.question_type)) {
        questionData.options = formData.options.map(option => ({
          text: option.text,
          is_correct: option.is_correct
        }));
      }
      
      console.log('Submitting question data:', questionData);
      const result = await createQuestion(questionData);
      
      if (result.success) {
        toast.success('Question created successfully');
        
        // If we came from a specific exam, go back to that exam's questions
        if (router.query.exam_id) {
          router.push(`/admin/exams/${router.query.exam_id}/questions`);
        } else {
          router.push('/admin/questions');
        }
      } else {
        console.error('Failed to create question:', result);
        setErrors({ form: result.message || 'Failed to create question' });
        toast.error(result.message || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      setErrors({ form: 'An unexpected error occurred' });
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href={router.query.exam_id 
          ? `/admin/exams/${router.query.exam_id}/questions` 
          : "/admin/questions"} 
          className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {errors.form}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="exam_id" className="block text-sm font-medium text-gray-700 mb-1">
              Exam *
            </label>
            <select
              id="exam_id"
              name="exam_id"
              value={formData.exam_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.exam_id ? 'border-red-500' : 'border-gray-300'}`}
              disabled={!!router.query.exam_id}
            >
              <option value="">Select an exam</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
            {errors.exam_id && (
              <p className="mt-1 text-sm text-red-600">{errors.exam_id}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="question_type" className="block text-sm font-medium text-gray-700 mb-1">
              Question Type *
            </label>
            <select
              id="question_type"
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="single_choice">Single Choice</option>
              <option value="true_false">True/False</option>
              <option value="text">Open Ended</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md ${errors.text ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your question here..."
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
              Points *
            </label>
            <input
              type="number"
              id="points"
              name="points"
              value={formData.points}
              onChange={handleChange}
              min={1}
              step={0.5}
              className={`w-full px-3 py-2 border rounded-md ${errors.points ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.points && (
              <p className="mt-1 text-sm text-red-600">{errors.points}</p>
            )}
          </div>
          
          {['multiple_choice', 'single_choice', 'true_false'].includes(formData.question_type) && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options *
                </label>
                {formData.question_type !== 'true_false' && (
                  <Button
                    type="button"
                    onClick={addOption}
                    variant="outline"
                    size="sm"
                    className="flex items-center text-sm"
                  >
                    <FiPlus className="mr-1" /> Add Option
                  </Button>
                )}
              </div>
              
              {errors.options && (
                <p className="mb-2 text-sm text-red-600">{errors.options}</p>
              )}
              
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center mb-2 space-x-2">
                  <input
                    type={formData.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                    name={`option-correct-${index}`}
                    checked={option.is_correct}
                    onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                    disabled={formData.question_type === 'true_false'}
                  />
                  {formData.question_type !== 'true_false' && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove option"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Provide an explanation for the correct answer..."
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              className="mr-3"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <FiSave className="mr-2" />
                  Save Question
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

CreateQuestion.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default CreateQuestion; 