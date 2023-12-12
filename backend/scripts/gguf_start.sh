echo "Starting background tasks"

screen -dmS model_worker ./server -m /model/download/ggml-model-q4_k.gguf --mmproj /model/download/mmproj-model-f16.gguf -ngl 1 --host 0.0.0.0 --port 8080