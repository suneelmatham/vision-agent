import { DBModel, DBTokenizer } from "./types";
import { AvailableModels } from "../models";
import { Result } from "true-myth";
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
    private readonly remoteUrl;
    private db;
    private constructor();
    static create(): Promise<ModelDB>;
    private fetchBytes;
    _getModel(modelID: string): Promise<Result<DBModel, Error>>;
    getTokenizer(modelID: string): Promise<Result<DBTokenizer, Error>>;
    getModel(model: AvailableModels, onProgress: (progress: number) => void): Promise<Result<DBModel, Error>>;
    fetchRemote(model: AvailableModels, onProgress: (progress: number) => void): Promise<Result<void, Error>>;
}
