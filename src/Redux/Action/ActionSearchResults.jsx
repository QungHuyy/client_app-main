// Actions for image search results
export const setImageSearchResults = (data) => {
  return {
    type: 'SET_IMAGE_SEARCH_RESULTS',
    payload: data
  };
};

export const setImageSearchLoading = (isLoading) => {
  return {
    type: 'SET_IMAGE_SEARCH_LOADING',
    payload: isLoading
  };
};

export const setImageSearchError = (error) => {
  return {
    type: 'SET_IMAGE_SEARCH_ERROR',
    payload: error
  };
};

export const clearImageSearchResults = () => {
  return {
    type: 'CLEAR_IMAGE_SEARCH_RESULTS'
  };
}; 