// Reducer cho phần tìm kiếm bằng AI/hình ảnh
const initialState = {
  search: ''
};

const ReducerSearch = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_SEARCH':
      return {
        search: action.data
      };
    case 'DELETE_SEARCH':
      return {
        search: action.data
      };
    default:
      return state;
  }
};

export default ReducerSearch;