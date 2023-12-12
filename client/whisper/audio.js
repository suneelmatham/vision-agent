var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fixWebmDuration from "fix-webm-duration";
export class MicRecorder {
    constructor(recorder) {
        this.currentStart = null;
        this.currentStream = null;
        this.inner = null;
        this.audioChunks = [];
        this.inner = recorder;
    }
    static start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!navigator.mediaDevices) {
                throw new Error("Media device not available");
            }
            const stream = yield navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const inner = new MediaRecorder(stream, {
                mimeType: MicRecorder.supportedMimes.find((mime) => MediaRecorder.isTypeSupported(mime)),
            });
            const recorder = new MicRecorder(inner);
            recorder.currentStream = stream;
            inner.addEventListener("dataavailable", (event) => {
                recorder.audioChunks.push(event.data);
            });
            inner.start();
            recorder.currentStart = Date.now();
            return recorder;
        });
    }
    isRecording() {
        return this.inner !== null && this.inner.state === "recording";
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.inner) {
                throw new Error("Please start the recorder first");
            }
            const promise = new Promise((resolve) => {
                this.inner.addEventListener("stop", () => __awaiter(this, void 0, void 0, function* () {
                    const duration = Date.now() - this.currentStart;
                    let blob = new Blob(this.audioChunks, {
                        type: this.inner.mimeType,
                    });
                    if (this.inner.mimeType.includes("webm")) {
                        blob = yield fixWebmDuration(blob, duration, {
                            logger: false,
                        });
                    }
                    const buffer = yield blob.arrayBuffer();
                    resolve({
                        blob,
                        buffer,
                    });
                }));
                this.inner.stop();
                this.currentStream.getTracks().forEach((track) => track.stop());
            });
            return promise;
        });
    }
}
MicRecorder.supportedMimes = [
    "audio/webm",
    "audio/ogg", // Firefox
];
export default MicRecorder;
//# sourceMappingURL=audio.js.map