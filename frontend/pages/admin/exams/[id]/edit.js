import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MainLayout from '../../../../components/layout/MainLayout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { getExam, updateExam } from '../../../../api/services/exams';
import { getCurrentUser } from '../../../../api/services/auth';

const EditExam = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 60,
    passing_score: 70,
    is_active: false,
    is_randomized: false,
    instructions: '',
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchExam = async () => {
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
        const result = await getExam(id);
        if (result.success) {
          setFormData({
            title: result.exam.title || '',
            description: result.exam.description || '',
            duration_minutes: result.exam.duration_minutes || 60,
            passing_score: result.exam.passing_score || 70,
            is_active: result.exam.is_active || false,
            is_randomized: result.exam.is_randomized || false,
            instructions: result.exam.instructions || '',
          });
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
  }, [id, router]);
  
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
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duration must be greater than 0';
    }
    
    if (formData.passing_score < 0 || formData.passing_score > 100) {
      newErrors.passing_score = 'Passing score must be between 0 and 100';
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
      // Convert string values to appropriate types
      const examData = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes, 10),
        passing_score: parseFloat(formData.passing_score),
      };
      
      const result = await updateExam(id, examData);
      
      if (result.success) {
        toast.success('Exam updated successfully');
        router.push(`/admin/exams/${id}`);
      } else {
        toast.error(result.message || 'Failed to update exam');
        setErrors({ form: result.message || 'Failed to update exam' });
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('An error occurred while updating the exam');
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <p>Loading exam details...</p>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href={`/admin/exams/${id}`} className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Exam</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {errors.form}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Exam Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter exam title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter exam description"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration_minutes"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md ${errors.duration_minutes ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.duration_minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="passing_score" className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%) *
              </label>
              <input
                type="number"
                id="passing_score"
                name="passing_score"
                value={formData.passing_score}
                onChange={handleChange}
                min="0"
                max="100"
                className={`w-full px-3 py-2 border rounded-md ${errors.passing_score ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.passing_score && (
                <p className="mt-1 text-sm text-red-600">{errors.passing_score}</p>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions for Candidates
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter instructions for candidates taking this exam"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_randomized"
                name="is_randomized"
                checked={formData.is_randomized}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="is_randomized" className="ml-2 block text-sm text-gray-700">
                Randomize questions for each candidate
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Make exam active (available to candidates)
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/exams/${id}`)}
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

EditExam.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default EditExam; 