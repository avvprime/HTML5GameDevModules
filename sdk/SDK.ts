import type { AdCallbacks } from "./types";

export default abstract class SDK {

    protected _midgameAdsAvailable: boolean = false;
    protected _rewardedAdsAvailable: boolean = false;
    protected _dataModuleAvailable: boolean = false;

    public async init(): Promise<any> {}

    public abstract gameLoadStart(): void;
    public abstract gameLoadEnd(): void;
    
    public abstract gamePlayStart(): void;
    public abstract gamePlayEnd(): void;

    public abstract clearData(): any;
    public abstract getItem(key: string): string | null;
    public abstract setItem(key: string, value: string): any;
    public abstract removeItem(key: string): any;

    public abstract requestMidgameAd(key: string, callbacks: AdCallbacks): void;
    public abstract requestRewardedAd(key: string, callbacks: AdCallbacks): void;

    
    public get midgameAdsAvailable(): boolean {
        return this._midgameAdsAvailable;
    }

    public get rewardedAdsAvailable(): boolean {
        return this._rewardedAdsAvailable;
    }
    
    public get dataModuleAvailable(): boolean {
        return this._dataModuleAvailable;
    }

}
