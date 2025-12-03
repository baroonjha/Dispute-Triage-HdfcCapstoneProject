import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Dispute from '@/models/Dispute';

export async function POST() {
    try {
        await dbConnect();

        // Clear existing data (optional, but good for reset)
        // await Dispute.deleteMany({}); 

        const sampleDisputes = [
            {
                ticketId: 'WEB-1717123456',
                userId: 'CUST-001',
                amount: 15000,
                issueCategory: 'Amount Deducted but not Credited',
                channel: 'UPI',
                priority: 'L2',
                stage: 'Stage 1 - New',
                recommendedAction: 'Standard Review',
                status: 'Open',
            },
            {
                ticketId: 'WEB-1717123457',
                userId: 'CUST-002',
                amount: 75000,
                issueCategory: 'Fraudulent Transaction',
                channel: 'Card',
                priority: 'L0',
                stage: 'Stage 1 - New',
                recommendedAction: 'URGENT: Manual Intervention Required (SLA Breach Risk)',
                status: 'Open',
            },
            {
                ticketId: 'WEB-1717123458',
                userId: 'CUST-003',
                amount: 500,
                issueCategory: 'Transaction Failed',
                channel: 'NetBanking',
                priority: 'L3',
                stage: 'Stage 3 - Customer Info Needed',
                recommendedAction: 'Customer Action: Send SMS/Email Reminder for Info',
                status: 'Open',
            },
            {
                ticketId: 'WEB-1717123459',
                userId: 'CUST-004',
                amount: 120000,
                issueCategory: 'Double Debit',
                channel: 'Card',
                priority: 'L0',
                stage: 'Stage 2 - Investigating',
                recommendedAction: 'URGENT: Manual Intervention Required (SLA Breach Risk)',
                status: 'Open',
            },
            {
                ticketId: 'WEB-1717123460',
                userId: 'CUST-005',
                amount: 2500,
                issueCategory: 'Wrong Beneficiary',
                channel: 'UPI',
                priority: 'L3',
                stage: 'Stage 4 - Reversal Pending',
                recommendedAction: 'Monitor: Verify Reversal Status',
                status: 'Open',
            },
        ];

        await Dispute.insertMany(sampleDisputes);

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
