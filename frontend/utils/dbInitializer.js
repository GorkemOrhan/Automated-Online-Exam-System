// Database initializer for static deployment
import * as db from '../services/indexedDB';

let initialized = false;

// Initialize database at startup
export const initializeDatabase = async () => {
  // Only run once
  if (initialized) return;
  
  try {
    console.log('Initializing IndexedDB database...');
    await db.openDatabase();
    initialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Check if app is running in static mode
export const isStaticMode = () => {
  if (typeof window !== 'undefined') {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
    return isGitHubPages || isStaticExport;
  }
  return false;
}; 