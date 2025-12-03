import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Dispute from '@/models/Dispute';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    try {
        await dbConnect();
        const { ticketId } = await params;

        const dispute = await Dispute.findOne({ ticketId });

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        return NextResponse.json(dispute);
    } catch (error) {
        console.error('Error fetching dispute:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    try {
        await dbConnect();
        const { ticketId } = await params;
        const body = await req.json();

        const dispute = await Dispute.findOne({ ticketId });

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        // Update fields
        if (body.status) dispute.status = body.status;
        if (body.stage) dispute.stage = body.stage;
        if (body.recommendedAction) dispute.recommendedAction = body.recommendedAction;
        if (body.priority) dispute.priority = body.priority;

        await dispute.save();

        return NextResponse.json(dispute);
    } catch (error) {
        console.error('Error updating dispute:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
