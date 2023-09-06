const { OpenAI } = require ('langchain/llms/openai');
const { ConversationalRetrievalQAChain } = require ('langchain/chains');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openAi = new OpenAIApi(configuration);
const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

const createEmbedding = async (input) => {
    const embeddingRes = await openAi.createEmbedding({
        model: 'text-embedding-ada-002',
        input: input
    });

    const [{embedding}] = embeddingRes.data.data;
    return embedding
}
 const makeChain = (vectorstore) => {
    const model = new OpenAI({
      temperature: 0, // increase temperature to get more creative answers
      modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
    });
  
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorstore.asRetriever(),
      {
        qaTemplate: QA_PROMPT,
        questionGeneratorTemplate: CONDENSE_PROMPT,
        returnSourceDocuments: true, //The number of source documents returned is 4 by default
      },
    );
    return chain;
  };

module.exports = {
    createEmbedding, 
    makeChain
}