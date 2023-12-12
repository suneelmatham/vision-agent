var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as whisper from "whisper-webgpu";
import * as Comlink from "comlink";
import { Result } from "true-myth";
import { Model } from "./models";
import ModelDB from "./db/modelDB";
export class Session {
    initSession(selectedModel, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.whisperSession) {
                return Result.err(new Error("Session already initialized. Call `destroy()` first."));
            }
            const modelResult = yield this.loadModel(selectedModel, onProgress);
            if (modelResult.isErr) {
                return Result.err(modelResult.error);
            }
            const model = modelResult.value;
            yield whisper.default();
            const builder = new whisper.SessionBuilder();
            const session = yield builder
                .setModel(model.data)
                .setTokenizer(model.tokenizer)
                .build();
            this.whisperSession = session;
            return Result.ok(undefined);
        });
    }
    loadModel(selectedModel, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield ModelDB.create(); //TODO: don't create a new db every time
            const dbResult = yield db.getModel(selectedModel, onProgress);
            if (dbResult.isErr) {
                return Result.err(new Error(`Failed to load model ${selectedModel} with error: ${dbResult.error}`));
            }
            const dbModel = dbResult.value;
            const modelResult = yield Model.fromDBModel(dbModel, db);
            if (modelResult.isErr) {
                return Result.err(new Error(`Failed to transmute model ${selectedModel} with error: ${modelResult.error}`));
            }
            const model = modelResult.value;
            return Result.ok(model);
        });
    }
    run(audio) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.whisperSession) {
                return Result.err(new Error("The session is not initialized. Call `initSession()` method first."));
            }
            return Result.ok(yield this.whisperSession.run(audio));
        });
    }
    stream(audio, raw_audio, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.whisperSession) {
                return Result.err(new Error("The session is not initialized. Call `initSession()` method first."));
            }
            return Result.ok(yield this.whisperSession.stream(audio, raw_audio, callback));
        });
    }
}
if (typeof self !== "undefined") {
    Comlink.expose(Session);
}
//# sourceMappingURL=session.worker.js.map