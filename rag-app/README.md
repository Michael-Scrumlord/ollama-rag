# RAG Application

This project implements a RAG (Retrieval Augmented Generation) application using Next.js, Ollama, and ChromaDB, all orchestrated with Docker Compose.

## Components

- **Next.js App (`nextjs-app`):** Frontend for user interaction, running on port 3000.
- **Ollama Service (`ollama-service`):** Serves the LLM for generation tasks, running on port 11434. It is pre-configured to pull the `orca-mini` model.
- **ChromaDB Service (`chromadb-service`):** Vector database for storing and retrieving embeddings, running on port 8000.

## Prerequisites

- Docker and Docker Compose installed on your system.
- Git (for cloning the repository).

## Setup and Usage

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd rag-app
    ```

2.  **Build and Start Services:**
    Navigate to the `rag-app` root directory (where this `README.md` and `docker-compose.yml` are located) and run:
    ```bash
    docker-compose up --build
    ```
    - The `--build` flag ensures that Docker images are built (or rebuilt if changes are detected in their respective Dockerfiles or contexts).
    - This command will start all three services (`nextjs-app`, `ollama-service`, `chromadb-service`).
    - You can monitor the logs in your terminal. The Next.js application will be available at [http://localhost:3000](http://localhost:3000).
    - The Ollama service will be available at [http://localhost:11434](http://localhost:11434).
    - The ChromaDB service will be available at [http://localhost:8000](http://localhost:8000).

3.  **Accessing the Application:**
    Open your web browser and go to [http://localhost:3000](http://localhost:3000) to use the RAG application.

4.  **Stopping Services:**
    To stop all running services, press `Ctrl+C` in the terminal where `docker-compose up` is running. Then, or in a new terminal in the same directory, run:
    ```bash
    docker-compose down
    ```
    - This command stops and removes the containers.
    - Named volumes (`ollama_data` and `chroma_data`) will persist the data for Ollama models and ChromaDB vector stores respectively. If you want to remove the data as well, you can run `docker-compose down -v`.

## Development

- The Next.js application (`./nextjs-app`) is mounted as a volume, allowing for hot-reloading of code changes during development.
- When you make changes to the frontend code in `./nextjs-app`, the Next.js development server should automatically rebuild and refresh your browser.
- If you change configurations in `Dockerfile`s or the `docker-compose.yml` file, you'll need to rebuild the images using `docker-compose up --build`.

## Service Details

- **Ollama (`ollama-service`):**
    - Models are stored in the `ollama_data` Docker volume, which is persisted on your host machine.
    - The `Dockerfile` pulls `orca-mini` by default. You can interact with Ollama's API (e.g., to pull other models) through `http://localhost:11434`.
- **ChromaDB (`chromadb-service`):**
    - Database files are stored in the `chroma_data` Docker volume.
- **Next.js App (`nextjs-app`):**
    - Communicates with Ollama via `http://ollama-service:11434` (service discovery within Docker network).
    - Communicates with ChromaDB via `http://chromadb-service:8000` (service discovery within Docker network).

## Troubleshooting

- If you encounter issues with port conflicts, ensure that ports `3000`, `8000`, and `11434` are not already in use on your host machine or change the port mappings in `docker-compose.yml`.
- Check the logs for each service for specific error messages: `docker-compose logs <service_name>` (e.g., `docker-compose logs nextjs-app`).
