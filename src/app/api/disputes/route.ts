import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Dispute from '@/models/Dispute';
import { calculatePriority, determineAction } from '@/lib/triage';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, amount, issueCategory, channel } = body;

        if (!userId || !amount || !issueCategory || !channel) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Calculate Priority and Action
        // New disputes have 0 days open
        const priority = calculatePriority(0, amount);
        const recommendedAction = determineAction('Stage 1 - New', priority);

        // Generate Ticket ID
        const ticketId = `WEB-${Date.now()}`;

        const newDispute = await Dispute.create({
            ticketId,
            userId,
            amount,
            issueCategory,
            channel,
            priority,
            recommendedAction,
            stage: 'Stage 1 - New',
            status: 'Open',
        });

        return NextResponse.json(newDispute, { status: 201 });
    } catch (error) {
        console.error('Error creating dispute:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');

        const query: any = {};

        if (userId) query.userId = userId;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { ticketId: { $regex: search, $options: 'i' } },
                { issueCategory: { $regex: search, $options: 'i' } },
            ];
        }

        const disputes = await Dispute.find(query).sort({ createdAt: -1 });

        return NextResponse.json(disputes);
    } catch (error) {
        console.error('Error fetching disputes:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
