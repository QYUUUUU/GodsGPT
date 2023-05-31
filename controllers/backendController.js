const { OpenAI } = require("langchain/llms/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Document } = require("langchain/document");

exports.getEmbedding = async (req, res) => {
    try {

        const loaderpdf = new PDFLoader("Documentation/docJDR.pdf");

        // Initialize the Text Splitter with a maximum chunk size of 1000 characters and an overlap of 100 characters
        const splitter = new RecursiveCharacterTextSplitter({ maxChunkSize: 1000, overlapSize: 100 });

        // Load and split the PDF document
        const docspdf = await loaderpdf.loadAndSplit(splitter);

        docspdf.forEach(doc => {
            doc.pageContent = doc.pageContent.replace(/(\n\s*)+/g, '\n');
            doc.pageContent = doc.pageContent.trim().replaceAll('\n', '  ');
        });

        // Create vector store and index the docs
        const vectorStore = await HNSWLib.fromDocuments(docspdf, new OpenAIEmbeddings());


        // Save the vector store to a directory
        const directory = 'data/VectorStores/pdf/';
        await vectorStore.save(directory);

        //Render OK
        res.render('../views/embedding.html.twig');

    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing request");
    }
  };

exports.processData = async (req, res) => {
    try {
        const data = req.body;
        // Perform necessary processing on the data
        const result = await processVectors(data.prompt);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing request");
    }
};

async function processVectors(data){
    
    const vectorStore = await getVectorStore();

    const model = new OpenAI({
        temperature: 0,
        maxTokens: 300,
        modelName: 'gpt-3.5-turbo',
        verbose: false,
        openAIApiKey: process.env.OPENAI_API_KEY,
        });

    const sanitizedQuestion = data.trim().replaceAll('\n', ' ');

    //Recherche par similarité de vecteurs filtrée par leur métadata, retournant 3 documents
    const retrievedContext = await vectorStore.similaritySearch(sanitizedQuestion,3);

    //Construction du prompt à partir des documents récupérés par similaritySearch et de la question nettoyée de l'utilisateur
    var context = "";

    retrievedContext.forEach(document => {
        context += document["pageContent"]
    });

    var QA_PROMPT = `Les informations de contexte sont ci-dessous. 
    ---------------------
    ${context}
    ---------------------
    Compte tenu des informations contextuelles et non des connaissances préalables, répondez à la question suivante : ${sanitizedQuestion} ?:
    
    `;

    //Ask a question using built prompt
    const res = await model.call(QA_PROMPT);

    const result = retrievedContext.concat(res);

    return result
}


async function getVectorStore() {
    // Load the vector store from the same directory
    const directory = 'data/VectorStores/pdf/';
    const loadedVectorStore = await HNSWLib.load(
        directory,
        new OpenAIEmbeddings({verbose : false , openAIApiKey : process.env.OPENAI_API_KEY})
    );
    return loadedVectorStore;
  }

