import {configureStore, createStore, combineReducers} from '@reduxjs/toolkit'
import nodes, {setData, setLayout} from './nodesSlice'
import * as backend from '../backend';
import * as mockBackend from '../backend/mockBackend';
import * as layout from '../backend/layout';

const debug = require('debug')('app:store');

backend.setBackend(mockBackend);

const reducer = {
    nodes,
}

const store = configureStore({
    reducer
});

layout.onChange((data) => {
    debug('layout.onChange', data);
    store.dispatch(setLayout(data));
});

backend.getBackend().onChange((data) => {

    store.dispatch(setData(data));

    const {itemsById, rootItemId} = data;
    const tabIds = itemsById[rootItemId].children;
    layout.getLayout({tabs: tabIds.map(tab_id => {
            return {
                id: tab_id,
                children: itemsById[tab_id].children.filter(item_id => itemsById[item_id].children).map(item_id => ({id: item_id}))
            }
        })})
})

backend.getBackend().load();




store.subscribe(() => {
    // persistLayout(store.getState());
})

export default store;