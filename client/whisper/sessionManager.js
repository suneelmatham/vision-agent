var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { InferenceSession } from "./inferenceSession";
import * as Comlink from "comlink";
import { Session } from "./session.worker";
import { Result } from "true-myth";
export class SessionManager {
    /**
     * Loads a model and returns a Session instance.
     * @param selectedModel - The model to load.
     * @param onLoaded - A callback that is called when the model is loaded.
     * @returns A Promise that resolves with a Session instance.
     *
     */
    loadModel(selectedModel, onLoaded, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const creationResult = yield this.createSession(true, selectedModel, onProgress);
            if (creationResult.isErr) {
                return Result.err(creationResult.error);
            }
            onLoaded(creationResult.value);
            return Result.ok(creationResult.value);
        });
    }
    /**
     * Creates a new session with the specified models.
     *
     * @param spawnWorker - Determines whether a Web Worker should be used for the session.
     * @param selectedModel - The model to use for the session.
     * @returns A Promise that resolves with a Session instance, or a Remote<Session> instance if a Web Worker was used.
     *
     */
    createSession(spawnWorker, selectedModel, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (spawnWorker && typeof document !== "undefined") {
                const worker = new Worker(new URL("./session.worker.js", import.meta.url), {
                    type: "module",
                });
                const SessionWorker = Comlink.wrap(worker);
                const session = yield new SessionWorker();
                const initResult = yield session.initSession(selectedModel, Comlink.proxy(onProgress));
                //@ts-ignore
                const [state, data] = initResult.repr;
                if (state === "Err") {
                    return Result.err(new Error("Session initialization failed: " + data.toString()));
                }
                return Result.ok(new InferenceSession(session, worker));
            }
            else {
                const session = new Session();
                const initResult = yield session.initSession(selectedModel, onProgress);
                if (initResult.isErr) {
                    console.error("Error initializing session: ", initResult);
                    return Result.err(initResult.error);
                }
                return Result.ok(new InferenceSession(session));
            }
        });
    }
}
//# sourceMappingURL=sessionManager.js.map