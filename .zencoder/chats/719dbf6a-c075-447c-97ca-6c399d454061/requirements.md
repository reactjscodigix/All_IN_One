# Product Requirements Document (PRD) - Create Quotation Feature

## 1. Overview
The "Create Quotation" feature allows sales executives to generate, revise, and manage quotations for clients and deals. It includes detailed itemization, pricing calculations (including discounts and taxes), and version tracking.

## 2. User Interface Requirements
Based on the provided design, the form is divided into several sections:

### 2.1 Quotation Info
- **Quotation Number**: Unique identifier (e.g., Q-2026-001). Should be auto-generated but editable.
- **Deal**: A searchable dropdown to link the quotation to an existing Deal. Includes a "View Deal" link.
- **Quotation Date**: Date picker (default: today).
- **Valid Until**: Date picker for expiration.
- **Status**: Dropdown (e.g., Draft, Sent, Revised, Accepted, Declined).
- **Type**: Dropdown (e.g., Draft, Official).

### 2.2 Client & Deal Details
- **Client**: Read-only or auto-populated based on the selected Deal.
- **Contact Person**: Searchable dropdown or text field.
- **Assigned Sales Executive**: User selection with avatar display.
- **Line Items Table**:
    - Columns: Product/Service, Description, Qty (numeric), Rate (numeric), Action (Delete).
    - "Add Item" button to append new rows.
    - Real-time subtotal calculation for the table.

### 2.3 Payment Terms & Notes
- **Payment Terms**: Text area for specifying payment milestones (default: "50% advance payment...").
- **Notes**: Text area for additional internal or external comments.

### 2.4 Pricing Summary (Right Sidebar)
- **Subtotal**: Sum of (Qty * Rate) for all items.
- **Discount**: Input field for flat discount.
- **Tax (10%)**: Calculated as 10% of (Subtotal - Discount).
- **Total**: Final amount (Subtotal - Discount + Tax).

### 2.5 Version History (Right Sidebar)
- Displays a list of previous versions (v1, v2, etc.) with their status, date, and amount.

### 2.6 Revision Details (Right Sidebar)
- **Create Revision Toggle**: Allows enabling/disabling revision mode.
- **Revision Number**: Auto-incremented based on history.
- **Revision Reason**: Selection or text for why the revision is being made.
- **Revision Date**: Read-only or date picker.

### 2.7 Actions (Bottom Bar)
- **Save Draft**: Saves the current state without sending.
- **Send to Client**: Triggers email workflow.
- **Create Revision**: Creates a new version of the quotation.
- **Generate PDF**: Generates a downloadable PDF.

## 3. Functional Requirements
- **Dynamic Data Loading**: Fetch Clients, Deals, Contacts, and Users from the API.
- **Real-time Calculations**: All totals must update immediately when items, quantities, rates, or discounts change.
- **Form Validation**: Ensure a client/deal is selected and at least one item exists before submission.
- **State Management**: Correctly handle "Revised" vs "New" quotation logic.

## 4. Open Questions / Clarifications
- The image shows two "Send to Client" buttons. Should one be "Send for Approval" or something else?
- Should the "Tax" percentage be configurable or is it fixed at 10%?
- Does "Generate PDF" require a backend endpoint or should it be done on the frontend?
- The "Deal" field in the image is a dropdown; the current code uses a read-only input. We should switch to a searchable selection.
