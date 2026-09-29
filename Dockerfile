# Python 3.12 Slim base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend code, models, and test images
COPY backend/ /app/backend/
COPY BrainTumor/Model/ /app/BrainTumor/Model/
COPY BrainTumor/testImages/ /app/BrainTumor/testImages/
COPY BrainTumor/brain_tumor_dataset/ /app/BrainTumor/brain_tumor_dataset/

# Expose port (default 8000, or Render/Railway PORT env)
EXPOSE 8000

ENV PORT=8000
WORKDIR /app/backend

# Launch FastAPI with Uvicorn
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
