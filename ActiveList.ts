

export class ActiveList {

    private _list: ActiveRef[] = [];
    private _empty: boolean = true;

    constructor() {

    }

    public get empty(): boolean {
        return this._empty;
    }

    public add(item: ActiveRef): void {
        if (item.currentlyActive) return;

        const idx = this._list.length;
        this._list.push(item);

        item.idx = idx;
        item.currentlyActive = true;

        this._empty = false;
    }

    public remove(item: ActiveRef): void {
    
        const lastItem = this._list.pop();

        if (lastItem === undefined) return;

        if (item.idx === lastItem.idx) {
            item.idx = -1;
            item.currentlyActive = false;
            this._empty = true;
            return;
        }

        this._list[item.idx] = lastItem;
        lastItem.idx = item.idx;
        item.idx = -1;
        item.currentlyActive = false;

        if (this._list.length === 0) this._empty = true;
    }

    public update(deltaMS: number): void {
        const total = this._list.length;
        for (let i = 0; i < total; i++) {
            this._list[i].update(deltaMS);
        }
    }
}

export class ActiveRef {

    public idx: number = -1;
    public currentlyActive: boolean = false;

    public update!: (deltaMS: number) => void;

    constructor(func: ((deltaMS: number) => void)) {
        this.update = func;
    }
}
