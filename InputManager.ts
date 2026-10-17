import { ScaleManager } from "./ScaleManager";

interface ButtonState {
    down: boolean;
    pressed: boolean;
}

interface Vector2 {
    x: number;
    y: number;
}

interface TouchState extends ButtonState {
    position: Vector2;
}

interface MouseState {
    position: Vector2;
    lmb: ButtonState;
    mmb: ButtonState;
    rmb: ButtonState;
}

const MOUSE_BUTTON = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
} as const;

class InputManager {
    private static _instance: InputManager;
    private _hasTouchScreen: boolean;

    private _touch: TouchState = {
        position: { x: 0, y: 0 },
        down: false,
        pressed: false
    };

    private _mouse: MouseState = {
        position: { x: 0, y: 0 },
        lmb: { down: false, pressed: false },
        mmb: { down: false, pressed: false },
        rmb: { down: false, pressed: false }
    };

    private _key: Record<string, ButtonState> = {
        ArrowUp: { down: false, pressed: false },
        ArrowDown: { down: false, pressed: false },
        ArrowLeft: { down: false, pressed: false },
        ArrowRight: { down: false, pressed: false },
        KeyW: { down: false, pressed: false },
        KeyS: { down: false, pressed: false },
        KeyA: { down: false, pressed: false },
        KeyD: { down: false, pressed: false },
        Space: { down: false, pressed: false }
    };

    private _keyList: string[] = [
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
        "KeyW", "KeyS", "KeyA", "KeyD", "Space"
    ];

    private _keyMap: Record<string, string[]> = {
        Up: ["ArrowUp", "KeyW"],
        Down: ["ArrowDown", "KeyS"],
        Left: ["ArrowLeft", "KeyA"],
        Right: ["ArrowRight", "KeyD"],
        Jump: ["Space"]
    };

    private _revKeyMap: Record<string, string> = {
        ArrowUp: "Up", KeyW: "Up",
        ArrowDown: "Down", KeyS: "Down",
        ArrowLeft: "Left", KeyA: "Left",
        ArrowRight: "Right", KeyD: "Right",
        Space: "Jump"
    };

    // --- Double Buffering Queues ---
    private _nextFrameKeysPressed: Set<string> = new Set();
    private _nextFrameMousePressed: Set<number> = new Set();
    private _nextFrameTouchPressed: boolean = false;

    private constructor() {
        const hasTouchScreen = (
            'ontouchstart' in window || 
            navigator.maxTouchPoints > 0
        );

        this._hasTouchScreen = hasTouchScreen;

        // Always add desktop listeners (many touch devices also have keyboards/mice)
        this.addDesktopListeners();
        
        // Add mobile listeners additionally if supported
        if (hasTouchScreen) {
            this.addMobileListeners();
        }
    }

    public static get instance(): InputManager {
        if (!InputManager._instance) InputManager._instance = new InputManager();
        return InputManager._instance;
    }

    public isDown(key: string): boolean {
        const codes = this._keyMap[key];
        if (codes === undefined) {
            console.warn("Input: Couldn't find the key: ", key);
            return false;
        }

        for (let i = 0; i < codes.length; i++) {
            const _key = this._key[codes[i]];
            if (_key.down) return true;
        }
        return false;
    }

    public isPressed(key: string): boolean {
        const codes = this._keyMap[key];
        if (codes === undefined) {
            console.warn("Input: Couldn't find the key: ", key);
            return false;
        }

        for (let i = 0; i < codes.length; i++) {
            const _key = this._key[codes[i]];
            if (_key.pressed) return true;
        }
        return false;
    }

    public get Mouse(): MouseState {
        return this._mouse;
    }

    public get Touch(): TouchState {
        return this._touch;
    }

    public get hasTouchScreen(): boolean {
        return this._hasTouchScreen;
    }

