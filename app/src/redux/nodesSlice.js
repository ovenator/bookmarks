import { createSlice } from '@reduxjs/toolkit'

const debug = require('debug')('app:nodesSlice');


export const nodesSlice = createSlice({
    name: 'nodes',
    /**
     * @typedef NodesSlice
     * @param {Object<String, BNodeWrapped>} nodesById
     * @param {String} rootId id of the folder id of currently displayed cards
     * @param {String[]} rootNodeIds folders eligible to be selected as root id
     */

    /**
     * @type {NodesSlice}
     */
    initialState: {
        rootItemId: null,
        currentTabItemId: localStorage.getItem('currentTabItemId'),
        folderExpand: JSON.parse(localStorage.getItem('folderExpand')),
        itemsById: {},
        layout: null
    },
    reducers: {
        /**
         * @param state
         * @param {String} action.payload.parent_id
         * @param {String} action.payload.child_ids
         */
        setChildren: (state, action) => {
            debug('setChildren', action);
            const {parent_id, child_ids} = action.payload;
            state.itemsById[parent_id].children = child_ids;
        },
        /**
         * @param state
         * @param {String} action.payload.col_id
         * @param {String} action.payload.child_ids
         */
        setColumnChildren: (state, action) => {
            debug('setColumnChildren', action);
            const {col_id, child_ids} = action.payload;
            child_ids.forEach((id, index) => {
                state.itemsById[id].column = {id: col_id, index}
            })
        },
        /**
         * @param state
         * @param {String} action.payload.id
         */
        setCurrentTabItem: (state, action) => {
            const {id} = action.payload;
            state.currentTabItemId = id;
            localStorage.setItem('currentTabItemId', id);
        },
        /**
         * @param state
         * @param {Object<String, Object>} action.payload.itemsById items keyed by item id
         * @param {String} action.payload.rootItemId item which contains the tab folders
         */
        setData: (state, action) => {
            debug('settingData', action);
            const {itemsById, rootItemId} = action.payload;
            state.itemsById = itemsById;
            state.rootItemId = rootItemId;
            const rootChildren = itemsById[state.rootItemId].children;

            // if there is no bookmarks
            if(!rootChildren.length) {
                state.currentTabItemId = null;
                return;
            }

            //set current tab initially or if the tab folder was removed
            if (state.currentTabItemId === null || !itemsById[state.currentTabItemId]) {
                state.currentTabItemId = rootChildren[0];
            }

        },
        /**
         * @param state
         * @param {Object<String, String[][]>} action.payload.layout array of arrays(columns) of item ids keyed by tab item id
         */
        setLayout: (state, action) => {
            state.layout = action.payload.layout
        },
        /**
         * @param state
         * @param {TreeSlice} action.payload
         */
        setTree: (state, action) => {

            state.tree = action.payload;
            state.currentTabItemId = action.payload.currentTabId ?? state.currentTabItemId;

        },
        toggleFolderExpand(state, action) {
            state.folderExpand ??= {};
            const {view_id, folder_id} = action.payload;
            state.folderExpand[view_id] ??= {};
            state.folderExpand[view_id][folder_id] = !state.folderExpand[view_id][folder_id];
            localStorage.setItem('folderExpand', JSON.stringify(state.folderExpand));
        }
    },
})

export const { setChildren, setColumnChildren, setCurrentTabItem, setData, setLayout, setTree, toggleFolderExpand } = nodesSlice.actions

export default nodesSlice.reducer