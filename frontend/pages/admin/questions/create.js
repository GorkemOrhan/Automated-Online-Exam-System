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

const CreateQuestion = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple_choice',
    exam_id: '',
    points: 1,
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ],
    correct_answer: '',
    time_limit_seconds: 60,
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          router.push('/dashboard');
          return;
        }
        
        // Get exams
        const result = await getExams();
        if (result.success) {
          setExams(result.exams);
          
          // Set default exam if available
          if (result.exams.length > 0) {
            setFormData(prev => ({
              ...prev,
              exam_id: result.exams[0].id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };
    
    fetchExams();
  }, [router]);
  
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
    
    if (field === 'is_correct' && formData.type === 'multiple_choice') {
      // For multiple choice, only one option can be correct
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
  };
  
  const addOption = () => {
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
    
    if (formData.type === 'multiple_choice' || formData.type === 'true_false') {
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
    } else if (formData.type === 'open_ended' && !formData.correct_answer.trim()) {
      newErrors.correct_answer = 'Please provide a sample correct answer';
    }
    
    if (formData.time_limit_seconds <= 0) {
      newErrors.time_limit_seconds = 'Time limit must be greater than 0 seconds';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data based on question type
      let questionData = { ...formData };
      
      if (formData.type === 'true_false') {
        // For true/false, simplify to just two options
        questionData.options = [
          { text: 'True', is_correct: formData.options.find(o => o.is_correct)?.text === 'True' },
          { text: 'False', is_correct: formData.options.find(o => o.is_correct)?.text === 'False' }
        ];
      } else if (formData.type === 'open_ended') {
        // For open-ended, we don't need options
        delete questionData.options;
      }
      
      const result = await createQuestion(questionData);
      if (result.success) {
        router.push('/admin/questions');
      } else {
        setErrors({ form: result.message || 'Failed to create question' });
      }
    } catch (error) {
      console.error('Error creating question:', error);
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/questions" className="mr-4">
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Question Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="open_ended">Open Ended</option>
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
              rows="3"
              className={`w-full px-3 py-2 border rounded-md ${errors.text ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your question here"
            ></textarea>
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            
            <div>
              <label htmlFor="time_limit_seconds" className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (seconds) *
              </label>
              <input
                type="number"
                id="time_limit_seconds"
                name="time_limit_seconds"
                value={formData.time_limit_seconds}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md ${errors.time_limit_seconds ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.time_limit_seconds && (
                <p className="mt-1 text-sm text-red-600">{errors.time_limit_seconds}</p>
              )}
            </div>
          </div>
          
          {/* Options for Multiple Choice and True/False */}
          {(formData.type === 'multiple_choice' || formData.type === 'true_false') && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Options *
                </label>
                {formData.type === 'multiple_choice' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="flex items-center"
                  >
                    <FiPlus className="mr-1" size={14} />
                    Add Option
                  </Button>
                )}
              </div>
              
              {errors.options && (
                <p className="mb-2 text-sm text-red-600">{errors.options}</p>
              )}
              
              {formData.type === 'true_false' ? (
                // True/False options
                <div className="space-y-2">
                  <div className="flex items-center p-3 border border-gray-300 rounded-md">
                    <input
                      type="radio"
                      id="option-true"
                      name="true_false_option"
                      checked={formData.options.some(o => o.text === 'True' && o.is_correct)}
                      onChange={() => {
                        const newOptions = [
                          { text: 'True', is_correct: true },
                          { text: 'False', is_correct: false }
                        ];
                        setFormData({
                          ...formData,
                          options: newOptions
                        });
                      }}
                      className="h-4 w-4 text-primary-600 border-gray-300"
                    />
                    <label htmlFor="option-true" className="ml-2 block text-sm text-gray-700">
                      True
                    </label>
                  </div>
                  
                  <div className="flex items-center p-3 border border-gray-300 rounded-md">
                    <input
                      type="radio"
                      id="option-false"
                      name="true_false_option"
                      checked={formData.options.some(o => o.text === 'False' && o.is_correct)}
                      onChange={() => {
                        const newOptions = [
                          { text: 'True', is_correct: false },
                          { text: 'False', is_correct: true }
                        ];
                        setFormData({
                          ...formData,
                          options: newOptions
                        });
                      }}
                      className="h-4 w-4 text-primary-600 border-gray-300"
                    />
                    <label htmlFor="option-false" className="ml-2 block text-sm text-gray-700">
                      False
                    </label>
                  </div>
                </div>
              ) : (
                // Multiple choice options
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="correct_option"
                        checked={option.is_correct}
                        onChange={() => handleOptionChange(index, 'is_correct', true)}
                        className="h-4 w-4 text-primary-600 border-gray-300"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Correct Answer for Open Ended */}
          {formData.type === 'open_ended' && (
            <div className="mb-4">
              <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 mb-1">
                Sample Correct Answer *
              </label>
              <textarea
                id="correct_answer"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md ${errors.correct_answer ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter a sample correct answer for reference"
              ></textarea>
              {errors.correct_answer && (
                <p className="mt-1 text-sm text-red-600">{errors.correct_answer}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be used as a reference for manual grading. Open-ended questions require manual review.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/questions')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? 'Creating...' : (
                <>
                  <FiSave className="mr-2" />
                  Create Question
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