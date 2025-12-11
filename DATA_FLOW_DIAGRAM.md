# Data Flow Diagram - Deals & Probability

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      API /api/deals                                 │
│                                                                     │
│  Returns: { id, pipeline, status, deal_value, contact_id, ... }   │
│            pipeline="Inpipeline"                                    │
│            status="Pending"                                         │
│            deal_value=45000                                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│            CrmDealsPage.js - Data Fetch (useEffect)                 │
│                                                                     │
│  1. Fetch deals from API                                            │
│  2. For each deal:                                                  │
│     stage = deal.pipeline || deal.deal_stage || 'Unclassified'     │
│     probability = getProbabilityFromPipeline(stage, status)        │
│                                                                     │
│  3. Format for display                                              │
│  4. Calculate stage stats                                           │
│                                                                     │
│  Result:                                                            │
│  - stageStats = [{ stage, leads, value }, ...]                     │
│  - deals = [{ stage, progress, company, ... }, ...]                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Probability Calculation                          │
│                                                                     │
│  getProbabilityFromPipeline(pipeline, status):                     │
│                                                                     │
│  IF status === "Won"        → return 100                           │
│  ELSE IF status === "Lost"  → return 0                             │
│  ELSE:                                                              │
│    SWITCH (pipeline):                                              │
│      "New"             → 10                                         │
│      "Discovery"       → 20                                         │
│      "Conversation"    → 15                                         │
│      "Qualified To Buy"→ 40                                         │
│      "Proposal Sent"   → 60                                         │
│      "Negotiation"     → 80                                         │
│      "Inpipeline"      → 30  ◄─── Our example returns 30           │
│      "Follow Up"       → 50                                         │
│      default           → 10                                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Kanban Board Display                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Inpipeline        Discovery       Negotiation             │  │
│  │  8 Deals - $261K   6 Deals - $146K  ...                    │  │
│  │                                                             │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                │  │
│  │  │ Deal Card        │  │ Deal Card        │                │  │
│  │  │                  │  │                  │                │  │
│  │  │ 💰 $45,000       │  │ 💰 $32,000       │                │  │
│  │  │ ✉️ real@email.com│  │ ✉️ real@email.com│                │  │
│  │  │ 📞 +1 234-567890 │  │ 📞 +1 234-567890 │                │  │
│  │  │                  │  │                  │                │  │
│  │  │ John Doe         │  │ Jane Smith       │                │  │
│  │  │ 30% ◄─────────┐  │  │ 20% ◄─────────┐  │                │  │
│  │  │               │  │  │               │  │                │  │
│  │  └──────────────────┘  └──────────────────┘                │  │
│  │         ▲                       ▲                           │  │
│  │         │ Calculated from       │ Calculated from          │  │
│  │         │ pipeline="Inpipeline" │ pipeline="Discovery"     │  │
│  │         │ status="Pending"      │ status="Pending"         │  │
│  │         └───────────┬───────────┘                           │  │
│  │                     │                                       │  │
│  │              getProbabilityFromPipeline()                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## CREATE Deal Flow

```
User Submits Form
└─ pipeline="Inpipeline", status="Pending", value=$45,000
                │
                ▼
handleCreateDeal()
│
├─ 1. Send to API POST /api/deals
│
├─ 2. Calculate Probability
│     getProbabilityFromPipeline("Inpipeline", "Pending")
│     → Returns 30%
│
├─ 3. Create newDeal object
│     { id, stage: "Inpipeline", progress: 30, value: 45000, ... }
│
├─ 4. Update deals state
│     setDeals(prev => [newDeal, ...prev])
│
└─ 5. Update stats
    const existingStage = stageStats.find(s => s.stage === "Inpipeline")
    │
    ├─ IF exists:
    │  setStageStats(prev => prev.map(stat =>
    │    stat.stage === "Inpipeline"
    │      ? { ...stat, leads: 8+1=9, value: 261173+45000=306173 }
    │      : stat
    │  ))
    │
    └─ IF not exists:
       setStageStats(prev => [...prev, 
         { stage: "Inpipeline", leads: 1, value: 45000 }
       ])
```

---

## UPDATE Deal (Stage Change) Flow

