import toWav from "audiobuffer-to-wav"
import { AvailableModels, SessionManager } from "../whisper/"

class WhisperTranscriber {
    constructor() {
        this.session = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async transcribe (blob) {
        return new Promise(async (resolve, reject) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            audioContext.decodeAudioData(await blob.arrayBuffer(), (buffer) => {
                var wav = toWav(buffer)
                const uint8Array = new Uint8Array(wav);
                var segmentFinal = {text: ""}
                this.session.transcribe(uint8Array, false, (segment) => {
                    if (!segment.last){
                        segmentFinal.text += segment.text
                    }else{
                        resolve(segmentFinal);
                    }
                    
                });
            });
        })
    }
    async stopAudioCapture () {
        this.mediaRecorder.stop();
    }

    async startAudioCapture (stream) {
        return new Promise((resolve, reject) => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (e) => {
                this.audioChunks.push(e.data);
            };
            mediaRecorder.onstop = async (e) => {
                const blob = new Blob(this.audioChunks, { 'type': 'audio/ogg; codecs=opus' });
                this.audioChunks = [];
                const segment = await this.transcribe(blob)
                resolve(segment);
            }

            mediaRecorder.start();
            this.mediaRecorder = mediaRecorder;
        });
    }

    async init () {
        // Speech to text is dependent on the model and GPU you are using
        const session = await new SessionManager().loadModel(
            // AvailableModels.WHISPER_MEDIUM, // 4135.518798828125 ms
            // AvailableModels.WHISPER_SMALL, // 1366.882080078125 ms
            AvailableModels.WHISPER_BASE,
            // AvailableModels.WHISPER_TINY, // 603.872802734375 ms
            () => {
                console.log("Model loaded successfully");
            },
            (p) => {
                console.log(`Loading: ${p}%`);
            }
        );

        if (session.isErr) {
            console.error("Failed to load!");
        } else {
            console.log(session.value);
            this.session = session.value;
        }
        return this
    }
}



export {
    WhisperTranscriber,
}