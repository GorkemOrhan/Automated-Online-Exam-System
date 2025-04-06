import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MainLayout from '../../../../../components/layout/MainLayout';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import { createQuestion } from '../../../../../api/services/questions';
import { getExam } from '../../../../../api/services/exams';
import { getCurrentUser } from '../../../../../api/services/auth';

const CreateQuestion = () => {
  const router = useRouter();
  const { id: examId } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exam, setExam] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    question_type: 'multiple_choice',
    points: 1,
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
    explanation: '',
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          router.push('/dashboard');
          return;
        }
        
        // Get exam details to display the title
        const result = await getExam(examId);
        if (result.success) {
          setExam(result.exam);
        } else {
          toast.error(result.message || 'Failed to fetch exam details');
          router.push('/admin/exams');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('An error occurred while fetching exam details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExam();
  }, [examId, router]);
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({
      ...formData,
      question_type: newType,
      // Reset the options based on the type
      options: newType === 'multiple_choice' || newType === 'single_choice' ? [
        { text: '', is_correct: newType === 'single_choice' },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ] : newType === 'true_false' ? [
        { text: 'True', is_correct: false },
        { text: 'False', is_correct: false },
      ] : []
    });
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
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
        options: null,
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
    // Don't remove if we only have 2 options
    if (formData.options.length <= 2) {
      toast.warning('At least 2 options are required');
      return;
    }
    
    const updatedOptions = [...formData.options];
    updatedOptions.splice(index, 1);
    
    // If we're removing the correct option, set the first option as correct
    const hasCorrectOption = updatedOptions.some(option => option.is_correct);
    if (!hasCorrectOption && updatedOptions.length > 0 && formData.question_type === 'single_choice') {
      updatedOptions[0].is_correct = true;
    }
    
    setFormData({
      ...formData,
      options: updatedOptions,
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    
    if (formData.points <= 0) {
      newErrors.points = 'Points must be greater than 0';
    }
    
    if (formData.question_type === 'multiple_choice' || formData.question_type === 'single_choice' || formData.question_type === 'true_false') {
      // Validate options
      const emptyOptions = formData.options.some(option => !option.text.trim());
      if (emptyOptions) {
        newErrors.options = 'All options must have text';
      }
      
      // Make sure at least one option is marked as correct
      const hasCorrectOption = formData.options.some(option => option.is_correct);
      if (!hasCorrectOption) {
        newErrors.options = newErrors.options || 'At least one option must be marked as correct';
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
    
    setIsSaving(true);
    
    try {
      // Format the data for the API
      const questionData = {
        text: formData.text,
        question_type: formData.question_type,
        points: parseFloat(formData.points),
        exam_id: parseInt(examId),
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
      
      // Create question
      const result = await createQuestion(questionData);
      
      if (result.success) {
        toast.success('Question created successfully');
        router.push(`/admin/exams/${examId}`);
      } else {
        console.error('Failed to create question:', result);
        toast.error(result.message || 'Failed to create question');
        setErrors({ form: result.message || 'Failed to create question' });
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('An error occurred while creating the question');
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href={`/admin/exams/${examId}`} className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Add Question to {exam?.title || 'Exam'}
        </h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {errors.form}
            </div>
          )}
          
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
            ></textarea>
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text}</p>
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
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="single_choice">Single Choice</option>
              <option value="true_false">True/False</option>
              <option value="text">Open Ended</option>
            </select>
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
            ></textarea>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              className="mr-3"
              onClick={() => router.push(`/admin/exams/${examId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving ? 'Saving...' : (
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