var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Result } from "true-myth";
export var AvailableModels;
(function (AvailableModels) {
    AvailableModels["WHISPER_TINY"] = "tiny";
    AvailableModels["WHISPER_BASE"] = "base";
    AvailableModels["WHISPER_SMALL"] = "small";
    AvailableModels["WHISPER_MEDIUM"] = "medium";
    AvailableModels["WHISPER_LARGE"] = "large";
})(AvailableModels || (AvailableModels = {}));
export const ModelSizes = new Map([
    [AvailableModels.WHISPER_TINY, 51444634],
    [AvailableModels.WHISPER_BASE, 96834130],
    [AvailableModels.WHISPER_SMALL, 313018088],
    [AvailableModels.WHISPER_MEDIUM, 972263884],
    [AvailableModels.WHISPER_LARGE, 1954315876],
]);
export class Model {
    constructor(name, data, tokenizer) {
        this.name = name;
        this.data = data;
        this.tokenizer = tokenizer;
    }
    static fromDBModel(dbModel, db) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenizerResult = yield db.getTokenizer(dbModel.ID);
            if (tokenizerResult.isErr) {
                return Result.err(tokenizerResult.error);
            }
            const tokenizerBytes = tokenizerResult.value.bytes;
            return Result.ok(new Model(dbModel.name, dbModel.bytes, tokenizerBytes));
        });
    }
}
//# sourceMappingURL=models.js.map