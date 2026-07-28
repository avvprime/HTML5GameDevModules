import SDK from "./SDK";
import type { AdCallbacks } from "./types";

export default class PokiSDK extends SDK {

    public async init(): Promise<any> {
        try {
            await window.PokiSDK.init();
            
            this._midgameAdsAvailable = true;
            this._rewardedAdsAvailable = true;

            return true;
        } catch (error) {
            console.log("Couldn't initialize PokiSDK", error);
            return false;
        }
    }

    public gameLoadStart(): void {
        console.log("PokiSDK: GameLoadStart");
    }

    public gameLoadEnd(): void {
        window.PokiSDK.gameLoadingFinished();
    }

    public gamePlayStart(): void {
        window.PokiSDK.gameplayStart();
    }

    public gamePlayEnd(): void {
        window.PokiSDK.gameplayStop();
    }

    public clearData() {
        console.log("PokiSDK: Method not implemented: clearData");
    }

    public getItem(_key: string): string | null {
        console.log("PokiSDK: Method not implemented: getItem");
        return null
    }
    
    public setItem(_key: string, _value: string) {
        console.log("PokiSDK: Method not implemented: setItem");
    }
    
    public removeItem(_key: string) {
        console.log("PokiSDK: Method not implemented: removeItem");
    }

    public requestMidgameAd(key: string, callbacks: AdCallbacks): void {
        window.PokiSDK.commercialBreak(() => {
            callbacks.onStarted(key);
        }).then(() => {
            callbacks.onFinished(key);
        }).catch((err: any) => {
            console.log(err);
            callbacks.onFailed(key);
        });
    }

    public requestRewardedAd(key: string, callbacks: AdCallbacks): void {
        window.PokiSDK.rewardedBreak(() => {
            callbacks.onStarted(key);
            console.log("PokiSDK: Rewarded Ad started")
        }).then((success: any) => {
            if (success) {
                console.log("PokiSDK: Rewarded Ad finished")
                callbacks.onFinished(key);
                callbacks.onRewarded(key);
            }
        })
    }
    
}