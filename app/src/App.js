import './App.css';

import { ReactSortable } from "react-sortablejs";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentTabItem} from "./redux/nodesSlice";
import {setCurrentTabId} from "./redux/treeSlice";
import treeStore from './redux/treeStore';

import * as bookmarksBackend from "./backend/bookmarks";
import * as layoutBackend from './backend/layout';


const debug = require('debug')('app:app');

const App = () => {

    const dispatch = useDispatch();

    const rootItemId = useSelector(state => state.nodes.rootItemId);
    const currentTabItemId = useSelector(state => state.nodes.currentTabItemId);
    const itemsById = useSelector(state => state.nodes.itemsById);
    const layout = useSelector(state => state.nodes.layout);

    if (rootItemId === null) {
        return (<div>Loading...</div>);
    }

    if (currentTabItemId === null) {
        return (<div>Root folder is empty</div>);
    }

    debug('currentTabItemId', currentTabItemId);
    debug('itemsById', itemsById);

    const tabRootItem = itemsById[currentTabItemId];
    debug('tabRootItem', tabRootItem);

    function tree({item}) {
        if(!item.children) {
            return null;
        }

        function renderChild(child_id) {
            const item = itemsById[child_id];
            if (item.children) {
                return (
                    <div data-item-id={item.id} key={`item-${item.id}`}>
                        <div className="flex gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                            </svg>
                            <div key={child_id}>{itemsById[child_id].title} ({child_id})</div>
                        </div>

                        {tree({item: itemsById[child_id]})}
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
                key={`item-${item.id}-${JSON.stringify(item.children)}`}
                group="item"
                animation={200}
                delayOnTouchStart={true}
                delay={2}
                onAdd={(customEvent) => bookmarksBackend.move({parent_id: item.id, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
                onUpdate={(customEvent) => bookmarksBackend.move({parent_id: item.id, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
                list={item.children.map(id => ({...itemsById[id]}))}
                setList={(items) => debug('setList', items)} //ignored, state is changed by onAdd, onUpdate
            >
                {item.children.map(renderChild)}
            </ReactSortable>
        )
    }

    const tabIds = itemsById[rootItemId].children;

    return (
        <div>
            <div className="container mx-auto flex gap-3 p-3">
                {tabIds.map(id => (
                    <div key={`item-${id}`} className={id === currentTabItemId ? 'border-blue-400 border-b-2' : ''} onClick={() => treeStore.dispatch(setCurrentTabId({id}))}>{itemsById[id].title} ({id})</div>
                ))}
            </div>
            <div className="flex border container mx-auto">
                {layout[currentTabItemId].map((col_item_ids, col_ix) => (

                    <div className="flex-grow flex flex-col w-1/3" key={`col-${col_ix}-${JSON.stringify(col_item_ids)}`}>
                        <ReactSortable
                            className="flex-grow gap-2 p-2 flex flex-col"
                            group="card"
                            animation={200}
                            delayOnTouchStart={true}
                            delay={2}
                            list={col_item_ids.map(id => ({...itemsById[id]}))}
                            onAdd={(customEvent) => layoutBackend.move({col_ix, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
                            onUpdate={(customEvent) => layoutBackend.move({col_ix, item_id: customEvent.item.dataset.itemId, index: customEvent.newIndex})} //move
                            setList={(items, sortable) => debug('event:column', col_item_ids, 'items', items, 'sortable', sortable)}
                        >
                            {col_item_ids.map(id => itemsById[id]).map((item) => (
                                <div className="border px-2 py-1 rounded"
                                     key={`item-${item.id}`}
                                     data-item-id={item.id}
                                >
                                    <h2 className="font-black" key={item.id}>{item.title} ({item.id})</h2>
                                    {tree({item})}
                                </div>
                            ))}
                        </ReactSortable>
                    </div>
                ))}

            </div>
        </div>
    );
};



export default App;
