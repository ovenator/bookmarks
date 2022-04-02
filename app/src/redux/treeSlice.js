import { createSlice } from '@reduxjs/toolkit'

const debug = require('debug')('app:treeSlice');

function loadState() {
    let state = {
        treeById: {},
        currentTabId: null
    };

    try {
        const persistedState = JSON.parse(localStorage.getItem('tree'));
        if (persistedState && persistedState.treeById) {
            state = persistedState;
        }
    } catch (e) {
        console.error(e);
    }

    return state;
}


export const nodesSlice = createSlice({
    name: 'tree',
    /**
     * @typedef TreeSlice
     * @param {Object<String, TreeNode>} treeById
     * @param {String} currentTabId
     */

    /**
     * @typedef TreeNode
     * @param {String} id
     * @param {Boolean} expanded
     */

    /**
     * @type {TreeSlice}
     */
    initialState: loadState(),
    reducers: {
        /**
         * @param state
         * @param {String} action.payload.id node id
         * @param {Boolean} action.payload.expanded
         */
        setTreeNode: (state, action) => {
            const {id} = action.payload;
            state.treeById[id] = action.payload
        },
        /**
         * @param state
         * @param {String} action.payload.id node id
         * @param {Boolean} action.payload.expanded
         */
        setCurrentTabId: (state, action) => {
            const {id} = action.payload;
            state.currentTabId = id
        }
    },
})

export const { setCurrentTabId, setTreeNode } = nodesSlice.actions

export default nodesSlice.reducer