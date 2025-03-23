import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { createExam } from '../../../api/services/exams';

const CreateExam = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fromAdmin, setFromAdmin] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  useEffect(() => {
    // Check if user came from admin section
    const referrer = document.referrer;
    if (referrer && referrer.includes('/admin')) {
      setFromAdmin(true);
    }
    
    // Also check query parameters for cases where referrer isn't available
    if (router.query.from === 'admin') {
      setFromAdmin(true);
    }
  }, [router.query]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const examData = {
        ...data,
        passing_score: parseFloat(data.passing_score),
        duration_minutes: parseInt(data.duration_minutes, 10),
        is_randomized: data.is_randomized === 'true',
      };
      
      const result = await createExam(examData);
      
      if (result.success) {
        toast.success('Exam created successfully');
        
        // Redirect based on where the user came from
        if (fromAdmin) {
          router.push('/admin/exams');
        } else {
          router.push(`/exams/${result.exam.id}/questions`);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to create exam');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    if (fromAdmin) {
      router.push('/admin/exams');
    } else {
      router.back();
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Exam Title"
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 200,
                  message: 'Title cannot exceed 200 characters',
                },
              })}
              error={errors.title?.message}
              placeholder="Enter exam title"
            />
            
            <div className="mb-4">
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="input"
                placeholder="Enter exam description (optional)"
                {...register('description')}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                {...register('duration_minutes', {
                  required: 'Duration is required',
                  min: {
                    value: 1,
                    message: 'Duration must be at least 1 minute',
                  },
                  max: {
                    value: 240,
                    message: 'Duration cannot exceed 240 minutes',
                  },
                })}
                error={errors.duration_minutes?.message}
                placeholder="60"
              />
              
              <Input
                label="Passing Score (%)"
                type="number"
                step="0.1"
                {...register('passing_score', {
                  required: 'Passing score is required',
                  min: {
                    value: 0,
                    message: 'Passing score must be at least 0',
                  },
                  max: {
                    value: 100,
                    message: 'Passing score cannot exceed 100',
                  },
                })}
                error={errors.passing_score?.message}
                placeholder="60"
              />
            </div>
            
            <div className="mb-4">
              <label className="label">Randomize Questions</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-primary-600"
                    value="true"
                    {...register('is_randomized')}
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-primary-600"
                    value="false"
                    defaultChecked
                    {...register('is_randomized')}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

CreateExam.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default CreateExam; 