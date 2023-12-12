from app.api_models import ChatGPTConversationItem, ChatGPTConversationsModel
import uuid
from app.utils import TimeStats
from openai import OpenAI
import base64
import json
from app.prompts import system_prompt as SYSTEM_PROMPT
# def encode_image(image_path):
#     with open(image_path, "rb") as image_file:
#         return base64.b64encode(image_file.read()).decode('utf-8')

text_buffers = { }
def stream_openai_text_response(query: ChatGPTConversationsModel):
    global text_buffers
    request_id = uuid.uuid1()
    text_buffers[request_id] = ""
    client = OpenAI(api_key=query.openAiToken)

    messages = []
    messages.append({"role": "system", "content": SYSTEM_PROMPT})

    for message in query.data[0:-1]:
        messages.append({
            "role": message.role,
            "content": message.content
        })

    endMessage = []
    for base64_image in query.images:
        endMessage.append({
            "type": "image_url",
            "image_url": {
                "url": f"{base64_image}"
            }
        })

    endMessage.append({"type": "text", "text": query.data[-1].content})
    messages.append({"role": "user", "content": endMessage})
    json.dump(messages, open("json.json", "w+"))
    stream_end = False
    # print(messages, endMessage)
    time_metrics = TimeStats()
    response = client.chat.completions.create(
        model="gpt-4-vision-preview",
        # model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=60,
        stream=True
    )
    splitters = (".", ",", "?", "!", ";", ":", "—", "-", "(", ")", "[", "]", "}", " ")
    for chunk in response:
        time_metrics.end_language()

        if chunk.choices[0].finish_reason or (hasattr(chunk.choices[0], 'finish_details') and chunk.choices[0].finish_details):
            stream_end = True
        if ((text_chunk := chunk.choices[0].delta.content) is not None and chunk.choices[0].delta.content != '') or stream_end:
            if text_chunk is not None:
                text_buffers[request_id] += text_chunk
            if text_buffers[request_id].endswith(splitters) or stream_end:
                if len(text_buffers[request_id]) > 0:
                    audio_stream = client.audio.speech.create(
                            model="tts-1",
                            voice="alloy",
                            input=text_buffers[request_id]
                        )
                    response_dict = {"text": text_buffers[request_id], 'ttfb_language': time_metrics.get_language_ttfb()}
                    text_buffers[request_id] = ''
                    for byte in audio_stream.iter_bytes(None):
                        time_metrics.end_speech()
                        response_dict['ttfb_speech'] = time_metrics.get_speech_ttfb()
                        response_dict["audio"] = base64.b64encode(byte).decode('utf-8')
                        yield json.dumps([response_dict]) + "\x00"

    text_buffers.pop(request_id)
