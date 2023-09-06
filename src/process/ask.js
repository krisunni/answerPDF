// Import Pinecone and OpenAI langchain modules
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');

// Import function to create conversational chain 
const { makeChain } = require('../utils/openai-wrapper');

// Initialize Pinecone client
const pinecone = new PineconeClient();

module.exports.ask = async (event) => {

  // Get data from request
  const { chat, history, filename } = event; 

  // Log input for debugging
  console.log(`FileName: ${filename}`);
  console.log(`Question: ${chat}`);
  console.log(`History: ${history}`);

  // Set up Pinecone client and get vector store
  const vectorStore = await setupPineconeClient(filename);
  
  // Create conversational chain
  const chain = makeChain(vectorStore);

  // Ask question using chat history
  const response = await chain.call({
    question: chat,
    chat_history: history || [], 
  });

  // Return response
  return { 
    response: response, 
    chat: chat, 
    history: history 
  };

}

// Helper to initialize Pinecone and get vector store 
async function setupPineconeClient(filename) {

  // Initialize Pinecone client
  await pinecone.init({
    projectName: "Default Project",
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY
  });

  // Get Pinecone index
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  // Create vector store from index
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}), 
    {
      pineconeIndex: index,
      textKey: 'text',
      namespace: filename, 
    }
  );

  return vectorStore;

}