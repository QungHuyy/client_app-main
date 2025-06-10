import { combineReducers } from 'redux'
import ReducerCart from './ReducerCart'
import ReducerCount from './ReducerCount'
import ReducerSearch from './ReducerSearch'
import ReducerSession from './ReducerSession'
import ReducerSearchResults from './ReducerSearchResults'

const ReducerRoot = combineReducers({
    Cart: ReducerCart,
    Session: ReducerSession,
    Count: ReducerCount,
    Search: ReducerSearch,
    searchResults: ReducerSearchResults,
})

export default ReducerRoot