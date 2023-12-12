<template>
  <div class="flex items-center justify-center space-x-5 w-full h-full p-6">
    <div v-if="!isInitializingVAD" class="flex flex-col h-full items-center p-0 w-[560px] border-custom">
      <div ref="waveContainer" class="w-full h-96"></div>
      <div class="p-2">
        <div class="flex flex-row space-x-4 mb-4 justify-center">
          <button v-if="!isVADListening" class="btn btn-outline btn-accent" @click="startCapture">Start</button>
          <button v-else-if="isVADListening" class="btn btn-outline btn-error" @click="stopCapture">Stop</button>
        </div>
        <div class="w-full p-2 mx-2 items-center justify-center flex flex-col">
          <label for="countries" class="w-full py-2 px-8 block mb-2 mt-8 text-base font-medium text-gray-900 dark:text-white"
          >Vision Model</label
          >
          <select
              class="py-3 px-4 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600 w-max"
              @change="onCompletionModelChange"
              v-model="extraOptions.completionModel"
          >
            <option value="openai">GPT-4 Vision</option>
            <option value="llava">LLaVA v1.5 13B</option>
            <option disabled>Bakllava gguf</option>
          </select>
        </div>
        <input v-if="extraOptions.completionModel === 'openai'" type="password" v-model="openaiKey"
               placeholder="OpenAI Key "
               class="input input-bordered input-primary w-full max-w-xs mt-4"/>

      </div>
    </div>
    <div v-else class="w-[560px] flex flex-col h-full items-center p-0 border-custom justify-center">
      <span class="loading loading-dots loading-lg"></span>
      <p class="text-white text-xl">Initializing...</p>
    </div>
    <div
        ref="scrollContainer"
        class="flex flex-col items-center justify-start w-4/6 h-[100%] pt-8 gap-8 overflow-y-hidden border-custom"
    >
      <div class="stats shadow ">
        <div class="stat place-items-center">
          <div class="stat-title">Vision Latency</div>
          <div class="stat-value">{{ timeStats.ttfb_language }}</div>
        </div>

        <div class="stat place-items-center">
          <div class="stat-title">Voice Latency</div>
          <div class="stat-value text-secondary">
            {{ timeStats.ttfb_speech }}
          </div>
        </div>
      </div>
      <div class="mockup-code h-[80%] w-2/3 overflow-y-auto overflow-x-hidden pl-6">
        <pre data-prefix="$"><code> {{ systemResponse }}</code></pre>
        <template v-for="(message, index) in messages" :key="index">
          <pre v-if="message.role === 'user'" data-prefix=">" class="text-[#FEBD01] pt-2"><code
              class="break-words text-wrap">{{ message.content }}</code></pre>
          <pre v-else-if="message.role === 'assistant'" data-prefix=">" class="text-green-400"><code
              class="break-words text-wrap">{{
              message.content
            }}</code></pre>
        </template>
        <pre v-if="isLoadingResponse" data-prefix=">" class="text-[#9B83FA]"><code class="break-words text-wrap">{{
            responseTextUser
          }}</code></pre>
      </div>
    </div>
    <div v-if="showToastNoKey"
         class="toast toast-start mb-4">
      <div class="alert alert-error">
        <span>
          Missing OpenAI Key
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import SiriWave from "siriwave";

const waveContainer = ref(null);
const siriWave = ref(null);
const analyser = ref(null);
const isLoadingResponse = ref(false);
const scrollContainer = ref(null);
const vadInstance = ref(null);
const systemResponse = ref("Inactive");
const extraOptions = reactive({
  completionModel: "llava",
  transcriptMethod: "whisper",
});
const frameLoop = ref(null);
const isInitializingVAD = ref(false);
const isVADListening = ref(false);
let currentEncodedImage = reactive([]);
const openaiKey = ref("");
const showToastNoKey = ref(false);

const {stopTranscribing, isTranscribing, speakerMediaStreamSource, speakerAudioContext, initVAD} =
    useSpeechToText(extraOptions);
const {responseCompletion, agentAudioBufferSource, agentAudioContext, responseTextUser, timeStats} =
    useTextToSpeech();

const messages = ref([]);
let videoTrack = ref(null);

const displayMediaOptions = {
  video: {
    displaySurface: "window",
  },
  audio: false,
};

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}

const animateWave = () => {
  if (!analyser.value) return;

  const dataArray = new Uint8Array(analyser.value.frequencyBinCount);
  analyser.value.getByteFrequencyData(dataArray);

  const frequencyValues = dataArray.reduce((acc, item) => acc + item, 0);
  const averageFrequency = frequencyValues / dataArray.length;

  siriWave.value.setAmplitude(averageFrequency * 0.03);
  requestAnimationFrame(animateWave);
};

