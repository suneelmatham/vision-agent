# This file is just a wrapper for app making easy to run/attach debugger
# run via uvicorn as default
from app.main import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)