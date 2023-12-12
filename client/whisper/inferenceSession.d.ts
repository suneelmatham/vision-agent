import { Session } from "./session.worker";
import * as Comlink from "comlink";
import { Result } from "true-myth";
import { AvailableModels } from "./models";
import { Segment, Transcript } from "whisper-webgpu";
export declare class InferenceSession {
    private session;
    private innerWorker;
    constructor(session: Comlink.Remote<Session> | Session, worker?: Worker);
    initSession(selectedModel: AvailableModels, onProgress: (progress: number) => void): Promise<Result<void, Error>>;
    transcribe(audio: Uint8Array, raw_audio: boolean): Promise<Result<Transcript, Error>>;
    transcribe(audio: Uint8Array, raw_audio: boolean, callback: (decoded: Segment) => void): Promise<Result<void, Error>>;
    destroy(): void;
}
