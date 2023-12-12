from typing import Literal, Union
from pydantic import BaseModel, Field

EXAMPLE_IMAGE_BASE64 = "<image>"



class ChatGPTConversationItem(BaseModel):
    role: Literal['user', 'assistant', 'system']
    content: str

class ChatGPTConversationsModel(BaseModel):
    data: list[ChatGPTConversationItem]
    images: list[str]
    openAiToken: str

    def __repr__(self) -> str:
        img = []
        for i in self.images:
            img.append(i[0:16])
        return f"""ChatGPTConversationsModel(data={self.data},images=[{",".join(img)}])"""

    class Config:
        schema_extra = {
            "example": {
                "data": [
                    {
                        "role": "user",
                        "content": "Hello How are you doing"
                    },
                    {
                        "role": "assistant",
                        "content": "I am doing fine anything i can help you with"
                    },
                ],
                "images": [EXAMPLE_IMAGE_BASE64]
            }
        }
