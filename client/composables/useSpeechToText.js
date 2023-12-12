import {WhisperTranscriber} from "../utils/transcribers";


export function useSpeechToText(extraOptions = {}) {
    const runtimeConfig = useRuntimeConfig()

    const transcription = ref('');
    const transcriptInterim = ref('');
    const isTranscribing = ref(false);
    const audioContext = ref(null);
    const mediaStreamSource = ref(null);
    const hasUserStoppedSpeaking = ref(false);
    const whisperTurboSession = ref(null);


    const startTranscribing = async () => {
        transcription.value = '';
        isTranscribing.value = true
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
        mediaStreamSource.value = audioContext.value.createMediaStreamSource(stream)

        if (extraOptions.transcriptMethod === 'whisper') {
            const transcribed = await whisperTurboSession.value.startAudioCapture(stream)
            return transcribed.text
        }
        return ""
    };

    const stopTranscribing = () => {
        isTranscribing.value = false;
        hasUserStoppedSpeaking.value = true;
        if (extraOptions.transcriptMethod === 'whisper') {
            whisperTurboSession.value.stopAudioCapture();
        }
    };

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    const initVAD = async (onTranscribeCompleted) => {
        await loadScript("https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js");
        if (extraOptions.transcriptMethod === 'whisper') {
            whisperTurboSession.value = await (new WhisperTranscriber()).init();
        }

        // Docs: https://www.vad.ricky0123.com/docs/algorithm/
        const myvad = await vad.MicVAD.new({
            onSpeechStart: async () => {
                const transcribed = await startTranscribing()
                onTranscribeCompleted(transcribed)
            },
            onSpeechEnd: async () => {
                stopTranscribing();
                myvad.pause()
                hasUserStoppedSpeaking.value = true;

            },
            redemptionFrames: 40, // the larger the number, the more time it will take to detect speech-end thus ensuring that transcript is complete
            // positiveSpeechThreshold: 0.5, // a number between 0 and 1, the higher the number the more strict the speech detection is ensuring that only clear speech is detected
        });

        myvad.start();
        return myvad
    }

    // To start transcribing on start of app
    // onMounted(initVAD)

    return {
        transcription,
        transcriptInterim,
        speakerAudioContext: audioContext,
        speakerMediaStreamSource: mediaStreamSource,
        isTranscribing,
        hasUserStoppedSpeaking,
        initVAD,
        stopTranscribing
    };
}
