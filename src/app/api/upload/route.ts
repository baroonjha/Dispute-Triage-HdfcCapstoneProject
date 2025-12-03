import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Dispute from '@/models/Dispute';
import * as XLSX from 'xlsx';
import { calculatePriority, determineAction } from '@/lib/triage';

export async function POST(req: Request) {
    try {
        console.log('Upload request received');
        await dbConnect();

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('No file found in formData');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log(`Processing file: ${file.name}, size: ${file.size}`);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let workbook;
        try {
            workbook = XLSX.read(buffer, { type: 'buffer' });
        } catch (e) {
            console.error('Error parsing Excel file:', e);
            return NextResponse.json({ error: 'Invalid Excel file format' }, { status: 400 });
        }

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            console.error('No sheets found in workbook');
            return NextResponse.json({ error: 'Empty Excel file' }, { status: 400 });
        }

        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        console.log(`Parsed ${jsonData.length} rows from Excel`);

        const disputesToInsert = jsonData.map((row: any, index) => {
            try {
                const amount = Number(row['Amount (in INR)'] || row['Amount'] || row['amount'] || 0);
                const daysOpen = Number(row['Days Open'] || row['daysOpen'] || 0);
                // Use provided priority or calculate it
                const priority = row['SLA Priority'] || calculatePriority(daysOpen, amount);
                const stage = row['Stage'] || 'Stage 1 - New';
                const presentStage = row['Present Stage'] || '';
                const daysInPresentStage = Number(row['Days in Present Stage'] || 0);
                const recommendedAction = determineAction(stage, priority);
                const status = row['Status'] || 'Open';

                return {
                    ticketId: row['Ticket ID'] || row['ticketId'] || `WEB-${Date.now()}-${Math.floor(Math.random() * 1000)}-${index}`,
                    userId: 'UNKNOWN', // Excel doesn't have User ID, defaulting
                    amount: amount,
                    issueCategory: row['Issue Category'] || row['issueCategory'] || 'Unspecified',
                    channel: row['Channel'] || row['channel'] || 'Web',
                    status: status,
                    priority,
                    stage,
                    presentStage,
                    daysOpen,
                    daysInPresentStage,
                    recommendedAction,
                };
            } catch (err) {
                console.error(`Error processing row ${index}:`, err);
                return null;
            }
        }).filter(Boolean); // Remove nulls

        if (disputesToInsert.length === 0) {
            console.warn('No valid disputes found to insert');
            return NextResponse.json({ message: 'No valid disputes found in file' }, { status: 400 });
        }

        await Dispute.insertMany(disputesToInsert);
        console.log(`Successfully inserted ${disputesToInsert.length} disputes`);

        return NextResponse.json({ message: `Successfully uploaded ${disputesToInsert.length} disputes` });
    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
