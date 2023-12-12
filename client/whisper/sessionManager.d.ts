import { InferenceSession } from "./inferenceSession";
import { AvailableModels } from "./models";
import { Result } from "true-myth";
export declare class SessionManager {
    /**
     * Loads a model and returns a Session instance.
     * @param selectedModel - The model to load.
     * @param onLoaded - A callback that is called when the model is loaded.
     * @returns A Promise that resolves with a Session instance.
     *
     */
    loadModel(selectedModel: AvailableModels, onLoaded: (result: any) => void, onProgress: (progress: number) => void): Promise<Result<InferenceSession, Error>>;
    /**
     * Creates a new session with the specified models.
     *
     * @param spawnWorker - Determines whether a Web Worker should be used for the session.
     * @param selectedModel - The model to use for the session.
     * @returns A Promise that resolves with a Session instance, or a Remote<Session> instance if a Web Worker was used.
     *
     */
    private createSession;
}
