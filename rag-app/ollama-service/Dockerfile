# Use the official Ollama image
FROM ollama/ollama

# Expose the default Ollama port
EXPOSE 11434

# Pull a model during the build (optional, but good for initial setup)
# Using orca-mini as it's relatively small. Replace with llama2 or other models as needed.
RUN ollama pull orca-mini

# The default entrypoint and command from the base image will start Ollama.
# No need to override CMD or ENTRYPOINT unless custom startup logic is required.
