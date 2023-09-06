const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { makeChain } = require('../utils/openai-wrapper');
const pinecone = new PineconeClient();

module.exports.ask = async (event) => {
  const { chat, history, filename } = event;
  console.log(`FileName: ${filename}`);
  console.log(`Question:  ${chat}`);
  console.log(`History: ${history}`);
  const vectorStore = await setupPineconeClient(filename);
  //create chain
  const chain = makeChain(vectorStore);
  //Ask a question using chat history
  const response = await chain.call({
    question: chat,
    chat_history: history || [],
  });

  return {
    response: response,
    chat: chat,
    history: history
  };
}

async function setupPineconeClient(filename) {
  await pinecone.init({
    projectName: "Default Project",
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: index,
      textKey: 'text',
      namespace: filename, //namespace comes from your config folder
    }
  );
  return vectorStore;
}