import './App.css';

import { ReactSortable } from "react-sortablejs";
import {useDispatch, useSelector} from "react-redux";
import {toggleFolderExpand} from "./redux/nodesSlice";

import * as bookmarksBackend from "./backend/bookmarks";

const {openAll} = require('./util/navigation');

const debug = require('debug')('app:components:BookmarkTree');

const BookmarkTree = (props) => {
    let {item, filter, onPick, viewId, placeholder} = props;

    const dispatch = useDispatch();
    filter ??= ((bookmarkLike) => true);
    onPick ??= (({item}) => true);

    const rootItemId = useSelector(state => state.nodes.rootItemId);
    const currentTabItemId = useSelector(state => state.nodes.currentTabItemId);
    const itemsById = useSelector(state => state.nodes.itemsById);
    const folderExpand = useSelector(state => state.nodes.folderExpand);

    if(!item.children) {
        return null;
    }

    const filteredChildrenIds = item.children.filter(id => filter(itemsById[id]));

    function renderChild(child_id) {
        const item = itemsById[child_id];
        const isExpanded = !!folderExpand?.[viewId]?.[child_id];

        let localFilter = filter;
        if(!isExpanded) {
            localFilter = () => false;
        }

        const openFolderIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>

        const closedFolderIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>

        if (item.children) {
            const filteredChildren = item.children.map(id => itemsById[id]).filter(i => !i.isVirtualRoot).filter(filter);
            const dispatchExpand = () => dispatch(toggleFolderExpand({view_id: viewId, folder_id: child_id}));

            return (
                <div data-item-id={item.id} key={`item-${item.id}`}>
                    <div className="flex gap-1 pb-1 cursor-pointer">
                        <div onClick={dispatchExpand}>
                            {isExpanded ? openFolderIcon : closedFolderIcon}
                        </div>
                        <div onDoubleClick={dispatchExpand} onClick={() => onPick({item})} onMouseDown={e => openAll(e, {item, itemsById})} className={currentTabItemId === child_id ? 'font-bold' : ''} key={child_id}>{itemsById[child_id].title} ({filteredChildren.length}) (id:{child_id})</div>
                    </div>
                    <BookmarkTree {...props} filter={localFilter} item={itemsById[child_id]}/>
                </div>
            )
        }

        return  (
            <div data-item-id={item.id} key={`item-${item.id}`} className="flex gap-1 pb-1">
                <img className="w-5 h-5" src={`http://www.google.com/s2/favicons?domain=${(new URL(item.url)).hostname}`} alt=""/><a href={item.url}>{item.title} ({item.id})</a>
            </div>
        )

    }

    return (
        <ReactSortable
            className="pl-3"
            // SortableJS is making changes to the DOM managed by React,
            // this will prevent React from assuming DOM state and failing to remove already missing elements
            // while still acting as unique key when there is no SortableJS related change
            // https://github.com/SortableJS/react-sortablejs/issues/145
            key={`item-${item.id}-${JSON.stringify(filteredChildrenIds)}`}
            group="item"
            animation={200}
            delayOnTouchStart={true}
            delay={2}
            onAdd={(customEvent) =>    bookmarksBackend.move({filter, parent_id: item.id, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
            onUpdate={(customEvent) => bookmarksBackend.move({filter, parent_id: item.id, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
            list={filteredChildrenIds.map(id => ({...itemsById[id]}))}
            setList={(items) => debug('setList', items)} //ignored, state is changed by onAdd, onUpdate
        >
            {filteredChildrenIds.filter(child_id => !itemsById[child_id].isVirtualRoot).map(renderChild)}
        </ReactSortable>
    )
};



export default BookmarkTree;
