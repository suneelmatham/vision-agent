echo "Starting background tasks"

screen -dmS controller /model/BakLLaVA/venv/bin/python -m llava.serve.controller --host 0.0.0.0 --port 10000
screen -dmS model_worker /model/BakLLaVA/venv/bin/python -m llava.serve.model_worker --host 0.0.0.0 --controller http://localhost:10000 --port 40000 --worker http://localhost:40000 --model-path liuhaotian/llava-v1.5-13b --load-4bit