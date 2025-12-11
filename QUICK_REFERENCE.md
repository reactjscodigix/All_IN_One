# Quick Reference - Pipeline & Probability Fix

## What Was Fixed

### ❌ BEFORE
- Pipeline stages randomly assigned
- Probability always 10% or hardcoded
- Stats never updated on create/update
- Template data showing instead of real contact info

### ✅ AFTER  
- Pipeline correctly from `deal.pipeline` field
- Probability maps: Status (Won/Lost) → 100%/0%, else Pipeline → 10%-80%
- Stats auto-update on every create/update
- Real contact data displayed

---

## Probability Rules

```
IF status = "Won"       → 100%
ELSE IF status = "Lost" → 0%
ELSE IF pipeline:
  "New"             → 10%
  "Discovery"       → 20%
  "Conversation"    → 15%
  "Qualified To Buy"→ 40%
  "Proposal Sent"   → 60%
  "Negotiation"     → 80%
  "Inpipeline"      → 30%
  "Follow Up"       → 50%
ELSE                  → 10% (default)
```

---

## Stats Auto-Update Logic

### CREATE Deal
```
1. Get dealStage from formData.pipeline
2. Lookup stageStats for this stage
3. If exists: leads++, value += dealValue
4. If not exists: create new with leads=1, value=dealValue
```

### UPDATE Deal (Stage Change)
```
1. Get oldStage, newStage
2. If oldStage ≠ newStage:
   - oldStage: leads--, value -= oldValue
   - newStage: leads++, value += newValue
3. Else (same stage):
   - oldStage: value = value - oldValue + newValue
```

### UPDATE Deal (Status Change)
```
1. Recalculate probability = getProbabilityFromPipeline(stage, newStatus)
2. Update deal.progress = newProbability
3. Keep stage stats same (no movement)
```

---

## Code Locations

| Location | Change |
|---|---|
| `CrmDealsPage.js` line 64-85 | Add getProbabilityFromPipeline() |
| `CrmDealsPage.js` line 89 | Calculate probability on fetch |
| `CrmDealsPage.js` line 219-300 | Handle create with stats update |
| `CrmDealsPage.js` line 355-423 | Handle update with probability & stats |

---

## Testing Scenarios

### Scenario 1: Create Deal at Inpipeline
```
Input:  pipeline="Inpipeline", status="Pending", value=$45,000
Output: probability=30%, Inpipeline stats updated
```

### Scenario 2: Move Deal from Inpipeline to Negotiation  
```
Input:  oldStage="Inpipeline", newStage="Negotiation", value=$45,000
Output: probability=80%, stats: -1 from Inpipeline, +1 to Negotiation
```

### Scenario 3: Mark Deal as Won
```
Input:  status="Won", pipeline="Proposal Sent"
Output: probability=100%, stats unchanged
```

### Scenario 4: Update Deal Value (Same Stage)
```
Input:  oldValue=$45,000, newValue=$50,000, stage="Negotiation"
Output: Negotiation value changes by $5,000, lead count unchanged
```

---

## Verification Checklist

- [ ] Deal cards show real contact email, not "contact@example.com"
- [ ] Deal cards show real phone, not "+1 (555) 000-0000"
- [ ] Deal probability matches pipeline stage from reference table
- [ ] Create new deal → Pipeline column count increases
- [ ] Update deal stage → Count decreases from old, increases in new
- [ ] Mark deal Won → Probability becomes 100%
- [ ] Mark deal Lost → Probability becomes 0%
- [ ] Refresh page → All data persists correctly

---

## Related Documentation
- `FINAL_SUMMARY.md` - Complete explanation
- `IMPLEMENTATION_VERIFIED.md` - Code verification
- `PIPELINE_PROBABILITY_FIX.md` - Detailed technical guide
