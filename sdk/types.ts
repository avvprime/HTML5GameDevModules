
export interface AdCallbacks {
    onLoaded: (key: string) => void;
    onStarted: (key: string) => void;
    onFinished: (key: string) => void;
    onRewarded: (key: string) => void;
    onFailed: (key: string) => void;
}