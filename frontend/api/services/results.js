import api from './api';

export const getResult = async (resultId) => {
  try {
    const response = await api.get(`/results/${resultId}`);
    return { success: true, result: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch result',
    };
  }
};

export const getExamResults = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}/results`);
    return { success: true, results: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch results',
    };
  }
};

export const getCandidateResult = async (candidateId) => {
  try {
    const response = await api.get(`/candidates/${candidateId}/result`);
    return { success: true, result: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch result',
    };
  }
};

export const evaluateOpenEnded = async (resultId, evaluationData) => {
  try {
    const response = await api.put(`/results/${resultId}/evaluate`, evaluationData);
    return { success: true, result: response.data.result };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to evaluate answers',
    };
  }
};

export const exportResult = async (resultId, format = 'json') => {
  try {
    const response = await api.get(`/results/${resultId}/export?format=${format}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to export result',
    };
  }
}; 