    // Call this at the VERY START of your update loop
    public loopClear(): void {
        // 1. Reset all current 'pressed' states to false
        this._mouse.lmb.pressed = false;
        this._mouse.mmb.pressed = false;
        this._mouse.rmb.pressed = false;
        this._touch.pressed = false;

        for (let i = 0; i < this._keyList.length; i++) {
            this._key[this._keyList[i]].pressed = false;
        }

        // 2. Apply buffered presses that happened between frames to the current frame
        this._nextFrameKeysPressed.forEach(code => {
            if (this._key[code]) this._key[code].pressed = true;
        });

        this._nextFrameMousePressed.forEach(button => {
            if (button === MOUSE_BUTTON.LEFT) this._mouse.lmb.pressed = true;
            if (button === MOUSE_BUTTON.MIDDLE) this._mouse.mmb.pressed = true;
            if (button === MOUSE_BUTTON.RIGHT) this._mouse.rmb.pressed = true;
        });

        if (this._nextFrameTouchPressed) {
            this._touch.pressed = true;
        }

        // 3. Clear buffers for the next frame
        this._nextFrameKeysPressed.clear();
        this._nextFrameMousePressed.clear();
        this._nextFrameTouchPressed = false;
    }

    public free(): void {
        this.removeDesktopListeners();
        if (this._hasTouchScreen) {
            this.removeMobileListeners();
        }
    }

    // --- Listeners using Arrow Functions (Solves the .bind memory leak) ---

    private addMobileListeners(): void {
        document.addEventListener('touchstart', this.onTouchStart);
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);
    }

    private removeMobileListeners(): void {
        document.removeEventListener('touchstart', this.onTouchStart);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
    }

    private addDesktopListeners(): void {
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }   

    private removeDesktopListeners(): void {
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    // --- Event Handlers ---

    private onTouchStart = (e: TouchEvent): void => {
        const touch = e.touches[0];
        
        this._touch.down = true;
        this._nextFrameTouchPressed = true; // Buffer the press
        
        this.savePosition(this._touch, touch.clientX, touch.clientY);
    }

    private onTouchMove = (e: TouchEvent): void => {
        const touch = e.touches[0];
        this.savePosition(this._touch, touch.clientX, touch.clientY);
    }

    private onTouchEnd = (_e: TouchEvent): void => {
        this._touch.down = false;
    }

    private onMouseDown = (e: MouseEvent): void => {
        switch (e.button) {
            case MOUSE_BUTTON.LEFT:
                this._mouse.lmb.down = true;
                this._nextFrameMousePressed.add(MOUSE_BUTTON.LEFT);
                break;
            case MOUSE_BUTTON.MIDDLE: 
                this._mouse.mmb.down = true;
                this._nextFrameMousePressed.add(MOUSE_BUTTON.MIDDLE);
                break;
            case MOUSE_BUTTON.RIGHT:
                this._mouse.rmb.down = true;
                this._nextFrameMousePressed.add(MOUSE_BUTTON.RIGHT);
                break;
        }
        
        this.savePosition(this._mouse, e.clientX, e.clientY);
    }

    private onMouseMove = (e: MouseEvent): void => {
        this.savePosition(this._mouse, e.clientX, e.clientY);
    }

    private onMouseUp = (e: MouseEvent): void => {
        switch (e.button) {
            case MOUSE_BUTTON.LEFT: this._mouse.lmb.down = false; break;
            case MOUSE_BUTTON.MIDDLE: this._mouse.mmb.down = false; break;
            case MOUSE_BUTTON.RIGHT: this._mouse.rmb.down = false; break;
        }

        this.savePosition(this._mouse, e.clientX, e.clientY);
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        if (this._revKeyMap[e.code] === undefined) return;

        // Prevent OS key repeat delay from triggering multiple presses
        if (this._key[e.code].down) return; 
        
        this._key[e.code].down = true;
        this._nextFrameKeysPressed.add(e.code); // Buffer the press
    }

    private onKeyUp = (e: KeyboardEvent): void => {
        if (this._revKeyMap[e.code] === undefined) return;
        this._key[e.code].down = false;
    }

    private savePosition(item: any, x: number, y: number): void {
        const margin = ScaleManager.instance.margin;
        const ratio = ScaleManager.instance.scale.x;
        item.position.x = (x - margin.x) / ratio;
        item.position.y = (y - margin.y) / ratio;
    }
}

const Input = InputManager.instance;
export default Input;
