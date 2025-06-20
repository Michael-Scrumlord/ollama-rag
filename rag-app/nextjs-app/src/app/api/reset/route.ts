import { NextRequest, NextResponse } from 'next/server';
import { ChromaClient } from 'chromadb-client';

const CHROMADB_URL = process.env.CHROMADB_API_BASE_URL || 'http://chromadb-service:8000';
const COLLECTION_NAME = 'conversation_history';

// Reuse client and collection logic similar to chat route for consistency
let chromaClient: ChromaClient | null = null;

async function getChromaClient() {
  if (chromaClient) {
    return chromaClient;
  }
  try {
    chromaClient = new ChromaClient({ path: CHROMADB_URL });
    await chromaClient.heartbeat(); // Check connection
    console.log("ChromaDB connection successful for reset.");
    return chromaClient;
  } catch (error) {
    console.error('Error initializing ChromaDB client for reset:', error);
    if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED'))) {
        throw new Error(`Failed to connect to ChromaDB at ${CHROMADB_URL}. Ensure it's running.`);
    }
    throw new Error('Could not initialize ChromaDB client for reset.');
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Reset API called. Attempting to clear ChromaDB collection.");
    const client = await getChromaClient();

    try {
      // Option 1: Delete and recreate the collection (simplest way to clear)
      // This is often easier than deleting all items if the client library supports it well.
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`Collection '${COLLECTION_NAME}' deleted.`);

      // Recreate it empty for future use in the same session (optional, depends on desired behavior)
      // If not recreated here, the chat route's getOrCreateCollection will handle it.
      // For simplicity, let chat route handle recreation.
      // const embedder = new OpenAIEmbeddingFunction({ openai_api_key: "NA" }); // Or your chosen embedder
      // await client.createCollection({ name: COLLECTION_NAME, embeddingFunction: embedder });
      // console.log(`Collection '${COLLECTION_NAME}' recreated.`);

      // Option 2: If deleting all items is preferred and supported directly
      // const collection = await client.getCollection({ name: COLLECTION_NAME });
      // const allItems = await collection.get(); // Get all items (potentially with a limit or query)
      // if (allItems.ids.length > 0) {
      //   await collection.delete({ ids: allItems.ids });
      //   console.log(`All items deleted from collection '${COLLECTION_NAME}'.`);
      // } else {
      //   console.log(`Collection '${COLLECTION_NAME}' was already empty.`);
      // }

    } catch (error) {
      // It's possible the collection doesn't exist, which is fine for a reset.
      if (error instanceof Error && error.message.includes("it does not exist")) { // Adjust error message check as per actual client behavior
        console.log(`Collection '${COLLECTION_NAME}' did not exist, nothing to clear.`);
      } else {
        // For other errors during deletion/clearing
        console.error(`Error clearing collection '${COLLECTION_NAME}':`, error);
        throw new Error(`Failed to clear conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ message: 'Conversation history cleared successfully.' });

  } catch (error) {
    console.error('Error in reset API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: `Internal server error during reset: ${errorMessage}` }, { status: 500 });
  }
}
