# ChromaDB Service

This directory contains the configuration for the ChromaDB service, which provides a vector database for storing and retrieving embeddings.

## Docker Configuration

- **Dockerfile:** Defines the Docker image for the ChromaDB service.
  - It uses the official `chromadb/chroma` base image.
  - The base image is pre-configured to expose port `8000` for the ChromaDB API.
  - The base image uses the `/chroma_data` directory within the container for data storage.

## Data Persistence

Data persistence for ChromaDB is managed through a Docker volume, as defined in the `docker-compose.yml` file in the root `rag-app` directory.
The `docker-compose.yml` maps the host directory `./chromadb-service` (relative to the `rag-app` root) to the `/chroma_data` directory inside the ChromaDB container. This ensures that all data stored in ChromaDB persists across container restarts.

If you wish to clear all ChromaDB data, you can stop the services and remove the contents of the `rag-app/chromadb-service` directory on the host machine.

## Environment Variables

For a standard setup, ChromaDB does not require many specific environment variables beyond what the `chromadb/chroma` image provides by default. If you need to customize aspects like authentication, telemetry, or specific backend configurations, refer to the [official ChromaDB documentation](https://docs.trychroma.com/administration).

Relevant variables that *could* be set (but are not by default in this setup):
- `CHROMA_SERVER_HOST`: The host address ChromaDB server listens on (default: `0.0.0.0`).
- `CHROMA_SERVER_HTTP_PORT`: The port for the HTTP API (default: `8000`).
- `CHROMA_SERVER_GRPC_PORT`: The port for the gRPC API (default: `50051`, though not typically used directly by the app).
- `IS_PERSISTENT`: Should be `true` for data to be persisted, which is the default and desired behavior. This is usually controlled by passing `--path /chroma_data` to the `chroma run` command, which the official image handles.
- `ALLOW_RESET`: If set to `true`, allows an API call to `/api/v1/reset` to clear the database. This is `false` by default.

## Usage

This service is managed by the `docker-compose.yml` file in the root `rag-app` directory.

To interact with ChromaDB directly (once the service is running):
1. Ensure Docker is running and the service has been started (e.g., via `docker-compose up chromadb`).
2. You can use the ChromaDB client library (e.g., in Python) or its API. For example, to check the heartbeat:
   ```bash
   curl http://localhost:8000/api/v1/heartbeat
   ```

Refer to the [ChromaDB documentation](https://docs.trychroma.com) for more details on API endpoints and client usage.
