# Vision Agent

An interface to share screen and interact with Vision Language Models such as GPT 4 Vision and open models like Llava.

Aim's to develop AI agents that can guide you through various tasks by sharing your screen. Focus would be on creating open agents that specialize and assist with coding and using complex tools.

## Features
- Works with GPT 4 Vision and open models - Llava and Bakllava
- Uses Whisper for speech to text on the browser
- Voice Activity Detector (VAD) to detect end of query and trigger the model

## Demo

## Setup

Project consists of two main components: the backend and the frontend client.

## Backend

There are two Dockerfiles in the backend folder. You only need to choose one based on your system's capabilities.

### LLava Container Setup (Requires GPU)

1. Navigate to the backend directory: `cd backend/`
2. Create a .env file from the given .env.example
3. Build the image: 
```
docker build -f Dockerfile -t <image_name> .
```
4. Run the container: 
```
docker run -p 8000:8000 -v $(pwd)/models:/root/.cache/ --gpus all <image_name>
```
Use the same docker volume everytime so that the model worker  uses the cached model and won't download again

**Note:** This will start the Model worker and Model controller services in the background. The model worker will start a model download process in the background. You will not be able to make requests until the download is completed.

#### Checking the Status of Model worker/controller

Background tasks are managed using `screen`.

- Use `screen -ls` to check for running background tasks.
- Use `screen -r model_worker` or `screen -r controller` to connect to the respective background tasks.
- Use `CTRL + A + D` to exit from screen.

### Bakllava gguf Setup (Works on Mac M-series chips)

1. Navigate to the backend directory: `cd backend/`
2. Create a .env file from the given .env.example
3. Download the following files from Hugging Face - [mys/ggml_bakllava-1](https://huggingface.co/mys/ggml_bakllava-1/tree/main):
    - ggml-model-q4_k.gguf (or any other quantized model) - only one is required
    - mmproj-model-f16.gguf
4. Place the downloaded files into a folder and note the path.
5. Build the image: 
```
docker build -f Dockerfile.gguf -t <image_name> .
```
6. Run the container: 
```
docker run -p 8000:8000 -v <path_to_models>:/model/download/ <image_name>
```

**Note:** This will start the Model worker service in the background.

#### Checking the Status of Model worker

Background tasks are managed using `screen`.

- Use `screen -ls` to check for running background tasks.
- Use `screen -r model_worker` to connect to the background tasks.
- Use `CTRL + A + D` to exit from screen.

### Frontend Client Setup

The client is built using NuxtJS in Vue. Follow these steps to set it up:

- Navigate to the client directory:
    ```bash
    cd client
    npm install
    ```
- Create a .env file from the given .env.example. Paste the backend address
- Run
  ```
    npm run dev
  ```
- Open the URL in your browser.


### Troubleshooting
```python
Traceback (most recent call last):
  File "/usr/lib/python3.10/runpy.py", line 187, in _run_module_as_main
    mod_name, mod_spec, code = _get_module_details(mod_name, _Error)
  File "/usr/lib/python3.10/runpy.py", line 110, in _get_module_details
    __import__(pkg_name)
  File "/model/BakLLaVA/llava/__init__.py", line 1, in <module>
    from .model import LlavaLlamaForCausalLM
  File "/model/BakLLaVA/llava/model/__init__.py", line 2, in <module>
    from .language_model.llava_mistral import LlavaMistralForCausalLM, LlavaConfig
  File "/model/BakLLaVA/llava/model/language_model/llava_mistral.py", line 22, in <module>
    from transformers import AutoConfig, AutoModelForCausalLM, \
ImportError: cannot import name 'MistralConfig' from 'transformers' (/model/BakLLaVA/venv/lib/python3.10/site-packages/transformers/__init__.py)
```
If you get this error just install this version of transformers by `pip3 install transformers==4.34.0`