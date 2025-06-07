const initialState = {
    isLoad: true
}

const ReducerCount = (state = initialState, action) => {
    switch(action.type){
        case 'CHANGE_LOAD':
            // Đảm bảo trả về một object mới để React nhận biết trạng thái đã thay đổi
            return {
                ...state,
                isLoad: !action.data
            };
        default:
            return state;
    }
}

export default ReducerCount