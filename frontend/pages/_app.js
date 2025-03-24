import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import { isStaticMode, initializeDatabase } from '../utils/dbInitializer';

function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  // Initialize the database in static mode
  useEffect(() => {
    if (isStaticMode()) {
      console.log('Running in static mode, initializing local database...');
      initializeDatabase();
    } else {
      console.log('Running in regular mode with API server');
    }
  }, []);

  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default MyApp; 