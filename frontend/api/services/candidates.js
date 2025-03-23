import api from './api';

export const createCandidate = async (candidateData) => {
  try {
    const response = await api.post('/candidates', candidateData);
    return { success: true, candidate: response.data.candidate };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to create candidate',
    };
  }
};

export const getCandidate = async (candidateId) => {
  try {
    const response = await api.get(`/candidates/${candidateId}`);
    return { success: true, candidate: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch candidate',
    };
  }
};

export const getExamCandidates = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}/candidates`);
    return { success: true, candidates: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch candidates',
    };
  }
};

export const getCandidates = async () => {
  try {
    const response = await api.get('/candidates');
    return { success: true, candidates: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to fetch candidates',
    };
  }
};

export const updateCandidate = async (candidateId, candidateData) => {
  try {
    const response = await api.put(`/candidates/${candidateId}`, candidateData);
    return { success: true, candidate: response.data.candidate };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to update candidate',
    };
  }
};

export const deleteCandidate = async (candidateId) => {
  try {
    await api.delete(`/candidates/${candidateId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to delete candidate',
    };
  }
};

export const resendInvitation = async (candidateId) => {
  try {
    const response = await api.post(`/candidates/${candidateId}/send-invitation`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to send invitation',
    };
  }
}; 