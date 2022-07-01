import './App.css';

import { ReactSortable } from "react-sortablejs";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentTabItem} from "./redux/nodesSlice";
import {setCurrentTabId} from "./redux/treeSlice";
import treeStore from './redux/treeStore';

import * as bookmarksBackend from "./backend/bookmarks";
import * as layoutBackend from './backend/layout';
import BookmarkTree from "./BookmarkTree";


const debug = require('debug')('app:components:TabSelector');

const TabSelector = () => {
    const dispatch = useDispatch();

    const rootItemId = useSelector(state => state.nodes.rootItemId);
    const currentTabItemId = useSelector(state => state.nodes.currentTabItemId);
    const itemsById = useSelector(state => state.nodes.itemsById);

    return (
        <div>
            <BookmarkTree item={itemsById[rootItemId]} filter={({item}) => !!item.children} onPick={({item}) => dispatch(setCurrentTabItem({id: item.id}))}/>
        </div>
    );
};



export default TabSelector;
