

const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { PineconeClient } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PineconeStore } = require('langchain/vectorstores/pinecone');

const pinecone = new PineconeClient();

module.exports.load = async (data) => {
  try {
    const downloadPath = data.filePath;
    const filename = downloadPath.split('/').pop();
    const loader = new PDFLoader(downloadPath, {
      splitPages: true
    });

    const docs = await loader.load();
    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitUpDocs = await textSplitter.splitDocuments(docs);
    await pinecone.init({
      projectName: process.env.PROJECT_NAME,
      environment: process.env.PINECONE_ENVIRONMENT,
      apiKey: process.env.PINECONE_API_KEY
    });

    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME); //change to your own index name
    //Create pinecone store using the documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      projectName: "Default Project",
      pineconeIndex: index,
      namespace: filename,
      textKey: 'text',
    });
    return {
      "fileName": filename,
      "message": "File loaded successfully",
    };
  } catch (error) {
    console.log('error', error);
    return (error);
  }
}