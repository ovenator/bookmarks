import {last} from "lodash";

const debug = require('debug')('app:mockBackend');
const EventEmitter = require('events');
const bookmarksObserver = new EventEmitter();

let bookmarks;
if (localStorage.getItem('mock_bookmarks') === 'true') {
    bookmarks = require('./__bookmarks_mock');
} else {
    const browser = require('webextension-polyfill');
    window._browser = browser;
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
    const {item_id, parent_id, index, filter} = params;
    debug('moving', params);
    const [movingBookmark] = await bookmarks.get(item_id);

    debug('movingBookmark', movingBookmark);

    let actualParentId = parent_id;

    //virtual root folders do have special id not present in bookmarks tree
    if (parent_id.indexOf('$$$root') !== -1) {
        actualParentId = parent_id.split('$$$')[0];
    }

    const [parent] = await bookmarks.getSubTree(actualParentId);

    //when moving within filtered space, the new index needs to be relative to another filtered item
    const childIndexMapping = parent.children.filter(filter);

    let newIndex;
    //when moving to a last place of some other list, the mapping will be missing
    if (childIndexMapping.length > 0) {
        if (childIndexMapping.length > index) {
            newIndex = childIndexMapping[index].index
        } else {
            newIndex = last(childIndexMapping).index + 1;
        }
    } else {
        newIndex = 0;
    }

    // the bookmark is still in the original place, we do not want to count it in when changing the index
    if (movingBookmark.parentId === parent.id && newIndex > movingBookmark.index) {
        newIndex ++;
    }

    await bookmarks.move(item_id, {parentId: actualParentId, index: newIndex});
    await load();
}


export async function load() {
    bookmarksObserver.emit('change', await getBookmarks());
}

export function onChange(cb) {
    bookmarksObserver.on('change', cb);
}
