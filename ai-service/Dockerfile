FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies needed for some Python packages (like opencv/PIL)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port (default 7860 untuk Hugging Face, bisa sesuaikan)
EXPOSE 7860

# Jalankan uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
