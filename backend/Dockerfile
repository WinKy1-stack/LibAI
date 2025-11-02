FROM python:3.11-slim

RUN apt-get update && apt-get install -y yaz && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

<<<<<<< Updated upstream
CMD ["python", "test.py"]
=======
CMD ["python", "run.py"]
>>>>>>> Stashed changes
