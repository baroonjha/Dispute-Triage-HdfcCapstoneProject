import { IDispute } from '@/models/Dispute';

export interface TriageInput {
    daysOpen: number;
    amount: number;
    stage: string;
    priority?: string;
}

/**
 * Calculate Priority based on Days Open and Amount.
 * SLA Logic:
 * 0-3 Days: L3
 * 4-11 Days: L2
 * 12-25 Days: L1
 * >25 Days: L0
 *
 * Boost Logic:
 * Amount > 50,000 -> Boost Priority by 1 level (e.g., L2 -> L1)
 */
export function calculatePriority(daysOpen: number, amount: number): 'L0' | 'L1' | 'L2' | 'L3' {
    let baseP = 3; // L3

    if (daysOpen > 25) {
        baseP = 0; // L0
    } else if (daysOpen >= 12) {
        baseP = 1; // L1
    } else if (daysOpen >= 4) {
        baseP = 2; // L2
    } else {
        baseP = 3; // L3
    }

    // Amount Boost (Lower number is higher priority)
    // Note: logic in python was: if amount > 50000 and base_p > 0: base_p -= 1
    if (amount > 50000 && baseP > 0) {
        baseP -= 1;
    }

    const priorityMap: { [key: number]: 'L0' | 'L1' | 'L2' | 'L3' } = {
        0: 'L0',
        1: 'L1',
        2: 'L2',
        3: 'L3',
    };

    return priorityMap[baseP];
}

/**
 * Determine the next best action based on Stage and Priority.
 */
export function determineAction(stage: string, priority: string): string {
    let action = 'Standard Review';

    if (priority === 'L0') {
        action = 'URGENT: Manual Intervention Required (SLA Breach Risk)';
    } else if (stage.includes('Stage 5')) {
        action = 'Reconciliation Check: Verify with Beneficiary Bank';
    } else if (stage.includes('Stage 3')) {
        action = 'Customer Action: Send SMS/Email Reminder for Info';
    } else if (stage.includes('Stage 4')) {
        action = 'Monitor: Verify Reversal Status';
    }

    return action;
}
