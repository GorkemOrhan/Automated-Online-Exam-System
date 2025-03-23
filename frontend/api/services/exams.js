import api from './api';

// Admin functions
export const getExams = async () => {
  try {
    const response = await api.get('/exams');
    return { success: true, exams: response.data };
  } catch (error) {
    console.error('Error fetching exams:', error);
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
    console.error('Error fetching exam:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch exam',
    };
  }
};

export const createExam = async (examData) => {
  try {
    console.log('Sending exam data to API:', examData);
    // Make sure data types are correct before sending
    const formattedData = {
      ...examData,
      duration_minutes: parseInt(examData.duration_minutes, 10),
      passing_score: parseInt(examData.passing_score, 10),
      is_active: !!examData.is_active,
      is_randomized: !!examData.is_randomized
    };
    console.log('Formatted exam data:', formattedData);
    
    const response = await api.post('/exams', formattedData);
    return { success: true, exam: response.data.exam };
  } catch (error) {
    console.error('API error creating exam:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to create exam',
      statusCode: error.response?.status
    };
  }
};

export const updateExam = async (examId, examData) => {
  try {
    // Make sure data types are correct before sending
    const formattedData = {
      ...examData,
      duration_minutes: parseInt(examData.duration_minutes, 10),
      passing_score: parseInt(examData.passing_score, 10),
      is_active: !!examData.is_active,
      is_randomized: !!examData.is_randomized
    };
    
    const response = await api.put(`/exams/${examId}`, formattedData);
    return { success: true, exam: response.data.exam };
  } catch (error) {
    console.error('Error updating exam:', error);
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
    console.error('Error deleting exam:', error);
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
    console.error('Error fetching questions:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch questions',
    };
  }
};

// Candidate functions
export const accessExam = async (uniqueLink) => {
  try {
    const response = await api.get(`/candidates/access/${uniqueLink}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error accessing exam:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to access exam',
    };
  }
};

export const submitExam = async (uniqueLink, answers) => {
  try {
    const response = await api.post(`/candidates/submit/${uniqueLink}`, { answers });
    return { success: true, result: response.data.result };
  } catch (error) {
    console.error('Error submitting exam:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to submit exam',
    };
  }
}; 