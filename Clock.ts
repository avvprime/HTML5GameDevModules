export default class Clock {

    private simulationStep: number = 1000 / 60;
    private accumulator: number = 0;
    private lastTime: number = 0;

    private updatePool: Record<string, (delta: number) => void> = {};
    private fixedUpdatePool: Record<string, (delta: number) => void> = {};
    private renderPool: Record<string, (alpha: number) => void> = {};

    private boundLoopCallback = this.loopCallback.bind(this);

    private frameId: number = 0;
    private running: boolean = false;

    private updateCallCount: number = 0;
    private updateFPS: number = 0;

    private fixedUpdateCallCount: number = 0;
    private fixedUpdateFPS: number = 0;

    private fpsTimer: number = 0;

    private static _instance: Clock;

    private constructor() {}

    public static get instance(): Clock {
        if (!Clock._instance) {
            Clock._instance = new Clock();
        }

        return Clock._instance;
    }

    public start(): void {
        if (this.running) return;

        this.accumulator = 0;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(this.boundLoopCallback);
        this.running = true;
    }

    public stop(): void {
        cancelAnimationFrame(this.frameId);
        this.running = false;
        this.frameId = 0;
    }

    public setSimulationStep(steps: number): void {
        if (steps <= 0) throw new Error('Steps must be positive');
        this.simulationStep = 1000 / steps;
    }

    public get updateFps(): number {
        return this.updateFPS;
    } 

    public get fixedUpdateFps(): number {
        return this.fixedUpdateFPS;
    }

    private loopCallback(elapsedTimeInMillis: number): void {
        if (!this.running) return;

        this.frameId = requestAnimationFrame(this.boundLoopCallback);

        const delta: number = Math.min(elapsedTimeInMillis - this.lastTime, 1000); // Max 1 sec
        this.accumulator += delta;
        this.fpsTimer += delta;

        this.update(delta);

        while(this.accumulator >= this.simulationStep) {
            this.fixedUpdate(this.simulationStep);
            this.accumulator -= this.simulationStep;
        }

        const alpha: number = this.accumulator / this.simulationStep;
        this.render(alpha);

        this.lastTime = elapsedTimeInMillis;

        if (this.fpsTimer >= 1000) {
            this.updateFPS = this.updateCallCount;
            this.fixedUpdateFPS = this.fixedUpdateCallCount;

            this.fpsTimer -= 1000;
            this.updateCallCount = 0;
            this.fixedUpdateCallCount = 0;
        }
    }

    private update(delta: number): void {
        this.updateCallCount++;
        for (const cb of Object.values(this.updatePool)) {
            cb(delta);
        }
    }

    private fixedUpdate(delta: number): void {
        this.fixedUpdateCallCount++;
        for (const cb of Object.values(this.fixedUpdatePool)) {
            cb(delta);
        }
    }

    private render(alpha: number): void {
        for (const cb of Object.values(this.renderPool)) {
            cb(alpha);
        }
    }

    public registerUpdateCallback(callback: (delta: number) => void): string {
        const id: string = crypto.randomUUID();

        this.updatePool[id] = callback;

        return id;
    }

    public unregisterUpdateCallback(id: string): void {
        delete this.updatePool[id];
    }

    public registerFixedUpdateCallback(callback: (delta: number) => void): string {
        const id: string = crypto.randomUUID();

        this.fixedUpdatePool[id] = callback;

        return id;
    }

    public unregisterFixedUpdateCallback(id: string): void {
        delete this.fixedUpdatePool[id];
    }

    public registerRenderCallback(callback: (alpha: number) => void): string {
        const id: string = crypto.randomUUID();

        this.renderPool[id] = callback;

        return id;
    }

    public unregisterRenderCallback(id: string): void {
        delete this.renderPool[id];
    }
}