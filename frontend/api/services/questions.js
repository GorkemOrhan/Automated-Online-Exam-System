import api from './api';

export const createQuestion = async (questionData) => {
  try {
    const response = await api.post('/questions', questionData);
    return { success: true, question: response.data.question };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to create question',
    };
  }
};

export const getQuestion = async (questionId) => {
  try {
    const response = await api.get(`/questions/${questionId}`);
    return { success: true, question: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch question',
    };
  }
};

export const getQuestions = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}/questions`);
    return { success: true, questions: response.data };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch questions',
    };
  }
};

export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return { success: true, question: response.data.question };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to update question',
    };
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    await api.delete(`/questions/${questionId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to delete question',
    };
  }
}; 