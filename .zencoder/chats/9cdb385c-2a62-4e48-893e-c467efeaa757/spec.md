# Technical Specification - Deal Details Page Fix

## Technical Context
- **Frontend**: React, `lucide-react`, `react-router-dom`, Tailwind CSS.
- **Backend**: Node.js, Express, MySQL (using `mysql2/promise` pool).
- **Existing API Service**: `client/src/services/api.js`.
- **Existing Routes**: `server/routes/entities-routes.js`.

## Implementation Approach

### Backend: `server/routes/entities-routes.js`
We will add a new GET endpoint `app.get('/api/deals/:id', ...)` to handle fetching a single deal or a converted lead.

1.  **ID Parsing**: Parse the `:id` parameter.
2.  **Logic for Real Deals (ID < 1,000,000)**:
    -   Query the `deals` table.
    -   LEFT JOIN with `companies` (c), `contacts` (ct), `users` (u), and `service_categories` (sc).
    -   Select all relevant fields to match the structure expected by the frontend.
3.  **Logic for Converted Leads (ID >= 1,000,000)**:
    -   Calculate `leadId = id - 1,000,000`.
    -   Query the `leads` table.
    -   LEFT JOIN with `companies` (c), `users` (u), and `service_categories` (sc).
    -   Map lead fields to deal fields (e.g., `lead_name` -> `deal_name`, `notes` -> `description`, `value` -> `deal_value`).
    -   Add `record_type = 'Converted Lead'`.
4.  **Error Handling**: Return 404 if not found, 500 on database error.

### Frontend: `client/src/components/DealDetailsPage.js`
The component already uses `dealsAPI.getById(dealId)`. We will ensure the UI handles the returned data correctly.

1.  **Data Consistency**: The backend response should consistently provide `deal_name`, `deal_value`, `status`, `pipeline`, etc., regardless of whether it's a real deal or a lead.
2.  **Related Entities**:
    -   The frontend currently fetches *all* contacts and *all* companies and finds the relevant one in memory.
    -   `fetchDealDetails` in `DealDetailsPage.js` uses `contactsRes.find(...)` and `companiesRes.find(...)`.
    -   We should ensure `dealRes.contact_id` and `dealRes.company_id` are correctly populated by the new backend endpoint.
    -   Note: For "Converted Leads", `contact_id` might be null in the `leads` table if it wasn't converted yet, but the `GET /api/deals` list logic shows `null as contact_id`. We should follow this pattern or improve it if the lead has a `company_id`.

## Source Code Structure Changes
- **Modified**: `server/routes/entities-routes.js` - Add `app.get('/api/deals/:id')`.
- **Modified**: `client/src/components/DealDetailsPage.js` - Minor adjustments if needed for data mapping (e.g., handling `pipeline` vs `stage` vs `lead_status`).

## Data Model / API Changes
- **New Endpoint**: `GET /api/deals/:id`
    -   **Response Object**:
        ```json
        {
          "id": 1,
          "deal_name": "Sample Deal",
          "description": "...",
          "deal_value": 1000,
          "currency": "USD",
          "status": "Open",
          "company_id": 1,
          "contact_id": 1,
          "assignee_id": 1,
          "service_category_id": 1,
          "pipeline": "New",
          "deal_stage": "New",
          "probability": 10,
          "expected_close_date": "2026-03-31",
          "created_at": "...",
          "updated_at": "...",
          "company_name": "Example Corp",
          "contact_first_name": "John",
          "contact_last_name": "Doe",
          "assignee_first_name": "Admin",
          "assignee_last_name": "User",
          "service_name": "SEO",
          "record_type": "Deal"
        }
        ```

## Delivery Phases
1.  **Phase 1: Backend Implementation**
    -   Implement `GET /api/deals/:id` in `server/routes/entities-routes.js`.
    -   Test with both real deal IDs and lead IDs (>= 1,000,000).
2.  **Phase 2: Frontend Verification & Adjustments**
    -   Verify `DealDetailsPage.js` displays the data correctly.
    -   Fix any mapping issues (e.g., if a lead uses `lead_status` while the UI expects `pipeline`).

## Verification Approach
1.  **Backend Manual Test**: Use `curl` or a test script to hit `/api/deals/1` and `/api/deals/1000010`.
2.  **Frontend Manual Test**:
    -   Open the dashboard.
    -   Click on a regular Deal -> check details.
    -   Click on a "Converted Lead" (virtual deal) -> check details.
3.  **Linting**: Run `npm run lint` (if available) to ensure code quality.
