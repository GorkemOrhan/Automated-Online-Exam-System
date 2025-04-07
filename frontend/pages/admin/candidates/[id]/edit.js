import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MainLayout from '../../../../components/layout/MainLayout';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { updateCandidate, getCandidate } from '../../../../api/services/candidates';
import { getExams } from '../../../../api/services/exams';
import { getCurrentUser } from '../../../../api/services/auth';

const EditCandidate = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    exam_id: '',
    send_invitation: false,
    custom_message: '',
  });
  const [errors, setErrors] = useState({});
  
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
        
        // Get exams
        const examsResult = await getExams();
        if (examsResult.success) {
          setExams(examsResult.exams);
        }
        
        // Get candidate
        const candidateResult = await getCandidate(id);
        if (candidateResult.success) {
          const candidate = candidateResult.candidate;
          setFormData({
            name: candidate.name || '',
            email: candidate.email || '',
            exam_id: candidate.exam_id || '',
            send_invitation: false,
            custom_message: '',
          });
        } else {
          toast.error('Failed to load candidate data');
          router.push('/admin/candidates');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.exam_id) {
      newErrors.exam_id = 'Please select an exam';
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
      const candidateData = {
        name: formData.name,
        email: formData.email,
        exam_id: parseInt(formData.exam_id),
        send_invitation: formData.send_invitation,
        custom_message: formData.custom_message || ''
      };
      
      console.log('Updating candidate:', candidateData);
      const result = await updateCandidate(id, candidateData);
      
      if (result.success) {
        toast.success('Candidate updated successfully');
        router.push('/admin/candidates');
      } else {
        setErrors({ form: result.message || 'Failed to update candidate' });
        toast.error(result.message || 'Failed to update candidate');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      setErrors({ form: 'An unexpected error occurred' });
      toast.error('An unexpected error occurred while updating candidate');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading candidate data...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/candidates" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Candidate</h1>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter candidate name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter candidate email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          {/* Invitation controls */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="send_invitation"
                name="send_invitation"
                checked={formData.send_invitation}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="send_invitation" className="ml-2 block text-sm text-gray-700">
                Send invitation email
              </label>
            </div>
          </div>
          
          {formData.send_invitation && (
            <div className="mb-4">
              <label htmlFor="custom_message" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Message (Optional)
              </label>
              <textarea
                id="custom_message"
                name="custom_message"
                value={formData.custom_message}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter any additional information you want to include in the invitation email..."
              ></textarea>
              <p className="text-sm text-gray-500 mt-2">
                This message will be included in the invitation email. The email will already include the exam details and access link.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/candidates')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? 'Updating...' : (
                <>
                  <FiSave className="mr-2" />
                  Update Candidate
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

EditCandidate.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default EditCandidate; 