const resetSiriWave = () => {
  if (siriWave.value) {
    siriWave.value.stop();
    siriWave.value.dispose();
    siriWave.value = null;
    analyser.value = null;
  }
};

async function startVideoCapture() {
  const VideoElement = document.createElement("video")
  const canvas = document.createElement('canvas');

  const display = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
  const track = display.getVideoTracks()[0]
  videoTrack.value = track;
  VideoElement.autoplay = true;
  VideoElement.srcObject = display;

  VideoElement.addEventListener('loadedmetadata', async () => {
    canvas.width = VideoElement.videoWidth;
    canvas.height = VideoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    const frame = new ImageCapture(track);


    frameLoop.value = setInterval(async function () {
      const imageBitmap = await frame.grabFrame();
      ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/png');

      if (currentEncodedImage.length > 1) {
        currentEncodedImage.shift();
      }
      currentEncodedImage.push(imageDataUrl);
    }, 2000);

  });
  track.addEventListener('ended', () => {
    canvas.remove();
    console.log("STREAM ENDED");
    clearInterval(frameLoop.value)
  });
}

const onCompletionModelChange = (e) => {
  extraOptions.completionModel = e.target.value;
};

const onTranscriptionComplete = async (transcription) => {
  resetSiriWave();
  if (transcription === "") return;
  const transcript = transcription;

  messages.value.push({
    role: "user",
    content: transcript,
  });


  isLoadingResponse.value = true;
  systemResponse.value = "Generating...";

  await responseCompletion(messages.value, extraOptions.completionModel, currentEncodedImage, openaiKey.value);
  vadInstance.value.start();
  isLoadingResponse.value = false;

  messages.value.push({
    role: "assistant",
    content: responseTextUser.value,
  });
  responseTextUser.value = "";
};

const startCapture = async () => {
  if (extraOptions.completionModel === "openai" && openaiKey.value === "") {
    showToastNoKey.value = true;
    return;
  }
  isVADListening.value = true;
  if (vadInstance.value) {
    vadInstance.value.start();
    systemResponse.value = "Started";
    return;
  }

  startVideoCapture();
  isInitializingVAD.value = true;
  systemResponse.value = "Initializing... Wait for a few seconds";
  vadInstance.value = await initVAD(onTranscriptionComplete);
  systemResponse.value = "Started";
  isInitializingVAD.value = false;
};


const stopCapture = () => {
  isVADListening.value = false;
  vadInstance.value.pause()
  stopTranscribing();
  if (frameLoop.value) clearInterval(frameLoop.value);
  systemResponse.value = "Inactive";
  if (videoTrack.value) videoTrack.value.stop();
  siriWave.value.stop();
  siriWave.value.dispose();
};

watchEffect(() => {
  if (
      (agentAudioContext.value && agentAudioBufferSource.value) ||
      (speakerAudioContext.value && speakerMediaStreamSource.value)
  ) {
    resetSiriWave();

    const audioContext = !isTranscribing.value ? agentAudioContext.value : speakerAudioContext.value;
    const audioSource = !isTranscribing.value ? agentAudioBufferSource.value : speakerMediaStreamSource.value;

    siriWave.value = new SiriWave({
      container: waveContainer.value,
      height: 400,
      style: "ios",
      color: !isTranscribing.value ? "#9B83FA" : "#FEBD01",
      autostart: true,
      speed: 0.02,
      frequency: 2,
      amplitude: 0,
    });

    if (audioContext) {
      analyser.value = audioContext.createAnalyser();
    }
    if (audioSource) {
      audioSource.connect(analyser.value);
    }

    if (!siriWave.value.running) {
      siriWave.value.start();
    }

    animateWave();
  }
});

onMounted(() => {
  const observer = new MutationObserver(scrollToBottom);
  observer.observe(scrollContainer.value, {childList: true});

  // try setting up a web worker
  if (window.Worker) {
    console.log("Workers are supported");

    const worker = navigator.serviceWorker.register('worker.js', {scope: '/'}).then((worker) => {
      console.log("Service worker registered", worker);
    }).catch((err) => {
      console.error("Service worker registration failed", err);
    });
    // const myWorker = new Worker("worker.js", { name: "cache-wasm" });
  } else {
    console.log("Workers are not supported");
  }
});

watchEffect(() => {
  if (extraOptions.completionModel === "openai" && openaiKey.value !== "") {
    showToastNoKey.value = false;
  }
});
</script>

<style>
.border-custom {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(93, 109, 131, 0.1);
  backdrop-filter: blur(5px);
}

.text-wrap {
  text-wrap: wrap;
}
</style>
