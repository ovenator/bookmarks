import './App.css';

import { ReactSortable } from "react-sortablejs";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentTabItem} from "./redux/nodesSlice";
import {setCurrentTabId} from "./redux/treeSlice";
import treeStore from './redux/treeStore';

import * as bookmarksBackend from "./backend/bookmarks";
import * as layoutBackend from './backend/layout';


const debug = require('debug')('app:components:BookmarkTree');

const BookmarkTree = (props) => {
    let {item, filter, onPick} = props;

    const dispatch = useDispatch();
    filter ??= (({item}) => true);
    onPick ??= (({item}) => true);

    const rootItemId = useSelector(state => state.nodes.rootItemId);
    const currentTabItemId = useSelector(state => state.nodes.currentTabItemId);
    const itemsById = useSelector(state => state.nodes.itemsById);

    if(!item.children) {
        return null;
    }

    const filteredChildren = item.children.filter(id => filter({item: itemsById[id]}));

    function renderChild(child_id) {
        const item = itemsById[child_id];

        if (item.children) {
            return (
                <div data-item-id={item.id} key={`item-${item.id}`}>
                    <div className="flex gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                        <div onClick={() => onPick({item})} className={currentTabItemId === child_id ? 'font-bold' : ''} key={child_id}>{itemsById[child_id].title} ({child_id})</div>
                    </div>
                    <BookmarkTree {...props} item={itemsById[child_id]}/>
                </div>
            )
        }

        return  (
            <div data-item-id={item.id} key={`item-${item.id}`} className="flex gap-1">
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
            key={`item-${item.id}-${JSON.stringify(filteredChildren)}`}
            group="item"
            animation={200}
            delayOnTouchStart={true}
            delay={2}
            onAdd={(customEvent) => bookmarksBackend.move({parent_id: item.id, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
            onUpdate={(customEvent) => bookmarksBackend.move({parent_id: item.id, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
            list={filteredChildren.map(id => ({...itemsById[id]}))}
            setList={(items) => debug('setList', items)} //ignored, state is changed by onAdd, onUpdate
        >
            {filteredChildren.filter(child_id => !itemsById[child_id].isVirtualRoot).map(renderChild)}
        </ReactSortable>
    )
};



export default BookmarkTree;
