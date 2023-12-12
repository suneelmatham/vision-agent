var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { openDB } from "idb/with-async-ittr";
import { v4 as uuidv4 } from "uuid";
import { Result } from "true-myth";
import pRetry from "p-retry";
/**
 * A class that represents a database of models and related data.
 *
 * @remarks
 * The `ModelDB` class uses the IndexedDB API to store and retrieve data. The database schema is defined by the `ModelDBSchema` interface.
 *
 * To use the `ModelDB` class, first create an instance by calling the constructor. Then call the `init` method to open the database.
 *
 * Example usage:
 *
 * ```typescript
 * ```
 */
export default class ModelDB {
    constructor(db) {
        this.remoteUrl = "https://rmbl.us";
        this.db = db;
    }
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield openDB("models", 1, {
                upgrade(db) {
                    const modelStore = db.createObjectStore("models");
                    modelStore.createIndex("modelID", "modelID");
                    db.createObjectStore("availableModels");
                    const tokenizerStore = db.createObjectStore("tokenizer");
                    tokenizerStore.createIndex("modelID", "modelID");
                },
            });
            return new ModelDB(db);
        });
    }
    fetchBytes(url, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const run = () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(url);
                if (!response.ok) {
                    return Result.err(new Error(`Fetch failed: ${response.status}`));
                }
                const contentLength = +response.headers.get("Content-Length");
                const reader = response.body.getReader();
                let receivedLength = 0;
                const chunks = new Uint8Array(contentLength);
                for (;;) {
                    const { done, value } = yield reader.read();
                    if (done) {
                        break;
                    }
                    chunks.set(value, receivedLength);
                    receivedLength += value.length;
                    if (onProgress) {
                        onProgress((receivedLength / contentLength) * 100);
                    }
                }
                return Result.ok(chunks);
            });
            return yield pRetry(run, { retries: 3 });
        });
    }
    _getModel(modelID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                return Result.err(new Error("ModelDB not initialized"));
            }
            const tx = this.db.transaction("models", "readonly");
            const store = tx.objectStore("models");
            const model = yield store.get(modelID);
            if (!model) {
                return Result.err(new Error("Model not found"));
            }
            return Result.ok(model);
        });
    }
    getTokenizer(modelID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                return Result.err(new Error("ModelDB not initialized"));
            }
            let tokenizer = yield this.db.getFromIndex("tokenizer", "modelID", modelID);
            if (!tokenizer) {
                const tokenizerBytes = yield this.fetchBytes("https://huggingface.co/openai/whisper-large-v2/raw/main/tokenizer.json");
                if (tokenizerBytes.isErr) {
                    return Result.err(tokenizerBytes.error);
                }
                const tokenizerBytesValue = tokenizerBytes.value;
                tokenizer = {
                    modelID,
                    bytes: tokenizerBytesValue,
                };
                this.db.put("tokenizer", tokenizer, modelID);
                tokenizer = yield this.db.getFromIndex("tokenizer", "modelID", modelID);
            }
            return Result.ok(tokenizer);
        });
    }
    getModel(model, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db) {
                return Result.err(new Error("ModelDB not initialized"));
            }
            let modelID = yield this.db.get("availableModels", model);
            if (!modelID) {
                yield this.fetchRemote(model, onProgress);
                modelID = yield this.db.get("availableModels", model);
            }
            return yield this._getModel(modelID);
        });
    }
    fetchRemote(model, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteURL = `${this.remoteUrl}/whisper-turbo/${model}-q8g16.bin`;
            const fetchResult = yield this.fetchBytes(remoteURL, onProgress);
            if (fetchResult.isErr) {
                return Result.err(fetchResult.error);
            }
            const data = fetchResult.value;
            const modelID = uuidv4();
            this.db.put("availableModels", modelID, model);
            const dbModel = { name: model, ID: modelID, bytes: data };
            this.db.put("models", dbModel, modelID);
            this.getTokenizer(modelID);
            return Result.ok(undefined);
        });
    }
}
//# sourceMappingURL=modelDB.js.map