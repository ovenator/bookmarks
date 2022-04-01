import {setStorage, calculateLayout, move} from '../layout';

const data = {}
const storage = {
    getItem(key) {
        return data[key];
    },
    setItem(key, value) {
        data[key] = value;
    }
}

setStorage(storage);

test('should modify layout', async () => {
    let {layout} = calculateLayout({tabs: [
            {id: '0', children: [{id: '0.0'},{id: '0.1'},{id: '0.2'},{id: '0.3'},]},
            {id: '1', children: [{id: '1.0'},{id: '1.1'},{id: '1.2'},{id: '1.3'},]},
            {id: '2', children: [{id: '2.0'},{id: '2.1'},{id: '2.2'},{id: '2.3'},]},
            {id: '3', children: [{id: '3.0'},{id: '3.1'},{id: '3.2'},{id: '3.3'},]}
        ]});

    expect(layout).toEqual({
        '0': [['0.3', '0.0'], ['0.1'], ['0.2']],
        '1': [['1.3', '1.0'], ['1.1'], ['1.2']],
        '2': [['2.3', '2.0'], ['2.1'], ['2.2']],
        '3': [['3.3', '3.0'], ['3.1'], ['3.2']],
    });

    let {layout: layout2} = move({item_id: '1.1', col_ix: 0, index: 1});

    expect(layout2).toEqual({
        '0': [['0.3', '0.0'], ['0.1'], ['0.2']],
        '1': [['1.3', '1.1', '1.0'], [], ['1.2']],
        '2': [['2.3', '2.0'], ['2.1'], ['2.2']],
        '3': [['3.3', '3.0'], ['3.1'], ['3.2']],
    });

    let {layout: layout3} = move({item_id: '1.2', col_ix: 1, index: 10});

    expect(layout3).toEqual({
        '0': [['0.3', '0.0'], ['0.1'], ['0.2']],
        '1': [['1.3', '1.1', '1.0'], ['1.2'], []],
        '2': [['2.3', '2.0'], ['2.1'], ['2.2']],
        '3': [['3.3', '3.0'], ['3.1'], ['3.2']],
    });

    let {layout: layout4} = move({item_id: '1.2', col_ix: 0, index: 10});

    expect(layout4).toEqual({
        '0': [['0.3', '0.0'], ['0.1'], ['0.2']],
        '1': [['1.3', '1.1', '1.0', '1.2'], [], []],
        '2': [['2.3', '2.0'], ['2.1'], ['2.2']],
        '3': [['3.3', '3.0'], ['3.1'], ['3.2']],
    });


    let {layout: layout5} = calculateLayout({tabs: [
            {id: '0', children: [{id: '0.0'},{id: '0.1'},{id: '0.2'},{id: '0.3'},]},
            {id: '1', children: [{id: '1.0'},{id: '1.1'},{id: '1.2'},{id: '1.3'},]},
            {id: '2', children: [{id: '2.0'},{id: '2.1'},{id: '2.2'},{id: '2.3'},]},
            {id: '3', children: [{id: '3.0'},{id: '3.1'},{id: '3.2'},{id: '3.3'},]}
        ]});

    expect(layout5).toEqual({
        '0': [['0.3', '0.0'], ['0.1'], ['0.2']],
        '1': [['1.3', '1.1', '1.0', '1.2'], [], []],
        '2': [['2.3', '2.0'], ['2.1'], ['2.2']],
        '3': [['3.3', '3.0'], ['3.1'], ['3.2']],
    });


    let {layout: layout6} = calculateLayout({tabs: [
            {id: '0', children: [{id: '0.0'},{id: '0.1'},{id: '0.2'},{id: '0.3'},]},
            {id: '1', children: [{id: '1.0'},{id: '1.2'},{id: '1.3'},]},
            {id: '2', children: [{id: '2.0'},{id: '2.1'},{id: '2.2'},{id: '2.3'},]},
            {id: '3', children: [{id: '3.0'},{id: '3.1'},{id: '3.2'},{id: '3.3'},]}
        ]});

    expect(layout6).toEqual({
        '0': [['0.3', '0.0'], ['0.1'], ['0.2']],
        '1': [['1.3', '1.0', '1.2'], [], []],
        '2': [['2.3', '2.0'], ['2.1'], ['2.2']],
        '3': [['3.3', '3.0'], ['3.1'], ['3.2']],
    });
});