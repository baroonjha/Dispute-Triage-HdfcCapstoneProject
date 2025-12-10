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

        // Step 1: Read as array of arrays to find the header row
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        let headerRowIndex = 0;
        let foundHeader = false;

        // Scan first 20 rows for a likely header
        for (let i = 0; i < Math.min(rawData.length, 20); i++) {
            const row = rawData[i];
            const rowString = JSON.stringify(row).toLowerCase();
            // Check for critical columns
            if (rowString.includes('ticket id') && (rowString.includes('amount') || rowString.includes('days open'))) {
                headerRowIndex = i;
                foundHeader = true;
                console.log(`Found header row at index ${i}:`, row);
                break;
            }
        }

        if (!foundHeader) {
            console.warn('Could not identify header row, defaulting to first row');
        }

        // Step 2: Parse again using the found header row
        const jsonData = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex });

        console.log(`Parsed ${jsonData.length} rows from Excel starting at row ${headerRowIndex}`);

        // Helper to find value by fuzzy key matching
        const getValue = (row: any, ...keys: string[]) => {
            const rowKeys = Object.keys(row);
            for (const key of keys) {
                // 1. Exact match
                if (row[key] !== undefined) return row[key];

                // 2. Trimmed match
                const trimmedKey = rowKeys.find(k => k.trim() === key);
                if (trimmedKey && row[trimmedKey] !== undefined) return row[trimmedKey];

                // 3. Case-insensitive matched (be careful with this one, but useful for 'amount' vs 'Amount')
                const lowerKey = rowKeys.find(k => k.toLowerCase().trim() === key.toLowerCase());
                if (lowerKey && row[lowerKey] !== undefined) return row[lowerKey];
            }
            return undefined;
        };

        const disputesToInsert = jsonData.map((row: any, index) => {
            try {
                // Skip completely empty rows
                if (Object.keys(row).length === 0) return null;

                const amountVal = getValue(row, 'Amount (in INR)', 'Amount', 'amount');
                const amount = Number(amountVal || 0);

                const daysOpenVal = getValue(row, 'Days Open', 'daysOpen', 'DaysOpen');
                const daysOpen = Number(daysOpenVal || 0);

                // Start: Debug logging for first row to see what keys exist vs what we found
                if (index === 0) {
                    console.log('First Row Keys:', Object.keys(row));
                    console.log('Found Amount:', amount, 'from keys:', ['Amount (in INR)', 'Amount', 'amount']);
                    console.log('Found Days Open:', daysOpen, 'from keys:', ['Days Open', 'daysOpen', 'DaysOpen']);
                }
                // End: Debug logging

                // Use provided priority or calculate it
                const priorityVal = getValue(row, 'SLA Priority', 'Priority', 'priority');
                const priority = priorityVal || calculatePriority(daysOpen, amount);

                const stageVal = getValue(row, 'Stage', 'stage');
                const stage = stageVal || 'Stage 1 - New';

                const presentStageVal = getValue(row, 'Present Stage', 'presentStage');
                const presentStage = presentStageVal || '';

                const daysInPresentStageVal = getValue(row, 'Days in Present Stage', 'daysInPresentStage', 'DaysInPresentStage');
                const daysInPresentStage = Number(daysInPresentStageVal || 0);

                const recommendedAction = determineAction(stage, priority);

                const statusVal = getValue(row, 'Status', 'status');
                const status = statusVal || 'Open';

                const ticketIdVal = getValue(row, 'Ticket ID', 'ticketId', 'TicketId');
                const ticketId = ticketIdVal || `WEB-${Date.now()}-${Math.floor(Math.random() * 1000)}-${index}`;

                const categoryVal = getValue(row, 'Issue Category', 'issueCategory', 'IssueCategory');
                const issueCategory = categoryVal || 'Unspecified';

                const channelVal = getValue(row, 'Channel', 'channel', 'Chanel'); // 'Chanel' just in case of typos
                const channel = channelVal || 'Web';

                return {
                    ticketId: ticketId,
                    userId: 'UNKNOWN', // Excel doesn't have User ID, defaulting
                    amount: amount,
                    issueCategory: issueCategory,
                    channel: channel,
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

        // Optional: clear existing if needed? For now just insert
        // await Dispute.deleteMany({}); // Uncomment if you want to replace all data

        // Upsert logic: if ticketId exists, update it; otherwise insert
        // But insertMany is faster. For now, let's stick to insertMany but ideally we should handle duplicates.
        // Provided schema says ticketId is unique. insertMany will fail if duplicates exist.
        // Let's use bulkWrite for upsert to be safe, or just ignore errors on duplicates.

        // Simpler approach for this task: Check for existing IDs and filter them out OR use bulkWrite.
        // Given the requirement is "upload from excel", usually implies adding or refreshing. 
        // Let's try to strip out existing IDs first to avoid errors.
        const existingIds = await Dispute.find({ ticketId: { $in: disputesToInsert.map(d => d!.ticketId) } }).select('ticketId');
        const existingIdSet = new Set(existingIds.map(d => d.ticketId));

        const newDisputes = disputesToInsert.filter(d => !existingIdSet.has(d!.ticketId));

        if (newDisputes.length > 0) {
            await Dispute.insertMany(newDisputes);
        } else {
            console.log('No new disputes to insert (all duplicates)');
        }

        console.log(`Successfully processed ${disputesToInsert.length} rows. Inserted ${newDisputes.length} new disputes.`);

        return NextResponse.json({ message: `Successfully uploaded. Added ${newDisputes.length} new disputes.` });
    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
