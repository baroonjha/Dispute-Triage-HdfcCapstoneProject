import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(req: NextRequest) {
    try {
        if (!API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API Key not configured' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { history } = body;

        if (!history || !Array.isArray(history)) {
            return NextResponse.json(
                { error: 'Invalid chat history' },
                { status: 400 }
            );
        }

        const chatContent = history
            .map((msg: any) => `${msg.role}: ${msg.content}`)
            .join('\n');

        const prompt = `
        Analyze the following chat history between a user and a bank support assistant.
        Extract the following details if present:
        - amount: The amount of money involved (number only).
        - issueCategory: The category of the issue (e.g., "UPI Transaction", "Credit Card", "Fraud", "General Inquiry").
        - channel: The channel where the issue occurred (default to "Chatbot" if not specified, but try to infer like "Mobile App", "Net Banking").
        - priority: The priority level based on urgency (L0 for fraud/urgent, L1 for high, L2 for medium, L3 for low).

        Chat History:
        ${chatContent}

        Return the result as a JSON object with keys: amount, issueCategory, channel, priority.
        If a field is not found, use null or a reasonable default.
        Do not include markdown formatting in the response, just the raw JSON string.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const extractedDetails = JSON.parse(text);

        return NextResponse.json(extractedDetails);

    } catch (error) {
        console.error('Error extracting dispute details:', error);
        return NextResponse.json(
            { error: 'Failed to extract details' },
            { status: 500 }
        );
    }
}
