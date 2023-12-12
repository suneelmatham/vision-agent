import * as whisper from "whisper-webgpu";
import { Result } from "true-myth";
import { AvailableModels } from "./models";
export declare class Session {
    whisperSession: whisper.Session | undefined;
    initSession(selectedModel: AvailableModels, onProgress: (progress: number) => void): Promise<Result<void, Error>>;
    private loadModel;
    run(audio: Uint8Array): Promise<Result<whisper.Transcript, Error>>;
    stream(audio: Uint8Array, raw_audio: boolean, callback: (decoded: whisper.Segment) => void): Promise<Result<void, Error>>;
}
