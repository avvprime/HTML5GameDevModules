

class InputManager {

    private static _instance: InputManager;
    private _hasTouchScreen: boolean;

    private _touch: any = {
        position: { x: 0, y: 0 },
        down: false,
        pressed: false
    }

    private _mouse: any = {
        position: { x: 0, y: 0 },
        lmb: { down: false , pressed: false },
        mmb: { down: false , pressed: false },
        rmb: { down: false , pressed: false }
    }

    private _key: any = {
        Space: { down: false, pressed: false },
        ArrowUp: { down: false, pressed: false }
    }

    private _keyList: string[] = ["Space", "ArrowUp"];
    private _keyMap: any = {
        Up: ["Space", "ArrowUp"]
    }
    private _revKeyMap: any = {
        Space: "Up",
        ArrowUp: "Up"
    }


    private constructor() {

         const hasTouchScreen = (
            'ontouchstart' in window || 
            navigator.maxTouchPoints > 0
        );

        if (hasTouchScreen) this.addMobileListeners();
        else this.addDesktopListeners();

        this._hasTouchScreen = hasTouchScreen;
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

    public get Mouse(): {
        position: { x: number, y: number },
        lmb: { down: boolean , pressed: boolean },
        mmb: { down: boolean , pressed: boolean },
        rmb: { down: boolean , pressed: boolean }
    } {
        return this._mouse;
    }

    public get Touch(): {
        position: { x: number, y: number },
        down: boolean,
        pressed: boolean
    } {
        return this._touch;
    }

    public loopClear(): void {
        this._mouse.lmb.pressed = false;
        this._mouse.mmb.pressed = false;
        this._mouse.rmb.pressed = false;
        this._touch.pressed = false;


        for (let i = 0; i < this._keyList.length; i++) {
            const keyName = this._keyList[i];
            const key = this._key[keyName];
            key.pressed = false;
        }

    }


    public free(): void {
        if (this._hasTouchScreen) this.removeMobileListeners();
        else this.removeDesktopListeners();
    }



    private addMobileListeners(): void {
        document.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    private removeMobileListeners(): void {
        document.removeEventListener('touchstart', this.onTouchStart.bind(this));
        document.removeEventListener('touchmove', this.onTouchMove.bind(this));
        document.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }

    private addDesktopListeners(): void {
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }   

    private removeDesktopListeners(): void {
        document.removeEventListener('mousedown', this.onMouseDown.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('mouseup', this.onMouseUp.bind(this));

        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
    }


    private onTouchStart(e: TouchEvent): void {
        const touch = e.touches[0];

        this._touch.down = true;
        this._touch.pressed = true;
        this._touch.position.x = touch.clientX;
        this._touch.position.y = touch.clientY;
    }

    private onTouchMove(e: TouchEvent): void {
        const touch = e.touches[0];

        this._touch.position.x = touch.clientX;
        this._touch.position.y = touch.clientY;
    }

    private onTouchEnd(e: TouchEvent): void {
        const touch = e.touches[0];
        
        this._touch.down = false;
        this._touch.position.x = touch.clientX;
        this._touch.position.y = touch.clientY;
    }

    private onMouseDown(e: MouseEvent): void {
        switch (e.button) {
            case 0:
                this._mouse.lmb.down = true;
                this._mouse.lmb.pressed = true;
                break;
            case 1: 
                this._mouse.mmb.down = true;
                this._mouse.mmb.pressed = true;
                break;
            case 2:
                this._mouse.rmb.down = true;
                this._mouse.rmb.pressed = true;
                break;
            default:
                break;
        }
        
        this._mouse.position.x = e.clientX;
        this._mouse.position.y = e.clientY;
    }

    private onMouseMove(e: MouseEvent): void {
        this._mouse.position.x = e.clientX;
        this._mouse.position.y = e.clientY;
    }

    private onMouseUp(e: MouseEvent): void {
        switch (e.button) {
            case 0:
                this._mouse.lmb.down = true;
                break;
            case 1: 
                this._mouse.mmb.down = true;
                break;
            case 2:
                this._mouse.rmb.down = true;
                break;
            default:
                break;
        }

        this._mouse.position.x = e.clientX;
        this._mouse.position.y = e.clientY;
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (this._revKeyMap[e.code] === undefined) return;


        if (this._key[e.code].down) return;
        this._key[e.code].pressed = true;
        this._key[e.code].down = true;
    }

    private onKeyUp(e: KeyboardEvent): void {
        if (this._revKeyMap[e.code] === undefined) return;

        this._key[e.code].down = false;
    }

}

const Input = InputManager.instance;

export default Input;