import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MainLayout from '../../../../components/layout/MainLayout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { getQuestion, updateQuestion } from '../../../../api/services/questions';
import { getExam } from '../../../../api/services/exams';
import { getCurrentUser } from '../../../../api/services/auth';

const EditQuestion = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exam, setExam] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple_choice',
    points: 1,
    options: [],
    correct_answer: '', // For open-ended questions
    exam_id: '',
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchQuestionAndExam = async () => {
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
        
        // Get question details
        const questionResult = await getQuestion(id);
        if (!questionResult.success) {
          toast.error(questionResult.message || 'Failed to fetch question details');
          router.push('/admin/exams');
          return;
        }
        
        const question = questionResult.question;
        
        // Get exam details
        const examResult = await getExam(question.exam_id);
        if (examResult.success) {
          setExam(examResult.exam);
        }
        
        // Set form data
        setFormData({
          text: question.text || '',
          type: question.type || 'multiple_choice',
          points: question.points || 1,
          options: question.options || [],
          correct_answer: question.correct_answer || '',
          exam_id: question.exam_id || '',
        });
      } catch (error) {
        console.error('Error fetching question:', error);
        toast.error('An error occurred while fetching question details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestionAndExam();
  }, [id, router]);
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({
      ...formData,
      type: newType,
      // Reset the options or correct_answer based on the type
      ...(newType === 'multiple_choice' 
        ? { 
            options: formData.options.length > 0 ? formData.options : [
              { text: '', is_correct: true },
              { text: '', is_correct: false },
              { text: '', is_correct: false },
              { text: '', is_correct: false },
            ],
            correct_answer: '' 
          }
        : { 
            options: [], 
            correct_answer: formData.correct_answer || '' 
          }
      )
    });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  const handleOptionChange = (index, e) => {
    const { value } = e.target;
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], text: value };
    
    setFormData({
      ...formData,
      options: updatedOptions,
    });
    
    // Clear error for options
    if (errors.options) {
      setErrors({
        ...errors,
        options: null,
      });
    }
  };
  
  const handleCorrectOptionChange = (index) => {
    const updatedOptions = formData.options.map((option, i) => ({
      ...option,
      is_correct: i === index,
    }));
    
    setFormData({
      ...formData,
      options: updatedOptions,
    });
  };
  
  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { text: '', is_correct: false },
      ],
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
    if (!hasCorrectOption && updatedOptions.length > 0) {
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
    
    if (formData.type === 'multiple_choice') {
      // Validate options
      const emptyOptions = formData.options.filter(option => !option.text.trim());
      if (emptyOptions.length > 0) {
        newErrors.options = 'All options must have text';
      }
      
      // Make sure at least one option is marked as correct
      const hasCorrectOption = formData.options.some(option => option.is_correct);
      if (!hasCorrectOption) {
        newErrors.correctOption = 'At least one option must be marked as correct';
      }
    } else if (formData.type === 'open_ended' && !formData.correct_answer.trim()) {
      newErrors.correct_answer = 'Correct answer is required for open-ended questions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare question data
      const questionData = {
        text: formData.text,
        type: formData.type,
        points: parseInt(formData.points, 10),
        exam_id: formData.exam_id,
      };
      
      // Add type-specific fields
      if (formData.type === 'multiple_choice') {
        questionData.options = formData.options;
      } else {
        questionData.correct_answer = formData.correct_answer;
      }
      
      // Update question
      const result = await updateQuestion(id, questionData);
      
      if (result.success) {
        toast.success('Question updated successfully');
        router.push(`/admin/exams/${formData.exam_id}`);
      } else {
        toast.error(result.message || 'Failed to update question');
        setErrors({ form: result.message || 'Failed to update question' });
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('An error occurred while updating the question');
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <p>Loading...</p>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href={`/admin/exams/${formData.exam_id}`} className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Question for {exam?.title || 'Exam'}
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
              rows="4"
              className={`w-full px-3 py-2 border rounded-md ${errors.text ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter the question text"
            ></textarea>
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Question Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="open_ended">Open-ended</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                Points *
              </label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md ${errors.points ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.points && (
                <p className="mt-1 text-sm text-red-600">{errors.points}</p>
              )}
            </div>
          </div>
          
          {formData.type === 'multiple_choice' ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options *
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Option
                </button>
              </div>
              
              {errors.options && (
                <p className="mb-2 text-sm text-red-600">{errors.options}</p>
              )}
              
              {errors.correctOption && (
                <p className="mb-2 text-sm text-red-600">{errors.correctOption}</p>
              )}
              
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={option.is_correct}
                    onChange={() => handleCorrectOptionChange(index)}
                    className="mr-2"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="ml-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <p className="text-sm text-gray-500 mt-2">
                Select the radio button next to the correct option.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer *
              </label>
              <textarea
                id="correct_answer"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md ${errors.correct_answer ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter the correct answer for this open-ended question"
              ></textarea>
              {errors.correct_answer && (
                <p className="mt-1 text-sm text-red-600">{errors.correct_answer}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                This will be used to grade the candidate's answer.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/exams/${formData.exam_id}`)}
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

EditQuestion.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default EditQuestion; 