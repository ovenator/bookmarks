import {configureStore} from '@reduxjs/toolkit'
import tree from './treeSlice'

const debug = require('debug')('app:store');

const reducer = {
    tree,
}

const store = configureStore({
    reducer
});

store.subscribe(() => {
    localStorage.setItem('tree', JSON.stringify(store.getState().tree));
})

export default store;