
export const Event = {
    MIDGAME_AD_LOADED: 0,
    MIDGAME_AD_STARTED: 1,
    MIDGAME_AD_FINISHED: 2,
    MIDGAME_AD_FAILED: 3,

    REWARDED_AD_LOADED: 4,
    REWARDED_AD_STARTED: 5,
    REWARDED_AD_FINISHED: 6,
    REWARDED_AD_REWARDED: 7,
    REWARDED_AD_FAILED: 8,

    LEVEL_COMPLETED: 9,

    ASSETS_LOADED: 11,
    AUDIO_FILES_LOADED: 12,

    POINTER_DOWN: 13,
    NEXT_LEVEL_BTN_PRESSED: 14,

} as const;

export type Event = typeof Event[keyof typeof Event];

export type Listener = (...args: any[]) => void;

class EventManager {

    private static _instance: EventManager;

    private _events: Partial<Record<Event, Listener[]>> = {}

    private constructor() {

    }

    public static get instance(): EventManager{
        if (EventManager._instance === undefined) EventManager._instance = new EventManager;
        return EventManager._instance;
    }

    on(event: Event, callback: Listener): void {
        const list = (this._events[event] ??= []);
        list.push(callback);
    }

    off(event: Event, callback: Listener): void {
        const events: Listener[] | undefined = this._events[event];
        
        if (events === undefined) {
            console.log("Events: Couldn't find the requested event at 'off' ", event);
            return;
        }

        const idx = events.indexOf(callback);
        if (idx === -1) {
            console.log("Events: Callback already removed ", callback);
            return;
        }

        events.splice(idx, 1); 
    }

    emit(event: Event, ...args: any[]): void {
        const events = this._events[event];
        if (events === undefined) {
            console.log("No event found to emit: ", event);
            return;
        }
        const totalCallbacks: number = events.length;
        for (let i = 0; i < totalCallbacks; i++) {
            events[i](...args);
        }
    }
}

export const Events = EventManager.instance;