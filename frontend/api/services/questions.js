import api from './api';

export const createQuestion = async (questionData) => {
  try {
    // Format the data to match the backend API expectations
    const formattedData = {
      exam_id: questionData.exam_id,
      question_text: questionData.question_text || questionData.text, // support both field names
      question_type: questionData.question_type,
      points: questionData.points,
      explanation: questionData.explanation || ''
    };
    
    // Format options if present
    if (questionData.options && questionData.options.length > 0) {
      formattedData.options = questionData.options.map(option => ({
        option_text: option.option_text || option.text, // support both field names
        is_correct: option.is_correct
      }));
    }
    
    console.log('Sending question data to API:', formattedData);
    const response = await api.post('/questions', formattedData);
    return { success: true, question: response.data.question || response.data };
  } catch (error) {
    console.error('Error creating question:', error);
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

export const getQuestions = async (examIdOrFilters) => {
  try {
    let url = '';
    
    // Check if examIdOrFilters is a number or a filters object
    if (typeof examIdOrFilters === 'number' || typeof examIdOrFilters === 'string') {
      // Get questions for a specific exam
      url = `/exams/${examIdOrFilters}/questions`;
    } else {
      // Get all questions with filters
      url = '/questions';
      
      // Add query parameters for filters
      if (examIdOrFilters) {
        const params = new URLSearchParams();
        
        if (examIdOrFilters.examId) {
          params.append('exam_id', examIdOrFilters.examId);
        }
        
        if (examIdOrFilters.type) {
          params.append('question_type', examIdOrFilters.type);
        }
        
        if (examIdOrFilters.search) {
          params.append('search', examIdOrFilters.search);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
    }
    
    const response = await api.get(url);
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
    // Format the data to match the backend API expectations
    const formattedData = {
      exam_id: questionData.exam_id,
      question_text: questionData.question_text || questionData.text, // support both field names
      question_type: questionData.question_type,
      points: questionData.points,
      explanation: questionData.explanation || ''
    };
    
    // Format options if present
    if (questionData.options && questionData.options.length > 0) {
      formattedData.options = questionData.options.map(option => ({
        option_text: option.option_text || option.text, // support both field names
        is_correct: option.is_correct
      }));
    }
    
    console.log('Sending question update data to API:', formattedData);
    const response = await api.put(`/questions/${questionId}`, formattedData);
    return { success: true, question: response.data.question || response.data };
  } catch (error) {
    console.error('Error updating question:', error);
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