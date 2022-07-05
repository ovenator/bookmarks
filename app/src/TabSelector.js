import './App.css';

import {useDispatch, useSelector} from "react-redux";
import {setCurrentTabItem} from "./redux/nodesSlice";

import BookmarkTree from "./BookmarkTree";
import {onlyFolders} from "./util/filters";

const debug = require('debug')('app:components:TabSelector');

const TabSelector = () => {
    const dispatch = useDispatch();

    const rootItemId = useSelector(state => state.nodes.rootItemId);
    const itemsById = useSelector(state => state.nodes.itemsById);

    return (
        <div>
            <BookmarkTree viewId={rootItemId} item={itemsById[rootItemId]} filter={onlyFolders} onPick={({item}) => dispatch(setCurrentTabItem({id: item.id}))}/>
        </div>
    );
};



export default TabSelector;
