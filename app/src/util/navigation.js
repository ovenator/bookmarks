const debug = require('debug')('app:util:navigation');

exports.openAll = function openAll(event, {item, itemsById}) {
    debug('openAll', item, event);
    const MOUSE_MIDDLE = 1;

    //on middle click
    if( event.button === MOUSE_MIDDLE && item.children) {
        debug('detected middle button');
        const itemsToOpen = item.children.map(id => itemsById[id]).filter(it => !it.children);

        if (itemsToOpen.length >= 10) {
            if(!window.confirm(`Do you want to open ${itemsToOpen.length} tabs?`)) {
                return;
            }
        }

        itemsToOpen.forEach(it => {
            const {url} = it;
            debug('opening url', url);
            window.open(url);
        });
    }
}