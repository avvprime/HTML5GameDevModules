import SDK from "./SDK";
import type { AdCallbacks } from "./types";

export default class CrazyGamesSDK extends SDK {
    constructor() {
        super();
    }

    public async init(): Promise<any> {
        try {
            await window.CrazyGames.SDK.init();

            this._midgameAdsAvailable = true;
            this._rewardedAdsAvailable = true;
            this._dataModuleAvailable = true;

            return true;
        }
        catch(err) {
            console.log("CrazyGamesSDK: Couldn't initialize");
            return false;
        }
    }

    public gameLoadStart(): void {
        window.CrazyGames.SDK.game.loadingStart();
    }
    public gameLoadEnd(): void {
        window.CrazyGames.SDK.game.loadingStop();
    }
    
    public gamePlayStart(): void {
        window.CrazyGames.SDK.game.gameplayStart();
    }
    public gamePlayEnd(): void {
        window.CrazyGames.SDK.game.gameplayStop();
    }

    public clearData(): void {
        window.CrazyGames.SDK.data.clear();
    }

    public getItem(key: string): string | null {
        return window.CrazyGames.SDK.data.getItem(key);
    }

    public setItem(key: string, value: string): void {
        window.CrazyGames.SDK.data.setItem(key, value);
    }

    public removeItem(key: string): void {
        window.CrazyGames.SDK.data.removeItem(key);
    }

    public requestMidgameAd(key: string, callbacks: AdCallbacks): void {
        const _callbacks = {
            adStarted: () => {
                callbacks.onStarted(key);
            },
            adError: (err: any) => {
                console.log("CrazyGamesSDK: Midgame ad failed ", err);
                callbacks.onFailed(key);
            },
            adFinished: () => {
                callbacks.onFinished(key);
            }
        }
        window.CrazyGames.SDK.ad.requestAd('midgame', _callbacks);
    }
    public requestRewardedAd(key: string, callbacks: AdCallbacks): void {
        const _callbacks = {
            adStarted: () => {
                callbacks.onStarted(key);
            },
            adError: (err: any) => {
                console.log("CrazyGamesSDK: Rewarded ad failed ", err);
                callbacks.onFailed(key);
            },
            adFinished: () => {
                callbacks.onFinished(key);
                callbacks.onRewarded(key);
            }
        }
        window.CrazyGames.SDK.ad.requestAd('rewarded', _callbacks);
    }
}