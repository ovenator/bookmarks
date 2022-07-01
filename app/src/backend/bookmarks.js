const debug = require('debug')('app:mockBackend');
const EventEmitter = require('events');
const bookmarksObserver = new EventEmitter();

let bookmarks;
if (localStorage.getItem('mock_bookmarks') === 'true') {
    bookmarks = require('./__bookmarks_mock');
} else {
    const browser = require('webextension-polyfill');
    bookmarks = browser.bookmarks;
}

async function getBookmarks() {
    const bookmarksTree = await bookmarks.getTree();
    let rootItemId = bookmarksTree[0].id;
    let itemsById = {};

    function traverse({children}) {
        if (children?.length) {
            children.forEach(ch => {
                itemsById[ch.id] = {id: ch.id, url: ch.url, title: ch.title, children: ch.children?.map(ch => ch.id)}
                traverse({children: ch.children});
            });
        }

    }

    traverse({children: bookmarksTree});

    // folder cannot contain folders and bookmarks at the same time, wrap bookmarks into a virtual folder
    function createVirtualRootFolders(item) {
        const {id, children} = item;
        if (!children) {
            return;
        }

        children.forEach(child_id => createVirtualRootFolders(itemsById[child_id]));

        const leafChildrenIds = children.filter(child_id => !itemsById[child_id].children);

        const virtualRootId = `${id}$$$root`;
        itemsById[virtualRootId] = {
            id: virtualRootId,
            isVirtualRoot: true,
            title: '[ROOT]',
            children: leafChildrenIds
        };
        item.children.push(virtualRootId);
    }

    createVirtualRootFolders(itemsById[rootItemId]);

    /**
     * @typedef BookmarkItem
     * @property {String} id
     * @property {String} title
     * @property {String[]} children
     * @property {String?} url
     * @property {Boolean?} isVirtualRoot
     */

    /**
     * @typedef NormalizedBookmarks
     * @property {String} rootItemId
     * @property {Object<String, BookmarkItem>}
     */
    return {rootItemId, itemsById};
}

export async function move(params) {
    const {item_id, parent_id, index} = params;
    debug('moving', params);
    const [currentBookmark] = await bookmarks.get(item_id);
    let newIndex = index;
    debug('currentBookmark', currentBookmark);
    // the bookmark is still in the original place, we do not want to count it in when changing the index
    if (currentBookmark.parentId === parent_id && index > currentBookmark.index) {
        newIndex ++;
    }

    await bookmarks.move(item_id, {parentId: parent_id, index: newIndex});
    await load();
}


// export async function move({item_id, parent_id, index}) {
//     const item = itemsById[item_id];
//
//     if (!item) {
//         throw new Error('Missing item' + item_id);
//     }
//
//
//     let newData = itemsById;
//     //remove item from previous parent
//     for (const [key, value] of Object.entries(itemsById)) {
//         const removeIndex = value.children?.indexOf(item_id)
//         if (removeIndex > -1) {
//             const newChildren = [...value.children.slice(0, removeIndex), ...value.children.slice(removeIndex + 1)]
//             newData = {...newData, [key]: {...newData[key], children: newChildren}};
//         }
//     }
//
//     //using new data for cases when the parent stays the same
//     const parent = newData[parent_id];
//
//     if (!parent) {
//         throw new Error('Missing parent' + item_id);
//     }
//
//     //add item to nex parent
//     let _index = index ?? parent.children.length;
//     const newChildren = [...parent.children.slice(0, _index), item_id, ...parent.children.slice(_index)];
//     newData = {...newData, [parent_id]: {...newData[parent_id], children: newChildren}};
//
//     itemsById = newData;
//     bookmarksObserver.emit('change', {itemsById, rootItemId});
// }


export async function load() {
    bookmarksObserver.emit('change', await getBookmarks());
}

export function onChange(cb) {
    bookmarksObserver.on('change', cb);
}
