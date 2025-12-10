import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDispute extends Document {
    ticketId: string;
    userId: string;
    amount: number;
    issueCategory: string;
    channel: string;
    status: string;
    priority: 'L0' | 'L1' | 'L2' | 'L3' | 'Resolved';
    stage: string;
    presentStage?: string;
    daysOpen: number;
    daysInPresentStage: number;
    recommendedAction: string;
    createdAt: Date;
    updatedAt: Date;
}

const DisputeSchema: Schema = new Schema(
    {
        ticketId: { type: String, required: true, unique: true, index: true },
        userId: { type: String, required: true, index: true },
        amount: { type: Number, required: true },
        issueCategory: { type: String, required: true },
        channel: { type: String, required: true },
        status: {
            type: String,
            default: 'Open',
        },
        priority: {
            type: String,
            enum: ['L0', 'L1', 'L2', 'L3', 'Resolved'],
            required: true,
        },
        stage: { type: String, default: 'Stage 1 - New' },
        presentStage: { type: String },
        daysOpen: { type: Number, default: 0 },
        daysInPresentStage: { type: Number, default: 0 },
        recommendedAction: { type: String, default: 'Investigate' },
    },
    { timestamps: true }
);

// Check if model already exists to prevent overwrite error during hot reload
const Dispute: Model<IDispute> =
    mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);

export default Dispute;
