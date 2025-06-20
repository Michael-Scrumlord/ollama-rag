# Use the official ChromaDB image
FROM chromadb/chroma

# The base image already exposes port 8000 and is configured
# to use /chroma_data for persistent storage.
# No additional EXPOSE or CMD override is typically needed for basic setup.

# Optional: Add any build-time configurations or scripts here if necessary in the future.

# Healthcheck (optional but good practice)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/v1/heartbeat || exit 1

# The default entrypoint and command from the base image will start ChromaDB.
