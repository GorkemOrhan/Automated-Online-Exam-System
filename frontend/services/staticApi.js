// Static API service for GitHub Pages deployment
// This simulates API calls using IndexedDB for storage

import * as db from './indexedDB';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

// Store names
const USER_STORE = 'users';
const EXAM_STORE = 'exams';
const CANDIDATE_STORE = 'candidates';
const QUESTION_STORE = 'questions';

// Helper function to get current user from cookies/localStorage
const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
  }
  return null;
};

// Helper function to shuffle array (for randomizing questions)
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Main request handler
export const request = async (method, url, data = null) => {
  console.log(`Static API: ${method} ${url}`);
  
  try {
    // Initialize the database if needed
    await db.openDatabase();
    
    // Authentication routes
    if (url.startsWith('/auth/')) {
      return handleAuthRequest(method, url, data);
    }
    
    // Exams routes
    if (url.startsWith('/exams/')) {
      return handleExamRequest(method, url, data);
    }
    
    // Questions routes
    if (url.startsWith('/questions/')) {
      return handleQuestionRequest(method, url, data);
    }
    
    // Candidates routes
    if (url.startsWith('/candidates/')) {
      return handleCandidateRequest(method, url, data);
    }
    
    // Unknown route
    throw new Error(`Unhandled route: ${url}`);
  } catch (error) {
    console.error('Static API error:', error);
    return {
      data: { 
        error: error.message || 'An error occurred',
        success: false
      },
      status: 500
    };
  }
};

