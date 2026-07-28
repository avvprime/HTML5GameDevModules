import SDK from "../sdk/SDK";
import { Events, Event } from "./EventManager";

export default class SDKManager {

    private static _instance: SDKManager;
    private _sdk!: SDK;
    private _initialized: boolean = false;
    private _available: boolean = false;

    private constructor() {}

    public static get instance(): SDKManager {
        if (!SDKManager._instance) SDKManager._instance = new SDKManager();
        return SDKManager._instance;
    }

    public async init(sdk: SDK | undefined = undefined): Promise<void> {
        if (sdk === undefined) {
            this._available = false;
            return;
        }

        if (this._initialized) return;
        this._initialized = true;

        this._sdk = sdk;
        this._available = await this._sdk.init();
    }

    public get available(): boolean {
        return this._available;
    }

    public get midgameAdsAvailable(): boolean {
        if (!this._available) return false;
        return this._sdk.midgameAdsAvailable;
    }

    public get rewardedAdsAvailable(): boolean {
        if (this._available) return false;
        return this._sdk.rewardedAdsAvailable;
    }

    public get dataModuleAvailable(): boolean {
        if (!this._available) return false;
        return this._sdk.dataModuleAvailable;
    }

    public gameLoadStart(): void {
        this._sdk.gameLoadStart();
    }
    
    public gameLoadEnd(): void {
        this._sdk.gameLoadEnd();
    }

    public gamePlayStart(): void {
        this._sdk.gamePlayStart();
    }

    public gamePlayEnd(): void {
        this._sdk.gamePlayEnd();
    }

    public clearData(): void {
        this._sdk.clearData();
    }

    public getItem(key: string): string | null {
        return this._sdk.getItem(key);
    }

    public setItem(key: string, value: string): void {
        this._sdk.setItem(key, value);
    }

    public removeItem(key: string): void {
        this._sdk.removeItem(key);
    }

    public requestMidgameAd(key: string): void {
        this._sdk.requestMidgameAd(key, {
            onLoaded: this.onMidgameAdLoaded,
            onStarted: this.onMidgameAdStarted,
            onFinished: this.onMidgameAdFinished,
            onFailed: this.onMidgameAdFailed,
            onRewarded: () => {}
        });
    }

    public requestRewardedAd(key: string): void {
        this._sdk.requestRewardedAd(key, {
            onLoaded: this.onRewardedAdLoaded,
            onStarted: this.onRewardedAdStarted,
            onFinished: this.onRewardedAdFinished,
            onRewarded: this.onRewardedAdRewarded,
            onFailed: this.onRewardedAdFailed,
        });
    }

    

    private onMidgameAdLoaded(key: string): void {
        Events.emit(Event.MIDGAME_AD_LOADED, key);
    }

    private onMidgameAdStarted(key: string): void {
        Events.emit(Event.MIDGAME_AD_STARTED, key);
    }

    private onMidgameAdFinished(key: string): void {
        Events.emit(Event.MIDGAME_AD_FINISHED, key);
    }

    private onMidgameAdFailed(key: string): void {
        Events.emit(Event.MIDGAME_AD_FAILED, key);
    }


    private onRewardedAdLoaded(key: string): void {
        Events.emit(Event.REWARDED_AD_LOADED, key);
    }
    
    private onRewardedAdStarted(key: string): void {
        Events.emit(Event.REWARDED_AD_STARTED, key);
    }

    private onRewardedAdFinished(key: string): void {
        Events.emit(Event.REWARDED_AD_FINISHED, key);
    }

    private onRewardedAdRewarded(key: string): void {
        Events.emit(Event.REWARDED_AD_REWARDED, key);
    }

    private onRewardedAdFailed(key: string): void {
        Events.emit(Event.REWARDED_AD_FAILED, key);
    }

}