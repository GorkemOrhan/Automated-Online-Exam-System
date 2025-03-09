import api from './api';

// Admin functions
export const getExams = async () => {
  try {
    const response = await api.get('/exams');
    return { success: true, exams: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch exams',
    };
  }
};

export const getExam = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`);
    return { success: true, exam: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch exam',
    };
  }
};

export const createExam = async (examData) => {
  try {
    const response = await api.post('/exams', examData);
    return { success: true, exam: response.data.exam };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to create exam',
    };
  }
};

export const updateExam = async (examId, examData) => {
  try {
    const response = await api.put(`/exams/${examId}`, examData);
    return { success: true, exam: response.data.exam };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to update exam',
    };
  }
};

export const deleteExam = async (examId) => {
  try {
    await api.delete(`/exams/${examId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to delete exam',
    };
  }
};

export const getExamQuestions = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}/questions`);
    return { success: true, questions: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch questions',
    };
  }
};

// Candidate functions
export const accessExam = async (uniqueLink) => {
  try {
    const response = await api.get(`/exams/access/${uniqueLink}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to access exam',
    };
  }
};

export const submitExam = async (uniqueLink, answers) => {
  try {
    const response = await api.post(`/exams/submit/${uniqueLink}`, { answers });
    return { success: true, result: response.data.result };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to submit exam',
    };
  }
}; 