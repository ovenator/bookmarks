import './App.css';

import { ReactSortable } from "react-sortablejs";
import {useDispatch, useSelector} from "react-redux";

import * as layoutBackend from './backend/layout';
import TabSelector from "./TabSelector";
import BookmarkTree from "./BookmarkTree";
import {omitFolders} from "./util/filters";

const {openAll} = require('./util/navigation');

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

    const tabIds = itemsById[rootItemId].children;

    return (
        <div className="flex">
            <div className="shrink-0 p-4">
                <TabSelector/>
            </div>

            <div className="flex border container">
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
                                    <div className="pb-2 pt-1">
                                        <h2 className="font-black" onMouseDown={e => openAll(e, {item, itemsById})} key={item.id}>{item.title} ({item.id})</h2>
                                    </div>
                                    <BookmarkTree {...{item, filter: item.isVirtualRoot ? omitFolders : null}}/>
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
