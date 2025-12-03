import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import PDFParser from 'pdf2json';

const API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

const genAI = new GoogleGenerativeAI(API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

export async function POST(req: NextRequest) {
    try {
        if (!API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
            return NextResponse.json(
                { error: 'Missing API Keys or Index Name' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        let text = '';
        const buffer = Buffer.from(await file.arrayBuffer());

        if (file.type === 'application/pdf') {
            const pdfParser = new PDFParser(null, true);
            text = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", () => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if (file.type === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Only PDF and TXT are supported.' },
                { status: 400 }
            );
        }

        // Chunking
        const chunkSize = 1000;
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }

        // Initialize Pinecone
        const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
        const index = pc.index(PINECONE_INDEX_NAME);

        // Generate Embeddings and Upsert
        const vectors = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const result = await embeddingModel.embedContent(chunk);
            const embedding = result.embedding.values;

            vectors.push({
                id: `${file.name}-${i}`,
                values: embedding,
                metadata: {
                    text: chunk,
                    filename: file.name,
                    chunkIndex: i,
                },
            });
        }

        // Batch upsert (Pinecone limit is usually 100 or 2MB request size)
        const batchSize = 50;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await index.upsert(batch);
        }

        return NextResponse.json({
            message: 'Ingestion successful',
            chunksProcessed: chunks.length,
        });

    } catch (error) {
        console.error('Error in RAG Ingestion:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
