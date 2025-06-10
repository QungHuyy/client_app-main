// Reducer cho phần tìm kiếm bằng AI/hình ảnh
const initialState = {
  matched_products: [],
  loading: false,
  error: null
};

const ReducerSearchResults = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_IMAGE_SEARCH_RESULTS':
      return {
        ...state,
        matched_products: action.payload,
        loading: false,
        error: null
      };
    case 'SET_IMAGE_SEARCH_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_IMAGE_SEARCH_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_IMAGE_SEARCH_RESULTS':
      return {
        ...state,
        matched_products: [],
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

export default ReducerSearchResults; 