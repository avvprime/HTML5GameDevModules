function getDpr(): number {
    return window.devicePixelRatio || 1;
}

export const ScaleMode = {
    Stretch: 0,
    Fit: 1,
    Cover: 2,
    Expand: 3,
    Integer: 4
} as const;

export type ScaleMode = (typeof ScaleMode)[keyof typeof ScaleMode];

export class ScaleManager {

    private _clientWidth: number;
    private _clientHeight: number;

    private _physicalWidth: number;
    private _physicalHeight: number;

    private _renderWidth: number;
    private _renderHeight: number;

    private _displayWidth: number;
    private _displayHeight: number;

    private _baseWidth: number;
    private _baseHeight: number;

    private _logicalWidth: number;
    private _logicalHeight: number;

    private _resizeTimer: ReturnType<typeof setTimeout> | null = null;
    
    private _highDpiEnabled: boolean = false;

    private _scaleMode: ScaleMode = ScaleMode.Fit;

    private _scale: { x: number, y: number } = { x: 1, y: 1 };
    private _margin: { x: number, y: number } = { x: 0, y: 0 };

    private _callbacks: ((width: number, height: number) => void)[] = [];
    
    private _canvas!: HTMLCanvasElement;
    private _renderer: any;

    private static _instance: ScaleManager;

    private constructor() {
        this._clientWidth = window.innerWidth;
        this._clientHeight = window.innerHeight;

        const dpr = getDpr();

        this._physicalWidth = window.innerWidth * dpr;
        this._physicalHeight = window.innerHeight * dpr;

        this._renderWidth = window.innerWidth;
        this._renderHeight = window.innerHeight;

        this._displayWidth = window.innerWidth;
        this._displayHeight = window.innerHeight;

        this._baseWidth = window.innerWidth;
        this._baseHeight = window.innerHeight;

        this._logicalWidth = window.innerWidth;
        this._logicalHeight = window.innerHeight;
        
        window.addEventListener('resize', this.onResize.bind(this));
    }

    private onResize(): void {
        if (this._resizeTimer !== null) {
            clearTimeout(this._resizeTimer);
        }
        this._resizeTimer = setTimeout(() => {
            this._resizeTimer = null;
            this.handleResize();
        }, 100);
    }

    private handleResize(): void {
        this._clientWidth = window.innerWidth;
        this._clientHeight = window.innerHeight;

        const dpr = getDpr();

        this._physicalWidth = this._clientWidth * dpr;
        this._physicalHeight = this._clientHeight * dpr;

        if (this._scaleMode !== ScaleMode.Expand) {
            this._logicalWidth = this._baseWidth;
            this._logicalHeight = this._baseHeight;
        }

        switch (this._scaleMode) {
            case ScaleMode.Fit:
                this.handleFitMode(this._clientWidth, this._clientHeight);
                break;
            case ScaleMode.Stretch:
                this.handleStretchMode(this._clientWidth, this._clientHeight);
                break;
            case ScaleMode.Cover:
                this.handleCoverMode(this._clientWidth, this._clientHeight);
                break;
            case ScaleMode.Expand:
                this.handleExpandMode(this._clientWidth, this._clientHeight);
                break;
            case ScaleMode.Integer: 
                this.handleIntegerMode(this._clientWidth, this._clientHeight);
                break;
            default:    
                break;
        }

        const effectiveDpr = this._highDpiEnabled ? dpr : 1;

        this._renderWidth = Math.round(this._displayWidth * effectiveDpr);
        this._renderHeight = Math.round(this._displayHeight * effectiveDpr);

        this._scale.x = this._renderWidth / this._logicalWidth;
        this._scale.y = this._renderHeight / this._logicalHeight;

        if (this._canvas !== undefined) {
            this._canvas.style.width = this._displayWidth + 'px';
            this._canvas.style.height = this._displayHeight + 'px';

            const mx = (this._clientWidth - this._displayWidth) / 2;
            const my = (this._clientHeight - this._displayHeight) / 2;

            this._canvas.style.marginLeft = mx + 'px';
            this._canvas.style.marginTop = my + 'px';

            this._margin.x = mx;
            this._margin.y = my;
        }

        if (this._renderer !== undefined && typeof this._renderer.resize === 'function') {
            this._renderer.resize(this._renderWidth, this._renderHeight);
        }
        
        this.emitSignal();
    }

