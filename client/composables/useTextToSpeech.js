export function useTextToSpeech() {
  const runtimeConfig = useRuntimeConfig();
  const {
    convertToAudioBuffer,
    playAudioBuffer,
    stopPlayingAudioBuffer,
    isPlayingAudio,
    audioBufferSource,
    audioContext,
  } = useAudio();
  const isStreamingResponse = ref(false);

  const responseTextUser = ref("");
  const timeStats = ref({ ttfb_language: 0, ttfb_speech: 0 });

  const startStreaming = async (response) => {
    try {
      const audioBuffer = await convertToAudioBuffer(response);
      //once playAudioBuffer resolves the promise, only then next audio stream chunk
      // would be allowed to play, this ensures the streams play in sequence and next chunk
      // plays only after current chunk is finished
      await playAudioBuffer(audioBuffer);
      isStreamingResponse.value = true;
    } catch (error) {
      console.error("Error streaming audio:", error);
      isStreamingResponse.value = false;
    }
  };

  const responseCompletion = async (messages, modelType, images, token) => {
    try {
      stopPlayingAudioBuffer();
      const responseUrl = `${runtimeConfig.public.BACKEND_IP}response/${modelType}`;
      const response = await fetch(responseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: messages,
          images: images,
          openAiToken: token,
        }),
      });
      const reader = response.body.getReader();
      let chunks = [];
      let result = "";

      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        for (let i = 0; i < value.length; i++) {
          let currentChar = decoder.decode(new Uint8Array([value[i]]), {
            stream: true,
          });
          result += currentChar;
          if (currentChar === "\x00") {

            const data = JSON.parse(result.replace("\x00", ""));

            timeStats.value = {
              ttfb_language: parseFloat(data[0].ttfb_language).toFixed(2),
              ttfb_speech: parseFloat(data[0].ttfb_speech).toFixed(2),
            };

            result = "";

            if (!data[0].audio) break;
            var binaryString = window.atob(data[0].audio);
            var byteArray = new Uint8Array(binaryString.length);
            for (var index = 0; index < binaryString.length; index++) {
              byteArray[index] = binaryString.charCodeAt(index);
            }
            const streamedText = [];
            streamedText.push(byteArray);
            if (modelType == "llava") responseTextUser.value = data[0].text;
            else responseTextUser.value += data[0].text;
            await startStreaming(streamedText);
          }
        }
        chunks.push(value);
      }
      return "";
    } catch (error) {
      console.error("Error while receiving audio streams:", error);
    }
  };

  // useful for polling from backend for auxiliary files
  watchEffect(() => {
    isStreamingResponse.value = isPlayingAudio.value;
  });

  return {
    responseCompletion,
    agentAudioBufferSource: audioBufferSource,
    agentAudioContext: audioContext,
    responseTextUser,
    timeStats: timeStats,
  };
}
