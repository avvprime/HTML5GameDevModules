

function getDpr(): number {
    return window.devicePixelRatio || 1;
}


export default class ScaleManager {

    private _clientWidth: number;
    private _clientHeight: number;

    private _physicalWidth: number;
    private _physicalHeight: number;

    private _renderWidth: number;
    private _renderHeight: number;

    private _logicalWidth: number;
    private _logicalHeight: number;

    private _resized: boolean = false;
    
    private _highDpiEnabled: boolean = false;

    private _scaleMode: 'stretch' | 'fit' | 'cover' | 'expand' | 'integer' = 'fit';

    private _callbacks: ((width: number, height: number) => void)[] = [];
    
    private _canvas!: HTMLCanvasElement;
    private _renderer: any;


    private static _instance: ScaleManager;


    private constructor() {
        this._clientWidth = window.innerWidth;
        this._clientHeight = window.innerHeight;

        this._physicalWidth = window.innerWidth * (window.devicePixelRatio || 1);
        this._physicalHeight = window.innerHeight * (window.devicePixelRatio || 1);

        this._renderWidth = window.innerWidth;
        this._renderHeight = window.innerHeight; 

        this._logicalWidth = window.innerWidth;
        this._logicalHeight = window.innerHeight;
        
        window.addEventListener('resize', this.onResize.bind(this));
    }

    private onResize(): void {
        if (this._resized) return;
        this._resized = true;
        setTimeout(() => {
            this.handleResize();
            this._resized = false;
        }, 100);
    }

    
    private handleResize(): void {
        this._clientWidth = window.innerWidth;
        this._clientHeight = window.innerHeight;

        this._physicalWidth = window.innerWidth * (window.devicePixelRatio || 1);
        this._physicalHeight = window.innerHeight * (window.devicePixelRatio || 1);

        switch (this._scaleMode) {
            case 'fit':
                this.handleFitMode();
                break;
            case 'stretch':
                this.handleStretchMode();
                break;
            case 'cover':
                this.handleCoverMode();
                break;
            case 'expand':
                this.handleExpandMode();
                break;
            case 'integer': 
                this.handleIntegerMode();
                break;
            default:    
                break;
        }
    }

    private handleFitMode(): void {
        const dpr = getDpr();
        const hiDpiEnabled = this._highDpiEnabled;

        const width  = window.innerWidth  * (hiDpiEnabled ? dpr : 1);
        const height = window.innerHeight * (hiDpiEnabled ? dpr : 1);
    
        const scaleX = width / this._logicalWidth;
        const scaleY = height / this._logicalHeight;
        const factor = Math.min(scaleX, scaleY);

        this._renderWidth  = this._logicalWidth  * factor;
        this._renderHeight = this._logicalHeight * factor;

        this._canvas.style.width = this._renderWidth + 'px';
        this._canvas.style.height = this._renderHeight + 'px';

        this._renderer.resize(this._renderWidth, this._renderHeight);
        
    }

    private handleStretchMode(): void {
        const dpr = getDpr();
        const hiDpiEnabled = this._highDpiEnabled;

        const width  = window.innerWidth  * (hiDpiEnabled ? dpr : 1);
        const height = window.innerHeight * (hiDpiEnabled ? dpr : 1);

        //const scaleX = width / this._logicalWidth;
        //const scaleY = height / this._logicalHeight;

        this._renderWidth = width;
        this._renderHeight = height;

        this._canvas.style.width = this._renderWidth + 'px';
        this._canvas.style.height = this._renderHeight + 'px';

        this._renderer.resize(this._renderWidth, this._renderHeight);
    }

    private handleCoverMode(): void {
        const dpr = getDpr();
        const hiDpiEnabled = this._highDpiEnabled;

        const width  = window.innerWidth  * (hiDpiEnabled ? dpr : 1);
        const height = window.innerHeight * (hiDpiEnabled ? dpr : 1);
    
        const scaleX = width / this._logicalWidth;
        const scaleY = height / this._logicalHeight;
        const factor = Math.max(scaleX, scaleY);

        this._renderWidth  = this._logicalWidth  * factor;
        this._renderHeight = this._logicalHeight * factor;

        this._canvas.style.width = this._renderWidth + 'px';
        this._canvas.style.height = this._renderHeight + 'px';

        this._renderer.resize(this._renderWidth, this._renderHeight);
    }

    private handleExpandMode(): void {
        const dpr = getDpr();
        const hiDpiEnabled = this._highDpiEnabled;

        const width  = window.innerWidth  * (hiDpiEnabled ? dpr : 1);
        const height = window.innerHeight * (hiDpiEnabled ? dpr : 1);

        this._renderWidth = width;
        this._renderHeight = height;

        this._canvas.style.width = this._renderWidth + 'px';
        this._canvas.style.height = this._renderHeight + 'px';

        this._renderer.resize(this._renderWidth, this._renderHeight);
    }

    private handleIntegerMode(): void {
        const dpr = getDpr();
        const hiDpiEnabled = this._highDpiEnabled;

        const width  = window.innerWidth  * (hiDpiEnabled ? dpr : 1);
        const height = window.innerHeight * (hiDpiEnabled ? dpr : 1);
    
        const scaleX = width / this._logicalWidth;
        const scaleY = height / this._logicalHeight;
        const factor = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

        this._renderWidth  = this._logicalWidth  * factor;
        this._renderHeight = this._logicalHeight * factor;

        this._canvas.style.width = this._renderWidth + 'px';
        this._canvas.style.height = this._renderHeight + 'px';

        this._renderer.resize(this._renderWidth, this._renderHeight);
    }

    public static get instance(): ScaleManager {
        if (!ScaleManager._instance) ScaleManager._instance = new ScaleManager();
        return ScaleManager._instance;
    }

    public get logicalSize(): { width: number, height: number} {
        return { width: this._logicalWidth, height: this._logicalHeight }
    }

    public get clientSize(): { width: number, height: number} {
        return { width: this._clientWidth, height: this._clientHeight }
    }

    public get physicalSize(): { width: number, height: number} {
        return { width: this._physicalWidth, height: this._physicalHeight }
    }

    public get renderSize(): { width: number, height: number} {
        return { width: this._renderWidth, height: this._renderHeight }
    }    

    // It is actually same with logical size but it's here to avoid confusion
    public get size(): { width: number, height: number } {
        return { width: this._logicalWidth, height: this._logicalHeight }
    }

    public get scaleMode(): 'stretch' | 'fit' | 'cover' | 'expand' | 'integer' {
        return this._scaleMode;
    }

    public setBaseSize(width: number, height: number): void {
        this._logicalWidth = width;
        this._logicalHeight = height;
        
        this.handleResize();
    }

    public setScaleMode(mode: 'stretch' | 'fit' | 'cover' | 'expand' | 'integer'): void {
        this._scaleMode = mode;
        this.handleResize();
    }

    public setHiDpi(value: boolean): void {
        this._highDpiEnabled = value;
        this.handleResize();
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
