// Load langchain modules for PDF loading and text splitting
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter'); 

// Initialize Pinecone client 
const { PineconeClient } = require('@pinecone-database/pinecone');
const pinecone = new PineconeClient();

// Langchain module for OpenAI embeddings
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');  

// Langchain Pinecone storage module
const { PineconeStore } = require('langchain/vectorstores/pinecone');

module.exports.load = async (data) => {

  try {

    // Get PDF file path from input data
    const downloadPath = data.filePath; 
    const filename = downloadPath.split('/').pop();

    // Load PDF using langchain PDFLoader
    const loader = new PDFLoader(downloadPath, { splitPages: true });
    const docs = await loader.load();

    // Split text from PDF into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,  
      chunkOverlap: 200,
    });
    const splitUpDocs = await textSplitter.splitDocuments(docs);

    // Initialize Pinecone client
    await pinecone.init({
      projectName: process.env.PROJECT_NAME,
      environment: process.env.PINECONE_ENVIRONMENT, 
      apiKey: process.env.PINECONE_API_KEY
    });

    // Create OpenAI embeddings helper
    const embeddings = new OpenAIEmbeddings();

    // Get Pinecone index 
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // Index docs into Pinecone using PineconeStore
    await PineconeStore.fromDocuments(docs, embeddings, {
      projectName: "Default Project",
      pineconeIndex: index,
      namespace: filename,  
      textKey: 'text',
    });

    // Return success response
    return {
      "fileName": filename,
      "message": "File loaded successfully",
    };
  
  } catch (error) {

    // Log any errors
    console.log('error', error);
    return (error);

  }
}