    private handleFitMode(width: number, height: number): void {
        const scaleX = width / this._logicalWidth;
        const scaleY = height / this._logicalHeight;
        const factor = Math.min(scaleX, scaleY);

        this._displayWidth = this._logicalWidth * factor;
        this._displayHeight = this._logicalHeight * factor;
    }

    private handleStretchMode(width: number, height: number): void {
        this._displayWidth = width;
        this._displayHeight = height;
    }

    private handleCoverMode(width: number, height: number): void {
        const scaleX = width / this._logicalWidth;
        const scaleY = height / this._logicalHeight;
        const factor = Math.max(scaleX, scaleY);

        this._displayWidth = this._logicalWidth * factor;
        this._displayHeight = this._logicalHeight * factor;
    }

    private handleExpandMode(width: number, height: number): void {
        this._displayWidth = width;
        this._displayHeight = height;
        this._logicalWidth = width;
        this._logicalHeight = height;
    }

    private handleIntegerMode(width: number, height: number): void {
        const scaleX = width / this._logicalWidth;
        const scaleY = height / this._logicalHeight;
        const factor = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

        this._displayWidth = this._logicalWidth * factor;
        this._displayHeight = this._logicalHeight * factor;
    }

    private emitSignal(): void {
        const callbacks = [...this._callbacks];
        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i](this._renderWidth, this._renderHeight);
        }
    }

    public static get instance(): ScaleManager {
        if (!ScaleManager._instance) ScaleManager._instance = new ScaleManager();
        return ScaleManager._instance;
    }

    public triggerResize(): void {
        this.handleResize();
    }

    public get margin(): { x: number, y: number } {
        return { x: this._margin.x, y: this._margin.y };
    }

    public get logicalSize(): { width: number, height: number } {
        return { width: this._logicalWidth, height: this._logicalHeight };
    }

    public get clientSize(): { width: number, height: number } {
        return { width: this._clientWidth, height: this._clientHeight };
    }

    public get physicalSize(): { width: number, height: number } {
        return { width: this._physicalWidth, height: this._physicalHeight };
    }

    public get renderSize(): { width: number, height: number } {
        return { width: this._renderWidth, height: this._renderHeight };
    }    

    public get size(): { width: number, height: number } {
        return { width: this._logicalWidth, height: this._logicalHeight };
    }

    public get scale(): { x: number, y: number } {
        return { x: this._scale.x, y: this._scale.y };
    }

    public get scaleMode(): ScaleMode {
        return this._scaleMode;
    }

    public setBaseSize(width: number, height: number): void {
        this._baseWidth = width;
        this._baseHeight = height;
        this._logicalWidth = width;
        this._logicalHeight = height;
    }

    public setScaleMode(mode: ScaleMode): void {
        this._scaleMode = mode;
    }

    public setHiDpi(value: boolean): void {
        this._highDpiEnabled = value;
    }

    public register(canvas: HTMLCanvasElement, renderer: any): void {
        this._canvas = canvas;
        this._renderer = renderer;
    }

    public connect(callback: (width: number, height: number) => void): void {
        this._callbacks.push(callback);
    }

    public disconnect(callback: (width: number, height: number) => void): void {
        const idx = this._callbacks.indexOf(callback);
        if (idx === -1) {
            console.warn("ScaleManager: Callback already removed ", callback);
            return;
        }

        this._callbacks.splice(idx, 1); 
    }
}
