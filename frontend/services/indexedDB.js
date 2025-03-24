// IndexedDB service for client-side storage
// This is used for GitHub Pages deployment where no backend server is available

const DB_NAME = 'examSystemDB';
const DB_VERSION = 1;
const USER_STORE = 'users';
const EXAM_STORE = 'exams';
const CANDIDATE_STORE = 'candidates';
const QUESTION_STORE = 'questions';

// Open database connection
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject('Your browser does not support IndexedDB, which is required for offline mode.');
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(`Database error: ${event.target.error}`);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const userStore = db.createObjectStore(USER_STORE, { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('username', 'username', { unique: true });

        // Add default admin user
        const adminUser = {
          email: 'admin@example.com',
          username: 'admin',
          password: 'adminpassword', // In a real app, this would be hashed
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        userStore.add(adminUser);
      }

      if (!db.objectStoreNames.contains(EXAM_STORE)) {
        const examStore = db.createObjectStore(EXAM_STORE, { keyPath: 'id', autoIncrement: true });
        examStore.createIndex('created_by', 'created_by', { unique: false });
      }

      if (!db.objectStoreNames.contains(CANDIDATE_STORE)) {
        const candidateStore = db.createObjectStore(CANDIDATE_STORE, { keyPath: 'id', autoIncrement: true });
        candidateStore.createIndex('email', 'email', { unique: true });
        candidateStore.createIndex('exam_id', 'exam_id', { unique: false });
      }

      if (!db.objectStoreNames.contains(QUESTION_STORE)) {
        const questionStore = db.createObjectStore(QUESTION_STORE, { keyPath: 'id', autoIncrement: true });
        questionStore.createIndex('exam_id', 'exam_id', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
  });
};

// Get all objects from a store
export const getAll = async (storeName) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(`Error fetching data: ${event.target.error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get an object by ID
export const getById = async (storeName, id) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(`Error fetching object: ${event.target.error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Add an object to a store
export const add = async (storeName, object) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(object);

    request.onsuccess = () => {
      resolve({ id: request.result, ...object });
    };

    request.onerror = (event) => {
      reject(`Error adding object: ${event.target.error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Update an object in a store
export const update = async (storeName, id, object) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // First get the existing object
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const updatedObject = { ...getRequest.result, ...object, id };
      const updateRequest = store.put(updatedObject);
      
      updateRequest.onsuccess = () => {
        resolve(updatedObject);
      };
      
      updateRequest.onerror = (event) => {
        reject(`Error updating object: ${event.target.error}`);
      };
    };
    
    getRequest.onerror = (event) => {
      reject(`Error fetching object for update: ${event.target.error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Remove an object from a store
export const remove = async (storeName, id) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve({ success: true, id });
    };

    request.onerror = (event) => {
      reject(`Error removing object: ${event.target.error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get an object by index
export const getByIndex = async (storeName, indexName, value) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.get(value);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(`Error fetching object by index: ${event.target.error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Get all objects matching an index value
export const getAllByIndex = async (storeName, indexName, value) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(`Error fetching objects by index: ${event.target.error}`);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// User authentication function
export const authenticateUser = async (email, password) => {
  try {
    const user = await getByIndex(USER_STORE, 'email', email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // In a real app, we would hash the password and compare hashes
    if (user.password === password) {
      const { password, ...userWithoutPassword } = user;
      return { 
        success: true, 
        user: userWithoutPassword 
      };
    }
    
    return { success: false, message: 'Invalid password' };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication error' };
  }
}; 