import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';

const API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

if (!API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

// Fallback context if RAG fails or is not configured
const FALLBACK_CONTEXT = `
You are a Bank Dispute Resolution Assistant. Use the following policy to answer questions:

1. Turnaround Time (TAT):
   - L0 (Critical/Fraud): 4 Hours.
   - L1 (High Priority): 24 Hours.
   - L2 (Medium): 48 Hours.
   - L3 (Low): 3-5 Working Days.
   
2. Escalation Policy:
   - If a user mentions "fraud", "scam", or "urgent", mark as L0.
   - If a user is unsatisfied, offer to lodge a formal dispute.
   
3. Refund Policy:
   - UPI failures are auto-reversed in T+1 days.
   - Credit Card disputes take 7-14 days.

Answer the user's question based on this context. Be polite and professional.
`;

export async function POST(req: NextRequest) {
    try {
        if (!API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API Key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        let context = FALLBACK_CONTEXT;
        let usedRAG = false;

        // RAG Retrieval
        if (PINECONE_API_KEY && PINECONE_INDEX_NAME) {
            try {
                const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
                const index = pc.index(PINECONE_INDEX_NAME);

                const embeddingResult = await embeddingModel.embedContent(message);
                const embedding = embeddingResult.embedding.values;

                const queryResponse = await index.query({
                    vector: embedding,
                    topK: 3,
                    includeMetadata: true,
                });

                if (queryResponse.matches && queryResponse.matches.length > 0) {
                    const retrievedChunks = queryResponse.matches
                        .map((match: any) => match.metadata.text)
                        .join('\n\n');

                    context = `
                    You are a Bank Dispute Resolution Assistant.
                    Use the following retrieved context to answer the user's question.
                    If the answer is not in the context, say you don't know and advise them to contact support.
                    
                    Retrieved Context:
                    ${retrievedChunks}
                    `;
                    usedRAG = true;
                }
            } catch (ragError) {
                console.error('RAG Retrieval failed, falling back to static context:', ragError);
            }
        }

        let chatHistory = history || [];
        const geminiHistory = chatHistory
            .map((msg: any) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }))
            .filter((msg: any, index: number) => {
                if (index === 0 && msg.role === 'model') return false;
                return true;
            });

        const chat = model.startChat({
            history: geminiHistory,
        });

        const prompt = `Context: ${context}\n\nUser Question: ${message}\n\nAnswer:`;

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const text = response.text();

        // Check for escalation triggers
        const lowerMsg = message.toLowerCase();
        const shouldEscalate =
            lowerMsg.includes('fraud') ||
            lowerMsg.includes('scam') ||
            lowerMsg.includes('urgent') ||
            lowerMsg.includes('unsatisfied');

        return NextResponse.json({
            role: 'assistant',
            content: text,
            shouldEscalate,
            usedRAG,
        });
    } catch (error) {
        console.error('Error in Chat API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
