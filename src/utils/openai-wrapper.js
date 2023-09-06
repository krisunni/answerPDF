// Import LangChain modules
const { OpenAI } = require('langchain/llms/openai');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const { QA_PROMPT, CONDENSE_PROMPT } = require('./constants');

// Import OpenAI API client  
const { Configuration, OpenAIApi } = require('openai'); 

// Configure OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, 
});
const openAi = new OpenAIApi(configuration);

// Helper function to generate embedding
const createEmbedding = async (input) => {
  
  // Call OpenAI embedding API
  const embeddingRes = await openAi.createEmbedding({
    model: 'text-embedding-ada-002',
    input: input
  });

  // Return first embedding 
  const [{embedding}] = embeddingRes.data.data;
  return embedding;
}

// Function to create conversational QA chain
const makeChain = (vectorstore) => {

  // Create OpenAI LLMs
  const model = new OpenAI({  
    temperature: 0,
    modelName: 'gpt-3.5-turbo', 
  });

  // Create conversational chain 
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(), 
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,  
      returnSourceDocuments: true,
    },
  );

  return chain;
};

// Export helper functions
module.exports = {
  createEmbedding,
  makeChain 
}