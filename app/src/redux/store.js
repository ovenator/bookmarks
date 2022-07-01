import {configureStore, createStore, combineReducers} from '@reduxjs/toolkit'
import nodes, {setData, setLayout, setTree} from './nodesSlice'
import * as bookmarks from '../backend/bookmarks';
import * as layout from '../backend/layout';

const debug = require('debug')('app:store');

const reducer = {
    nodes,
}

const store = configureStore({
    reducer
});

bookmarks.onChange((data) => {
    const {itemsById, rootItemId} = data;
    // const folderIds = itemsById[rootItemId].children;
    const folderIds = Object.values(itemsById).filter((item) => !!item.children).map(item => item.id);
    debug('setting layout', itemsById, rootItemId, folderIds);
    layout.calculateLayout({
        tabs: folderIds.map(tab_id => {
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

layout.onChange((data) => {
    debug('layout.onChange', data);
    store.dispatch(setLayout(data));
});



export default store;