```
User Changes Pipeline: Inpipeline → Negotiation
└─ Old Value: $45,000, New Value: $50,000
                │
                ▼
handleUpdateDeal()
│
├─ 1. Send to API PUT /api/deals/:id
│
├─ 2. Calculate New Probability
│     getProbabilityFromPipeline("Negotiation", "Pending")
│     → Returns 80%
│
├─ 3. Update deal object
│     { ...deal, stage: "Negotiation", progress: 80, value: 50000 }
│
├─ 4. Update deals state
│     setDeals(prev => prev.map(d => 
│       d.id === deal.id ? updatedDeal : d
│     ))
│
└─ 5. Update stats (STAGE CHANGED)
    oldStage="Inpipeline", newStage="Negotiation"
    │
    setStageStats(prev => prev.map(stat => {
      let newStat = { ...stat }
      │
      ├─ IF stat.stage === "Inpipeline":
      │  newStat.leads = 9 - 1 = 8
      │  newStat.value = 306173 - 45000 = 261173
      │
      ├─ IF stat.stage === "Negotiation":
      │  newStat.leads = 3 + 1 = 4
      │  newStat.value = 150000 + 50000 = 200000
      │
      └─ RETURN newStat
    }))
```

---

## UPDATE Deal (Status Change) Flow

```
User Changes Status: Pending → Won
└─ Pipeline: "Proposal Sent" (unchanged)
                │
                ▼
handleUpdateDeal()
│
├─ 1. Send to API PUT /api/deals/:id
│
├─ 2. Calculate New Probability
│     getProbabilityFromPipeline("Proposal Sent", "Won")
│     → Status "Won" overrides!
│     → Returns 100%
│
├─ 3. Update deal object
│     { ...deal, stage: "Proposal Sent", progress: 100, status: "Won" }
│
├─ 4. Update deals state
│     setDeals(prev => prev.map(d => 
│       d.id === deal.id ? updatedDeal : d
│     ))
│
└─ 5. Update stats (SAME STAGE)
    oldStage="Proposal Sent", newStage="Proposal Sent" (same!)
    │
    setStageStats(prev => prev.map(stat =>
      stat.stage === "Proposal Sent"
        ? { ...stat, value: stat.value - oldValue + newValue }
        : stat
    ))
    
    Result: Only value changes, lead count stays same
```

---

## Key Principles

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  PIPELINE   = Deal's current stage in sales flow   │
│             (where deal is: Inpipeline, Discovery)│
│                                                     │
│  STATUS     = Deal outcome (Won, Lost, Pending)   │
│             (WIN/LOSS status, not pipeline stage) │
│                                                     │
│  PROBABILITY = Likelihood of winning              │
│              = Based on PIPELINE (unless Won/Lost)│
│              = STATUS overrides all else          │
│                                                     │
│  STATS      = Aggregated data per pipeline stage  │
│            leads count + total value            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Example Scenarios

### Scenario 1: Complete Lifecycle
```
1. CREATE: Inpipeline, Pending, $45k
   → probability=30%, stats: Inpipeline +1 lead, +$45k

2. UPDATE: Move to Negotiation
   → probability=80%, stats: Inpipeline -1 lead, -$45k, Negotiation +1 lead, +$45k

3. UPDATE: Mark Won
   → probability=100%, stats: Negotiation unchanged (same stage)

4. DELETE or Archive
   → stats: Negotiation -1 lead, -$45k
```

### Scenario 2: High-Value Deal
```
1. CREATE: Qualified To Buy, Pending, $500k
   → probability=40%, stats: QB +1 lead, +$500k

2. UPDATE: Proposal Sent
   → probability=60%, stats: QB -1, Proposal +1

3. UPDATE: Negotiation
   → probability=80%, stats: Proposal -1, Negotiation +1

4. UPDATE: Won
   → probability=100%, stats: Negotiation unchanged
```

---

## State Management

```
useState Hooks:
├─ deals[] ◄──── All deals with stage, progress, value
├─ stageStats[] ◄──── Aggregated data per stage
├─ companies[] ◄──── Lookup for deal creation
├─ contacts[] ◄──── Lookup for deal creation
└─ projects[] ◄──── Lookup for deal conversion

When deals[] changes → stageStats[] auto-recalculates
When stageStats[] changes → UI updates pipeline columns
```

---

## Performance Notes
- Probability calculation: O(1) - Direct lookup
- Stage stats update: O(n) - Linear scan of stageStats
- Deal creation: O(1) + O(n) stats - Fast
- Deal update: O(n) deals + O(n) stats - Linear but fast
- Total: Optimized for typical deal count (< 1000)
