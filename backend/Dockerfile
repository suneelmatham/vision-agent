# FROM python:3.10
FROM ubuntu

RUN apt autoremove && apt autoclean

RUN apt-get update && \
    apt-get upgrade -y


RUN apt install git python3 python3-venv python3-pip screen -y

# To run the bakllava model
RUN git clone https://github.com/SkunkworksAI/BakLLaVA.git /model/BakLLaVA

WORKDIR /model/BakLLaVA
RUN python3 -m venv venv
RUN ./venv/bin/pip install -e .
RUN ./venv/bin/pip install transformers==4.34.0


WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
COPY ./.env /.env
RUN python3 -m venv venv
RUN ./venv/bin/pip install --no-cache-dir -r requirements.txt

COPY ./app app
RUN mkdir frames
COPY ./scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

# FastAPI port
EXPOSE 8000
# Model worker port
EXPOSE 40000
# Model controller port
EXPOSE 10000

CMD ["/bin/bash", "-c", "./scripts/start.sh && source ./venv/bin/activate && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000"]
