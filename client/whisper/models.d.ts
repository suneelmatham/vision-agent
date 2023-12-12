import { Result } from "true-myth";
import ModelDB from "./db/modelDB";
import { DBModel } from "./db/types";
export declare enum AvailableModels {
    WHISPER_TINY = "tiny",
    WHISPER_BASE = "base",
    WHISPER_SMALL = "small",
    WHISPER_MEDIUM = "medium",
    WHISPER_LARGE = "large"
}
export declare const ModelSizes: Map<AvailableModels, number>;
export declare class Model {
    name: string;
    data: Uint8Array;
    tokenizer: Uint8Array;
    constructor(name: string, data: Uint8Array, tokenizer: Uint8Array);
    static fromDBModel(dbModel: DBModel, db: ModelDB): Promise<Result<Model, Error>>;
}
export interface EncoderDecoder {
    name: string;
    encoder: Model;
    decoder: Model;
    config: Uint8Array;
    tokenizer: Uint8Array;
}
