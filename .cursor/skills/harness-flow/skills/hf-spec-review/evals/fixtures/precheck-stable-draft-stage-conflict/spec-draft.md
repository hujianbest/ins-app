# Approval Workflow Spec

## Background
The system needs an approval workflow for expense claims.

## Scope
- Submit expense claim
- Manager approval/rejection
- Notification of result

## Out of Scope
- BI reporting

## Functional Requirements

### FR-001: Submit Expense Claim
Employees can submit expense claims with amount, category, and description.

**Acceptance Criteria:**
- Claim form validates required fields (amount, category, description)
- Amount must be positive number
- Category must be from predefined list

### FR-002: Manager Approval
Managers can approve or reject pending claims.

**Acceptance Criteria:**
- Manager sees list of pending claims
- Manager can approve or reject with reason
- Claimant receives notification of decision

## Open Issues
(none)