// Handle authentication requests
const handleAuthRequest = async (method, url, data) => {
  // Login
  if (url === '/auth/login' && method === 'POST') {
    const { email, password } = data;
    const result = await db.authenticateUser(email, password);
    
    if (result.success) {
      return {
        data: {
          access_token: `mock-token-${uuidv4()}`,
          user: result.user
        }
      };
    } else {
      return {
        data: { error: result.message },
        status: 401
      };
    }
  }
  
  // Register
  if (url === '/auth/register' && method === 'POST') {
    // Check if user already exists
    const existingUser = await db.getByIndex(USER_STORE, 'email', data.email);
    if (existingUser) {
      return {
        data: { error: 'Email already exists' },
        status: 400
      };
    }
    
    // Create new user
    const newUser = {
      email: data.email,
      username: data.username,
      password: data.password,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createdUser = await db.add(USER_STORE, newUser);
    const { password, ...userWithoutPassword } = createdUser;
    
    return {
      data: {
        access_token: `mock-token-${uuidv4()}`,
        user: userWithoutPassword
      }
    };
  }
  
  // Validate token
  if (url === '/auth/validate-token' && method === 'GET') {
    const user = getCurrentUser();
    if (user) {
      return {
        data: {
          valid: true,
          user
        }
      };
    } else {
      return {
        data: { 
          valid: false,
          error: 'Token is invalid or expired'
        },
        status: 401
      };
    }
  }
  
  // Current user
  if (url === '/auth/me' && method === 'GET') {
    const user = getCurrentUser();
    if (user) {
      return {
        data: user
      };
    } else {
      return {
        data: { error: 'Not authenticated' },
        status: 401
      };
    }
  }
  
  throw new Error(`Unhandled auth route: ${url}`);
};

// Handle exam requests
const handleExamRequest = async (method, url, data) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return {
      data: { error: 'Not authenticated' },
      status: 401
    };
  }
  
  // Get all exams
  if (url === '/exams' && method === 'GET') {
    const exams = await db.getAll(EXAM_STORE);
    
    // If admin, return all exams
    // If regular user, return only their exams
    const filteredExams = currentUser.is_admin
      ? exams
      : exams.filter(exam => exam.created_by === currentUser.id);
    
    return {
      data: filteredExams
    };
  }
  
  // Create new exam
  if (url === '/exams' && method === 'POST') {
    const newExam = {
      ...data,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createdExam = await db.add(EXAM_STORE, newExam);
    return {
      data: createdExam
    };
  }
  
  // Get exam by ID
  const examIdMatch = url.match(/^\/exams\/(\d+)$/);
  if (examIdMatch && method === 'GET') {
    const examId = parseInt(examIdMatch[1]);
    const exam = await db.getById(EXAM_STORE, examId);
    
    if (!exam) {
      return {
        data: { error: 'Exam not found' },
        status: 404
      };
    }
    
    // Check if user is admin or exam creator
    if (!currentUser.is_admin && exam.created_by !== currentUser.id) {
      return {
        data: { error: 'Unauthorized access to exam' },
        status: 403
      };
    }
    
    return {
      data: exam
    };
  }
  
  // Update exam
  if (examIdMatch && method === 'PUT') {
    const examId = parseInt(examIdMatch[1]);
    const exam = await db.getById(EXAM_STORE, examId);
    
    if (!exam) {
      return {
        data: { error: 'Exam not found' },
        status: 404
      };
    }
    
    // Check if user is admin or exam creator
    if (!currentUser.is_admin && exam.created_by !== currentUser.id) {
      return {
        data: { error: 'Unauthorized access to exam' },
        status: 403
      };
    }
    
    const updatedExam = await db.update(EXAM_STORE, examId, {
      ...data,
      updated_at: new Date().toISOString()
    });
    
    return {
      data: updatedExam
    };
  }
  
  // Delete exam
  if (examIdMatch && method === 'DELETE') {
    const examId = parseInt(examIdMatch[1]);
    const exam = await db.getById(EXAM_STORE, examId);
    
    if (!exam) {
      return {
        data: { error: 'Exam not found' },
        status: 404
      };
    }
    
    // Check if user is admin or exam creator
    if (!currentUser.is_admin && exam.created_by !== currentUser.id) {
      return {
        data: { error: 'Unauthorized access to exam' },
        status: 403
      };
    }
    
    await db.remove(EXAM_STORE, examId);
    
    // Also delete associated questions
    const questions = await db.getAllByIndex(QUESTION_STORE, 'exam_id', examId);
    for (const question of questions) {
      await db.remove(QUESTION_STORE, question.id);
    }
    
    return {
      data: { message: 'Exam deleted successfully' }
    };
  }
  
  // Get questions for exam
  const examQuestionsMatch = url.match(/^\/exams\/(\d+)\/questions$/);
  if (examQuestionsMatch && method === 'GET') {
    const examId = parseInt(examQuestionsMatch[1]);
    const exam = await db.getById(EXAM_STORE, examId);
    
    if (!exam) {
      return {
        data: { error: 'Exam not found' },
        status: 404
      };
    }
    
    // For exam creators, return all questions
    if (currentUser.is_admin || exam.created_by === currentUser.id) {
      const questions = await db.getAllByIndex(QUESTION_STORE, 'exam_id', examId);
      return {
        data: questions
      };
    }
    
    // For candidates taking the exam, check if they are authorized and return shuffled questions
    const candidate = await db.getByIndex(CANDIDATE_STORE, 'email', currentUser.email);
    if (candidate && candidate.exam_id === examId) {
      const questions = await db.getAllByIndex(QUESTION_STORE, 'exam_id', examId);
      
      // Shuffle questions if exam has randomize_questions set to true
      const shuffledQuestions = exam.randomize_questions
        ? shuffleArray([...questions])
        : questions;
      
      return {
        data: shuffledQuestions
      };
    }
    
    return {
      data: { error: 'Unauthorized access to exam questions' },
      status: 403
    };
  }
  
  throw new Error(`Unhandled exam route: ${url}`);
};

