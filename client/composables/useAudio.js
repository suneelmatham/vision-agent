export function useAudio() {
    const isPlayingAudio = ref(false);

    const audioContext = ref(null)
    const audioBufferSource = ref(null);

    const convertToAudioBuffer = async (audioChunks) => {

        if (!audioContext.value) {
            audioContext.value = new AudioContext();
        }
        const audioBlob = new Blob(audioChunks, {type: 'audio/mpeg-3'});
        const arrayBuffer = await audioBlob.arrayBuffer();
        return new Promise((resolve, reject) => {
            audioContext.value.decodeAudioData(arrayBuffer, resolve, reject);
        });
    };

    const playAudioBuffer = async(audioBuffer) => {
        return new Promise((resolve) => {
            audioBufferSource.value = audioContext.value.createBufferSource();
            audioBufferSource.value.buffer = audioBuffer;
            audioBufferSource.value.connect(audioContext.value.destination);
            audioBufferSource.value.start(0);
            isPlayingAudio.value = true;

            audioBufferSource.value.onended = () => {
                isPlayingAudio.value = false;
                resolve();
            };
        });
        
    };

    const stopPlayingAudioBuffer = () => {
        if (audioBufferSource.value) {
            audioBufferSource.value.stop();
            audioBufferSource.value.disconnect();
            audioBufferSource.value = null;
        }
        if (audioContext.value) {
            audioContext.value.close()
            audioContext.value = null
        }
        isPlayingAudio.value = false;
    };

    return {
        convertToAudioBuffer,
        playAudioBuffer,
        stopPlayingAudioBuffer,
        isPlayingAudio,
        audioBufferSource,
        audioContext
    };
}
