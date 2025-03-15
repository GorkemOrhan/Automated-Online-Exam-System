import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { createCandidate } from '../../../api/services/candidates';
import { getExams } from '../../../api/services/exams';
import { getCurrentUser } from '../../../api/services/auth';

const CreateCandidate = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    exam_id: '',
    send_invitation: true,
    custom_message: '',
  });
  const [errors, setErrors] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  
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
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!bulkMode) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else {
      if (!bulkEmails.trim()) {
        newErrors.bulkEmails = 'At least one email is required';
      } else {
        const emails = bulkEmails.split('\n').map(email => email.trim()).filter(email => email);
        const invalidEmails = emails.filter(email => !/\S+@\S+\.\S+/.test(email));
        
        if (invalidEmails.length > 0) {
          newErrors.bulkEmails = `Invalid email format: ${invalidEmails.join(', ')}`;
        }
      }
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
      if (!bulkMode) {
        // Single candidate
        const result = await createCandidate(formData);
        if (result.success) {
          router.push('/admin/candidates');
        } else {
          setErrors({ form: result.message || 'Failed to create candidate' });
        }
      } else {
        // Bulk candidates
        const emails = bulkEmails.split('\n').map(email => email.trim()).filter(email => email);
        const bulkData = {
          emails,
          exam_id: formData.exam_id,
          send_invitation: formData.send_invitation,
          custom_message: formData.custom_message,
        };
        
        const result = await createCandidate(bulkData, true);
        if (result.success) {
          router.push('/admin/candidates');
        } else {
          setErrors({ form: result.message || 'Failed to create candidates' });
        }
      }
    } catch (error) {
      console.error('Error creating candidate(s):', error);
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/candidates" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Candidate</h1>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setBulkMode(false)}
            className={`px-4 py-2 rounded-md ${!bulkMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Single Candidate
          </button>
          <button
            type="button"
            onClick={() => setBulkMode(true)}
            className={`px-4 py-2 rounded-md ${bulkMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Bulk Add
          </button>
        </div>
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
          
          {!bulkMode ? (
            // Single candidate form
            <>
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
            </>
          ) : (
            // Bulk candidates form
            <div className="mb-4">
              <label htmlFor="bulkEmails" className="block text-sm font-medium text-gray-700 mb-1">
                Email Addresses (one per line) *
              </label>
              <textarea
                id="bulkEmails"
                value={bulkEmails}
                onChange={(e) => {
                  setBulkEmails(e.target.value);
                  if (errors.bulkEmails) {
                    setErrors({
                      ...errors,
                      bulkEmails: null,
                    });
                  }
                }}
                rows="6"
                className={`w-full px-3 py-2 border rounded-md ${errors.bulkEmails ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter one email address per line"
              ></textarea>
              {errors.bulkEmails && (
                <p className="mt-1 text-sm text-red-600">{errors.bulkEmails}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Names will be extracted from email addresses. You can update them later.
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="send_invitation"
                name="send_invitation"
                checked={formData.send_invitation}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="send_invitation" className="ml-2 block text-sm text-gray-700">
                Send invitation email immediately
              </label>
            </div>
          </div>
          
          {formData.send_invitation && (
            <div className="mb-4">
              <label htmlFor="custom_message" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Message (optional)
              </label>
              <textarea
                id="custom_message"
                name="custom_message"
                value={formData.custom_message}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add a custom message to the invitation email"
              ></textarea>
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
              {isSubmitting ? 'Creating...' : (
                <>
                  <FiSave className="mr-2" />
                  {bulkMode ? 'Add Candidates' : 'Add Candidate'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

CreateCandidate.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default CreateCandidate; 