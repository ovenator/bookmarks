import './App.css';

import {useDispatch, useSelector} from "react-redux";
import {setCurrentTabItem} from "./redux/nodesSlice";

import BookmarkTree from "./BookmarkTree";


const debug = require('debug')('app:components:TabSelector');

const TabSelector = () => {
    const dispatch = useDispatch();

    const rootItemId = useSelector(state => state.nodes.rootItemId);
    const itemsById = useSelector(state => state.nodes.itemsById);

    return (
        <div>
            <BookmarkTree item={itemsById[rootItemId]} filter={({item}) => !!item.children} onPick={({item}) => dispatch(setCurrentTabItem({id: item.id}))}/>
        </div>
    );
};



export default TabSelector;
