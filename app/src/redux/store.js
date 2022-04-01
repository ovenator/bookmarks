import {configureStore, createStore, combineReducers} from '@reduxjs/toolkit'
import nodes, {setData, setLayout} from './nodesSlice'
import * as bookmarks from '../backend/bookmarks';
import * as layout from '../backend/layout';

const debug = require('debug')('app:store');

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

bookmarks.onChange((data) => {
    const {itemsById, rootItemId} = data;
    const tabIds = itemsById[rootItemId].children;
    debug('setting layout', itemsById, rootItemId, tabIds);
    layout.calculateLayout({
        tabs: tabIds.map(tab_id => {
            return {
                id: tab_id,
                children: itemsById[tab_id].children.filter(item_id => itemsById[item_id].children).map(item_id => ({id: item_id}))
            }
        })
    });

    debug('setting data', data);

    store.dispatch(setData(data));

})

bookmarks.load();




store.subscribe(() => {
    // persistLayout(store.getState());
})

export default store;