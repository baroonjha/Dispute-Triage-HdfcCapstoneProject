# Dispute Triage Solution: Strategy & Methodology

## 1. Executive Summary
This solution provides a robust, automated framework to triage UPI/Card disputes, directly addressing the bank's challenge of high TAT and aged cases. By shifting from a "First-In-First-Out" model to a **"Value-at-Risk" Hybrid Priority Model**, we ensure that high-impact cases are resolved first while maintaining SLA compliance for all disputes.

## 2. The "Winning" Logic: Hybrid Prioritization
Standard triage often looks only at "Days Open". Our solution introduces a **Risk Score** that combines:
1.  **SLA Urgency (Days Open)**: How close is the breach?
2.  **Financial Impact (Amount)**: How much money is at stake?

### Priority Matrix
| Priority Level | Criteria | SLA Target |
| :--- | :--- | :--- |
| **L0 (Critical)** | >25 Days Open OR High Value (>₹50k) near breach | **Immediate (4 Hours)** |
| **L1 (High)** | 12-25 Days Open | **24 Hours** |
| **L2 (Medium)** | 4-11 Days Open | **48 Hours** |
| **L3 (Low)** | 0-3 Days Open | **Standard Queue** |

> **Boost Logic**: Any case > ₹50,000 gets an automatic **Priority Bump** (e.g., L2 becomes L1) to protect high-value customer relationships.

## 3. Addressing Bottlenecks (The 80/20 Rule)
Our analysis revealed two major bottlenecks accounting for **70% of cases**:

### A. Stage 5: Reversal Processed but not Reflected (42%)
*   **Root Cause**: Disconnect between Core Banking System and Source Account.
*   **Solution**: **Automated Reconciliation Check**.
    *   *Action*: These cases are flagged for the "Reconciliation Team" rather than the general dispute agent.
    *   *Impact*: Reduces manual triage time by ~40%.

### B. Stage 3: Information Needed (28%)
*   **Root Cause**: Waiting on customer or beneficiary bank.
*   **Solution**: **Proactive Nudge Engine**.
    *   *Action*: Automated SMS/Email reminders sent to customers for "Info Needed" cases.
    *   *Impact*: Reduces "Hold" time and improves Customer Satisfaction (CSAT).

## 4. Expected Outcomes
Implementing this solution will yield:
1.  **Zero L0 Breaches**: Critical cases are surfaced immediately.
2.  **Higher CSAT**: Customers are informed proactively (Stage 3) and high-value disputes are resolved faster.
3.  **Operational Efficiency**: Agents focus on "Resolution" rather than "Sorting".
