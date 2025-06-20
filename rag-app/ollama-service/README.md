# Ollama Service

This directory contains the configuration for the Ollama service, which provides access to Large Language Models (LLMs).

## Docker Configuration

- **Dockerfile:** Defines the Docker image for the Ollama service.
  - It uses the official `ollama/ollama` base image.
  - It pulls the `orca-mini` model by default during the image build process. You can change this model in the `Dockerfile` or pull other models dynamically after the container is running.
  - It exposes port `11434` for the Ollama API.

## Environment Variables

Currently, the service uses the default Ollama configuration. If customization is needed, the following environment variables could be considered (though they are not explicitly set by default in this setup):

- `OLLAMA_HOST`: Defines the host address Ollama listens on (default: `0.0.0.0`, listens on all interfaces within the container).
- `OLLAMA_PORT`: Defines the port Ollama listens on (default: `11434`).
- `OLLAMA_MODELS`: Path to the directory where Ollama models are stored. In the `docker-compose.yml` at the root, this is mapped to `./ollama-service` on the host, which corresponds to `/root/.ollama` inside the container (Ollama's default model directory).

## Usage

This service is managed by the `docker-compose.yml` file in the root `rag-app` directory.

To interact with Ollama directly (once the service is running):
1. Ensure Docker is running and the service has been started (e.g., via `docker-compose up ollama`).
2. You can use the Ollama CLI or API. For example, to list models:
   ```bash
   curl http://localhost:11434/api/tags
   ```
3. To run a model:
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "orca-mini",
     "prompt": "Why is the sky blue?"
   }'
   ```

Refer to the [Ollama documentation](https://github.com/ollama/ollama) for more details on available models and API endpoints.
