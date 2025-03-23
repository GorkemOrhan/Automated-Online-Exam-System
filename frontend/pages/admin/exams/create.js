import { useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '../../../components/layout/MainLayout';

const AdminExamCreateRedirect = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the standard exam creation page
    router.replace('/exams/create?from=admin');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-lg mb-2">Redirecting to exam creation page...</p>
        <p className="text-sm text-gray-500">If you're not redirected, 
          <button 
            onClick={() => router.push('/exams/create')}
            className="text-primary-600 hover:text-primary-800 ml-1">
            click here
          </button>
        </p>
      </div>
    </div>
  );
};

AdminExamCreateRedirect.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default AdminExamCreateRedirect; 