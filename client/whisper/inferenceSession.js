var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Session } from "./session.worker";
import * as Comlink from "comlink";
import { Result } from "true-myth";
//User facing API
export class InferenceSession {
    constructor(session, worker) {
        this.session = session;
        this.innerWorker = worker || null;
    }
    initSession(selectedModel, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.session.initSession(selectedModel, onProgress);
        });
    }
    transcribe(audio, raw_audio, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session == null) {
                return Result.err(new Error("Session not initialized"));
            }
            if (callback) {
                if (this.session instanceof Session) {
                    return yield this.session.stream(audio, raw_audio, callback);
                }
                else {
                    return yield this.session.stream(audio, raw_audio, Comlink.proxy(callback));
                }
            }
            else {
                return yield this.session.run(audio);
            }
        });
    }
    destroy() {
        if (this.innerWorker !== null) {
            console.warn("Terminating worker");
            this.innerWorker.terminate();
        }
        this.session = null;
    }
}
//# sourceMappingURL=inferenceSession.js.map