// Handle question requests
const handleQuestionRequest = async (method, url, data) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return {
      data: { error: 'Not authenticated' },
      status: 401
    };
  }
  
  // Only admins can create/edit questions
  if (!currentUser.is_admin && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    return {
      data: { error: 'Only admins can manage questions' },
      status: 403
    };
  }
  
  // Create new question
  if (url === '/questions' && method === 'POST') {
    const newQuestion = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createdQuestion = await db.add(QUESTION_STORE, newQuestion);
    return {
      data: createdQuestion
    };
  }
  
  // Get all questions
  if (url === '/questions' && method === 'GET') {
    const questions = await db.getAll(QUESTION_STORE);
    return {
      data: questions
    };
  }
  
  // Get question by ID
  const questionIdMatch = url.match(/^\/questions\/(\d+)$/);
  if (questionIdMatch && method === 'GET') {
    const questionId = parseInt(questionIdMatch[1]);
    const question = await db.getById(QUESTION_STORE, questionId);
    
    if (!question) {
      return {
        data: { error: 'Question not found' },
        status: 404
      };
    }
    
    return {
      data: question
    };
  }
  
  // Update question
  if (questionIdMatch && method === 'PUT') {
    const questionId = parseInt(questionIdMatch[1]);
    const question = await db.getById(QUESTION_STORE, questionId);
    
    if (!question) {
      return {
        data: { error: 'Question not found' },
        status: 404
      };
    }
    
    const updatedQuestion = await db.update(QUESTION_STORE, questionId, {
      ...data,
      updated_at: new Date().toISOString()
    });
    
    return {
      data: updatedQuestion
    };
  }
  
  // Delete question
  if (questionIdMatch && method === 'DELETE') {
    const questionId = parseInt(questionIdMatch[1]);
    const question = await db.getById(QUESTION_STORE, questionId);
    
    if (!question) {
      return {
        data: { error: 'Question not found' },
        status: 404
      };
    }
    
    await db.remove(QUESTION_STORE, questionId);
    
    return {
      data: { message: 'Question deleted successfully' }
    };
  }
  
  throw new Error(`Unhandled question route: ${url}`);
};

// Handle candidate requests
const handleCandidateRequest = async (method, url, data) => {
  // Create candidate (doesn't require authentication)
  if (url === '/candidates' && method === 'POST') {
    // Check if email already exists
    const existingCandidate = await db.getByIndex(CANDIDATE_STORE, 'email', data.email);
    if (existingCandidate) {
      return {
        data: { error: 'Email already exists' },
        status: 400
      };
    }
    
    const newCandidate = {
      ...data,
      exam_link: `${uuidv4()}`,
      created_at: new Date().toISOString()
    };
    
    const createdCandidate = await db.add(CANDIDATE_STORE, newCandidate);
    return {
      data: createdCandidate
    };
  }
  
  // Other candidate operations require authentication
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return {
      data: { error: 'Not authenticated' },
      status: 401
    };
  }
  
  // Get all candidates (admins only)
  if (url === '/candidates' && method === 'GET') {
    if (!currentUser.is_admin) {
      return {
        data: { error: 'Only admins can view all candidates' },
        status: 403
      };
    }
    
    const candidates = await db.getAll(CANDIDATE_STORE);
    return {
      data: candidates
    };
  }
  
  // Get candidate by ID (admins only)
  const candidateIdMatch = url.match(/^\/candidates\/(\d+)$/);
  if (candidateIdMatch && method === 'GET') {
    if (!currentUser.is_admin) {
      return {
        data: { error: 'Only admins can view candidate details' },
        status: 403
      };
    }
    
    const candidateId = parseInt(candidateIdMatch[1]);
    const candidate = await db.getById(CANDIDATE_STORE, candidateId);
    
    if (!candidate) {
      return {
        data: { error: 'Candidate not found' },
        status: 404
      };
    }
    
    return {
      data: candidate
    };
  }
  
  // Access exam by unique link (for candidates)
  const examLinkMatch = url.match(/^\/candidates\/exam\/(.+)$/);
  if (examLinkMatch && method === 'GET') {
    const examLink = examLinkMatch[1];
    
    // Find candidate with matching exam link
    const candidates = await db.getAll(CANDIDATE_STORE);
    const candidate = candidates.find(c => c.exam_link === examLink);
    
    if (!candidate) {
      return {
        data: { error: 'Invalid exam link' },
        status: 404
      };
    }
    
    // Find the exam
    const exam = await db.getById(EXAM_STORE, candidate.exam_id);
    if (!exam) {
      return {
        data: { error: 'Exam not found' },
        status: 404
      };
    }
    
    return {
      data: {
        exam,
        candidate
      }
    };
  }
  
  throw new Error(`Unhandled candidate route: ${url}`);
}; 