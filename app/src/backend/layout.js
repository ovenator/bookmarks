const debug = require('debug')('app:backend:layout');

const EventEmitter = require('events');
const layoutObserver = new EventEmitter();

/**
 * @typedef Item
 * @property {String} id
 */


/**
 * @typedef Tab
 * @property {String} id
 * @property {Item[]} children
 */


/**
 * @typedef Layout
 */


let storage = localStorage;
// for testing
export function setStorage(_storage) {
    storage = _storage
}

function setItem(key, data) {
    storage.setItem('layout', JSON.stringify(data));
}

function getItem(key) {
    return JSON.parse(storage.getItem(key) || '{}');
}

/**
 * @param {{tabs: Tab[]}} params
 * @returns {{layout: Layout}}
 */
export function getLayout({tabs}) {

    //recalculate card -> column placement
    let newLayout = {};
    let oldLayout = getItem('layout');

    let existingIds = {};
    for (let tab of tabs) {
        for (let child of tab.children) {
            existingIds[child.id] = true;
        }
    }

    //each tab
    for (let tab of tabs) {
        const seen = {};
        const oldCols = oldLayout[tab.id] ?? [[], [], []];
        const newCols = [[], [], []];

        //each col
        for (let col_ix = 0; col_ix < 3; col_ix ++) {
            let newIds = newCols[col_ix] = []
            for (let item_id of oldCols[col_ix]) {
                //remove missing bookmarks from layout
                if (!existingIds[item_id]) {
                    continue;
                }
                newIds.push(item_id);
                seen[item_id] = true;
            }
        }

        //place before unseen cards
        let ix = 0;
        for(let tab_child of tab.children) {
            if (!seen[tab_child.id]) {
                newCols[ix % 3].unshift(tab_child.id);
                ix ++;
            }
        }

        newLayout[tab.id] = newCols;
    }

    setItem('layout', newLayout);

    layoutObserver.emit('change', {layout: newLayout});

    return {layout: newLayout};
}


export function init(params) {
    getLayout(params)
}


export function move({item_id, col_ix, index}) {
    let oldLayout = getItem('layout');
    let newLayout = getItem('layout'); //deep clone
    let original_tab_item_id = null;

    //find and remove item from original column
    for (let [tab_item_id, columns] of Object.entries(oldLayout)) {
        for (let column_ix = 0; column_ix < 3; column_ix++) {
            const column = columns[column_ix]
            const item_index = column.indexOf(item_id);
            if (item_index === -1) {
                continue;
            }
            original_tab_item_id = tab_item_id;
            newLayout[original_tab_item_id][column_ix] = [...column.slice(0, item_index), ...column.slice(item_index + 1)]
        }
    }

    if (original_tab_item_id === null) {
        console.error('Could not find original tab_item_id for item_id', item_id);
        return;
    }

    //place to new column/index
    const newColumn = newLayout[original_tab_item_id][col_ix]
    newLayout[original_tab_item_id][col_ix] = [...newColumn.slice(0, index), item_id, ...newColumn.slice(index)];

    setItem('layout', newLayout);

    layoutObserver.emit('change', {layout: newLayout});

    return {layout: newLayout}
}


export function onChange(cb) {
    layoutObserver.on('change', cb);
}