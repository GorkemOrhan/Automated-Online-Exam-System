import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../api/services/auth';

const Home = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to admin dashboard if authenticated, otherwise to login
    if (isAuthenticated()) {
      router.push('/admin');
    } else {
      router.push('/login');
    }
  }, [router]);
  
  return (
    <div className="min-h-full flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
};

export default Home; 