import SDKManager from "./SDKManager";

const prefix: string = 'dragondash:';

class DataManager {

    private static _instance: DataManager;
    private _data: Record<string, any> = {
        dataCheck: "", // will be used to check if any data exists or returns null from sdk
        firstTimePlay: "true",
        musicEnabled: "true",
        soundEnabled: "true",
        currentLevel: "1",
    }

    private constructor() { }

    public static get instance(): DataManager {
        if (!DataManager._instance) DataManager._instance = new DataManager();
        return DataManager._instance;
    }

    public load(): void {
        console.log("Loading game save");
        if (SDKManager.instance.dataModuleAvailable) {
            if (SDKManager.instance.getItem('dataCheck') != null) {
                for (const key of Object.keys(this._data)) {
                    const item = SDKManager.instance.getItem(key);
                    this._data[key] = item == null ? this._data[key] : JSON.parse(item);
                }
            }
        }
        else {
            for (const key of Object.keys(this._data)) {
                const item = localStorage.getItem(prefix + key);
                this._data[key] = item == null ? this._data[key] : JSON.parse(item);
            }
        }
    }

    public save(): void {
        if (SDKManager.instance.dataModuleAvailable) {
            for (const key of Object.keys(this._data)) {
                SDKManager.instance.setItem(key, JSON.stringify(this._data[key]));
            }
        }
        else {
            for (const key of Object.keys(this._data)) {
                localStorage.setItem(prefix + key, JSON.stringify(this._data[key]));
            }
        }
    }

    public getItem(key: string): string {
        return this._data[key];
    }

    public setItem(key: string, value: any): boolean {
        if (!(key in this._data)) return false;

        this._data[key] = value;
        return true;
    }

    public saveItem(key: string): void {
        if (!(key in this._data)) {
            console.warn("Couldn't find the key: ", key);
            return;
        }
        const value = this._data[key];
        if (SDKManager.instance.dataModuleAvailable) {
            SDKManager.instance.setItem(key, JSON.stringify(value));
        }
        else {
            localStorage.setItem(prefix + key, JSON.stringify(value));
        }
    }
}

export const Data = DataManager.instance;
