const debug = require('debug')('mock:mockBackend');

const EventEmitter = require('events');
const bookmarksObserver = new EventEmitter();
const layoutObserver = new EventEmitter();

let rootItemId = '0';
let itemsById = {};

const mock = require('./mockData.private');


function traverse({children}) {
    if (children?.length) {
        children.forEach(ch => {
            itemsById[ch.id] = {id: ch.id, url: ch.url, title: ch.title, children: ch.children?.map(ch => ch.id)}
            traverse({children: ch.children});
        });
    }


}

traverse({children: mock});


{
    const tabIds = itemsById[rootItemId].children;
    for (let tabId of tabIds) {
        const tabItem = itemsById[tabId];

        if (!tabItem.children) {
            continue;
        }

        const tabRootItemIds = [];
        for (let itemId of tabItem.children) {
            if(!itemsById[itemId].children) {
                tabRootItemIds.push(itemId);
            }
        }
        const tabRootId = `${tabId}$$$root`;
        itemsById[tabRootId] = {
            id: tabRootId,
            title: '[ROOT]',
            children: tabRootItemIds
        };
        tabItem.children.push(tabRootId);
    }

}



export function getItems() {
    return itemsById;
}

export async function move({item_id, parent_id, index}) {
    const item = itemsById[item_id];

    if (!item) {
        throw new Error('Missing item' + item_id);
    }


    let newData = itemsById;
    //remove item from previous parent
    for (const [key, value] of Object.entries(itemsById)) {
        const removeIndex = value.children?.indexOf(item_id)
        if (removeIndex > -1) {
            const newChildren = [...value.children.slice(0, removeIndex), ...value.children.slice(removeIndex + 1)]
            newData = {...newData, [key]: {...newData[key], children: newChildren}};
        }
    }

    //using new data for cases when the parent stays the same
    const parent = newData[parent_id];

    if (!parent) {
        throw new Error('Missing parent' + item_id);
    }

    //add item to nex parent
    let _index = index ?? parent.children.length;
    const newChildren = [...parent.children.slice(0, _index), item_id, ...parent.children.slice(_index)];
    newData = {...newData, [parent_id]: {...newData[parent_id], children: newChildren}};

    itemsById = newData;
    bookmarksObserver.emit('change', {itemsById, rootItemId});
}

export function load() {
    bookmarksObserver.emit('change', {itemsById, rootItemId});
}

export function onChange(cb) {
    bookmarksObserver.on('change', cb);
}
