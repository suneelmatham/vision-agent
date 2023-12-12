export interface Recording {
    blob: Blob;
    buffer: ArrayBuffer;
}
export declare class MicRecorder {
    private currentStart;
    private currentStream;
    private inner;
    private audioChunks;
    private static readonly supportedMimes;
    private constructor();
    static start(): Promise<MicRecorder>;
    isRecording(): boolean;
    stop(): Promise<Recording>;
}
export default MicRecorder;
