# Requirements - Deal Details Page Fix

## Goal
Ensure the Deal Details Page in the Deals Dashboard displays correct and proper data for both real deals and converted leads (which are represented as "virtual deals" with IDs starting from 1,000,000).

## Problem Statement
The `DealDetailsPage.js` component attempts to fetch deal details using `dealsAPI.getById(dealId)`.
Currently, the backend (`entities-routes.js`) does not implement `GET /api/deals/:id`.
Furthermore, the `GET /api/deals` list endpoint returns both:
1.  Real deals from the `deals` table.
2.  Leads from the `leads` table as "Converted Leads" with an `id` that is `lead.id + 1,000,000`.

When a user clicks on one of these virtual deals, the frontend requests `/api/deals/1000010` (for example), which results in a 404 error because the backend route is missing and doesn't know how to handle IDs > 1,000,000.

## Functional Requirements
1.  **Backend: Implement `GET /api/deals/:id`**
    -   If `:id < 1,000,000`: Fetch the deal from the `deals` table. Join with `companies`, `contacts`, `users` (assignee), and `service_categories` to provide "proper data".
    -   If `:id >= 1,000,000`: Calculate the original lead ID (`id - 1,000,000`). Fetch the lead from the `leads` table and map it to a deal-like structure (similar to how `GET /api/deals` does it).
    -   Return a 404 error if the deal or lead is not found.
2.  **Frontend: Update `DealDetailsPage.js`**
    -   Ensure the component handles the data structure returned by the backend.
    -   Ensure it can display information from both real deals and converted leads seamlessly.
    -   Verify that it correctly fetches related contacts and companies using the existing logic (which it already tries to do, but it needs valid data from the deal).

## Non-Functional Requirements
-   Maintain consistency with existing API patterns (using `pool.query` or `db.query`).
-   Error handling for missing data.

## Verification
-   Successfully navigate to a real deal details page.
-   Successfully navigate to a "Converted Lead" deal details page (ID > 1,000,000).
-   No 404 errors in the console.
-   Proper data (deal name, value, stage, etc.) is displayed on the page.
