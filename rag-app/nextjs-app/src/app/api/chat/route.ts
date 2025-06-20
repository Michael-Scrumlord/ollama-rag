import { NextRequest, NextResponse } from 'next/server';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb-client';

const OLLAMA_API_URL = process.env.OLLAMA_API_BASE_URL || 'http://ollama-service:11434';
const CHROMADB_URL = process.env.CHROMADB_API_BASE_URL || 'http://chromadb-service:8000';
const COLLECTION_NAME = 'conversation_history';

// A simple in-memory store for the ChromaDB client and collection to avoid re-initializing on every request in a serverless environment (for dev/demo purposes)
// In a production scenario, you might manage this differently.
let chromaClient: ChromaClient | null = null;
let collection: any | null = null; // Adjust 'any' to the actual Collection type if available from chromadb-client

async function getChromaCollection() {
  if (collection) {
    return collection;
  }

  try {
    if (!chromaClient) {
      chromaClient = new ChromaClient({ path: CHROMADB_URL });
    }

    // Check if ChromaDB is available (simple heartbeat check)
    try {
        await chromaClient.heartbeat();
        console.log("ChromaDB connection successful.");
    } catch (dbError) {
        console.error("ChromaDB connection failed on heartbeat:", dbError);
        throw new Error("ChromaDB is not available. Please ensure it is running and accessible.");
    }

    // Using a simple embedding function for demonstration if OpenAI's is not desired or API key not set
    // For production, ensure your embedding model matches the one used for generating embeddings
    // and that it's available/configured correctly.
    // The default chromadb-client embedding function might require an OpenAI API key.
    // If you don't have one or don't want to use OpenAI, you'd need to use a different embedding function
    // compatible with your setup (e.g., one that calls out to Ollama for embeddings, or a sentence-transformers model).
    // For now, this will likely cause issues if OPENAI_API_KEY is not set in the env.
    // Let's try to use a placeholder embedder that might work without API keys or use a default.
    // NOTE: The default embedding function of ChromaClient might be OpenAI.
    // If it is, and an API key is not provided, collection creation/querying will fail.
    // For a truly local setup, one might need to run a local embedding model.
    // For this example, we'll proceed assuming a default or an environment where it might work.
    const embedder = new OpenAIEmbeddingFunction({ openai_api_key: "NA" }); // Attempt with a dummy key, may default to something else or fail.

    collection = await chromaClient.getOrCreateCollection({
      name: COLLECTION_NAME,
      // embeddingFunction: embedder, // Explicitly providing embedder; adjust as needed
    });
    console.log(`ChromaDB collection '${COLLECTION_NAME}' retrieved or created.`);
    return collection;
  } catch (error) {
    console.error('Error initializing ChromaDB client or collection:', error);
    // If it's a connection error to ChromaDB itself
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED'))) {
        throw new Error(`Failed to connect to ChromaDB at ${CHROMADB_URL}. Ensure it's running.`);
    }
    throw new Error('Could not initialize ChromaDB collection.');
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userInput = body.message;

    if (!userInput) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    let ragContext = '';
    try {
      const currentCollection = await getChromaCollection();
      if (currentCollection) {
        const results = await currentCollection.query({
          queryTexts: [userInput],
          nResults: 3, // Get top 3 most relevant past exchanges
        });

        if (results.documents && results.documents.length > 0 && results.documents[0].length > 0) {
          ragContext = "Relevant past conversation snippets:\n";
          results.documents[0].forEach((doc: string) => {
            ragContext += `- ${doc}\n`;
          });
        }
      }
    } catch (dbError) {
      console.warn('ChromaDB query failed, proceeding without context:', dbError);
      // Do not throw error, just proceed without RAG context if DB fails
    }

    const augmentedPrompt = `${ragContext}\n\nCurrent question: ${userInput}\n\nAnswer:`;

    let ollamaResponseText = "Sorry, I couldn't get a response from the LLM.";
    try {
      const ollamaResponse = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'orca-mini', // Ensure this model is available in your Ollama service
          prompt: augmentedPrompt,
          stream: false, // For simplicity, not using streaming responses
        }),
      });

      if (!ollamaResponse.ok) {
        const errorBody = await ollamaResponse.text();
        console.error('Ollama API error:', ollamaResponse.status, errorBody);
        throw new Error(`Ollama API request failed with status ${ollamaResponse.status}: ${errorBody}`);
      }

      const ollamaData = await ollamaResponse.json();
      ollamaResponseText = ollamaData.response || "No content in Ollama response.";

    } catch (ollamaError) {
        console.error('Error communicating with Ollama:', ollamaError);
        // Return the error or a fallback message, but don't store this error interaction in Chroma
        return NextResponse.json({ reply: `Error with LLM: ${ollamaError instanceof Error ? ollamaError.message : 'Unknown error'}` });
    }

    // Store the current interaction (original input and LLM response) in ChromaDB
    // Do this *after* getting a successful response from Ollama
    try {
      const currentCollection = await getChromaCollection(); // Re-get in case of initial failure
      if (currentCollection) {
        const interactionString = `User: ${userInput}\nAI: ${ollamaResponseText}`;
        const uniqueId = `interaction_${Date.now()}`;
        await currentCollection.add({
          ids: [uniqueId],
          documents: [interactionString],
        });
      }
    } catch (dbAddError) {
      console.warn('Failed to store interaction in ChromaDB:', dbAddError);
      // Non-critical error, so we don't fail the request
    }

    return NextResponse.json({ reply: ollamaResponseText });

  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
