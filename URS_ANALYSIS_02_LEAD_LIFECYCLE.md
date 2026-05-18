# URS ANALYSIS 02 - LEAD LIFECYCLE & STATE MACHINE

## 1. COMPLETE LEAD STATE MACHINE

### 1.1 Lead Stages (5 Primary States)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LEAD STAGE STATE MACHINE                      │
└─────────────────────────────────────────────────────────────────────┘

    [START]
       │
       ▼
┌─────────────┐
│    LEAD     │ ◄──────────────────────────────────┐
│             │                                     │
│ Initial     │                                     │
│ Contact     │                                     │
│ Phase       │                                     │
└──────┬──────┘                                     │
       │                                            │
       │ (7 unsuccessful attempts                   │
       │  with "Not Reachable")                     │
       │                                            │
       ├──────────────────┐                         │
       │                  │                         │
       ▼                  ▼                         │
┌─────────────┐    ┌─────────────┐                 │
│   INVALID   │    │ APPOINTMENT │                 │
│             │    │             │                 │
│ Terminal    │    │ Scheduled   │                 │
│ State       │    │ Meeting     │                 │
└─────────────┘    └──────┬──────┘                 │
                          │                         │
                          │                         │
                          ▼                         │
                   ┌─────────────┐                 │
                   │PRESENTATION │                 │
                   │             │                 │
                   │ Post-       │                 │
                   │ Meeting     │                 │
                   └──────┬──────┘                 │
                          │                         │
                          │                         │
                          ├──────────────┬──────────┤
                          │              │          │
                          ▼              ▼          │
                   ┌─────────────┐  [Dropped]      │
                   │     SEF     │      │           │
                   │             │      │           │
                   │ Enrollment  │      └───────────┘
                   │ Complete    │   (Back to LEAD
                   └─────────────┘    for re-nurture)
                          │
                          ▼
                       [END]
```

---

## 2. LEAD STAGE DEFINITIONS & TRANSITIONS

### 2.1 STAGE: LEAD

**Definition:** Initial stage for all newly captured or active leads pending contact or churn completion.

**Entry Conditions:**
- New lead created (manual or automated)
- Lead reactivated from dropped status
- Callback scheduled
- Churn retry

**Valid Lead Statuses in this Stage:**
```
✓ New Lead
✓ Call back
✓ Customer Hungup
✓ Enquiry only
✓ Interested
✓ Language Barrier
✓ Not contacted
✓ Not interested After Content
✓ Not interested Early Pregnancy
✓ Ringing
```

**Exit Conditions:**
1. **To INVALID:**
   - Call Counter = 7 AND Status = "Not Reachable"
   - Agent marks as Invalid status (see Invalid status list)

2. **To APPOINTMENT:**
   - Agent creates appointment (Personal or Telesales)
   - Status = "Appointment Set"

**Owner:** 
- Default: "Admin" (for dialer pool)
- Changes to specific agent on Language Barrier assignment

**Key Behaviors:**
- Leads in this stage are eligible for dialer calling
- LIFO priority queue applies
- Churn intervals: 3 hours
- Business hours: 10:00 AM - 8:59 PM

---

### 2.2 STAGE: INVALID

**Definition:** Terminal stage for leads that are non-responsive after 7 attempts or marked as irrelevant.

**Entry Conditions:**
1. **Automatic (NR7 Automation):**
   - Call Counter = 7
   - Lead Status = "Not Reachable"
   - System automatically moves to Invalid

2. **Manual (Agent Action):**
   - Agent selects any Invalid status from disposition form

**All Invalid Lead Statuses:**
```
✓ Already Delivered
✓ Blank Calls
✓ Do not call
✓ Duplicate lead
✓ Enrolled with Lifecell already
✓ Enquiry for Diagnostics
✓ Enquiry for HPV
✓ Enquiry for NBS
✓ Enquiry for NIPT/PNS
✓ Enquiry for Ovascore
✓ Enquiry for Sperm banking
✓ Enquiry for STD
✓ Existing Cust Enquiry
✓ Existing Customer
✓ Existing Customer for other product
✓ Invalid number
✓ Irrelevant Enquiry
✓ Lifecell Employee
✓ Not interested
✓ Not interested - Upfront
✓ Not Pregnant
✓ Not reachable after 7 attempts
✓ Not Right Party Contact
✓ Rechurn for Marketing
✓ Transferred to CS Team
✓ Wrong number
```

**Exit Conditions:**
- **NONE** - This is a terminal state
- No churn/repeat calls
- No dialer push
- Admin can manually change stage if needed

**Key Behaviors:**
- Excluded from dialer queue
- Excluded from active lead reports
- Retained for historical analysis
- Can be exported for marketing rechurn (specific statuses)

---

### 2.3 STAGE: APPOINTMENT

**Definition:** Stage where an agent has scheduled a presentation for themselves (Telesales) or a field representative (Sales/Personal).

**Entry Conditions:**
- Agent completes appointment creation form
- Appointment ID generated in Stemcell
- Lead Status = "Appointment Set"

**Appointment Types:**

#### **A. Personal (Sales) Appointment**
```
Flow:
1. Agent selects "Sales" → "Personal"
2. Selects State → City → Hospital → Doctor
3. System maps to RE based on location
4. RE availability checked
5. If RE unavailable → Assign to Manager
6. Appointment date/time selected
7. Stemcell Appointment ID generated
8. Owner changes to creating agent
```

#### **B. Telesales Appointment**
```
Flow:
1. Agent selects "Telesales" → "Telephonic/Video"
2. Selects Preferred Language
3. Appointment date/time selected
4. System checks agent's leave calendar
5. If available → Assign to same agent
6. Owner changes to creating agent
7. Task created with reminder
```

**Exit Conditions:**
1. **To PRESENTATION:**
   - Agent updates presentation status
   - Presentation form submitted

2. **Back to LEAD (Admin only):**
   - Admin manually changes stage
   - Appointment cancelled

**Key Fields Captured:**
```
- Appointment ID (from Stemcell)
- Original Appointment Date
- Current Appointment Date
- Appointment Created Date
- Appointment Set By
- Consultation Type (Personal/Telephonic/Video)
- Assigned RE / RE Available
- Owner (changed to creating agent)
```

**Key Behaviors:**
- Task created automatically
- Email reminder 15 minutes before appointment
- Agent cannot modify appointment fields post-creation
- Only Admin can change lead stage from Appointment
- Appointment ID must be unique
- System prevents duplicate appointment creation

---

### 2.4 STAGE: PRESENTATION

**Definition:** Post-presentation stage where agent updates outcomes after explaining services to customer.

**Entry Conditions:**
- Agent opens presentation status form
- Appointment exists for the lead

**Presentation Outcomes:**

#### **A. Presentation Done**

**Sales Status Options:**

**1. Follow-up Call**
```
Sub-Dispositions:
- Follow up - Cold
- Follow up - Warm
- Unable to contact
- Will enroll after 1 week
- Will enroll after 2 weeks
- Will enroll after 3 weeks
- RE not connected the customer
- Personal PPT required from RE
- Only Whatsapp communication
- RE Duplicated
- In Touch With RE
- Connected on WhatsApp
- In Discussion / Not Yet Decided
- We'll Call Upfront

Actions:
- Follow-up date/time captured
- Push to Sales: Yes/No
- If Yes → Hospital/Doctor selection
- If Yes → Confirm Enrollment/Followup
- If Yes → Data pushed to Stemcell RE
- If No → Stays with Telesales agent
```

**2. Enrolled**
```
Actions:
- Sales Push Type = "Enrollment"
- Plan Type selected (ASF/OTP/LTP/Lifecell Gold)
- Hospital/Doctor selection
- Confirm Enrollment → Yes
- Data pushed to Stemcell
- RE assigned for enrollment processing

Next Stage: SEF (when RE completes enrollment)
```

**3. Dropped**
```
Dropped Reasons:
- Already Delivered
- Cost too high
- Demand for Higher Discount
- Doctor not recommended
- Enrolled with Competitor
- Unable to establish contact
- Customer cancelled online consultation
- Concept
- Already Enrolled with Lifecell
- Never asked for Appointment
- Registered for free gifts
- Wants Free stemcells cover
- Non serviceable area
- Already preserved for 1st Baby
- Not Decision maker/Third Party
- High collection charges
- Not comfortable with self collection
- No symptoms so not required
- Referral lead created
- Duplicate done

Actions:
- Dropped reason captured
- Lead can be pushed back to LEAD stage for re-nurture
- Or marked as terminal
```

#### **B. Presentation Not Done**

**Sales Status Options:**
```
1. Unable to Contact
2. Rescheduled
3. Missed by client
4. Cancelled by client
5. Missed by RE
6. Dropped

For statuses 1-5:
- Follow-up date/time captured
- Sales Push Type (Follow-up/Enrollment)
- Plan Type selected
- Lead stays in Presentation stage

For Dropped:
- Dropped reason captured
- Same as "Presentation Done → Dropped"
```

**Exit Conditions:**
1. **To SEF:**
   - Sales Status = "Enrolled"
   - RE completes enrollment in Stemcell
   - Stemcell sends SEF data to CRM

2. **Back to LEAD:**
   - Dropped with re-nurture flag
   - Admin manual change

**Key Behaviors:**
- Multiple presentation status updates allowed
- Each update creates activity log
- Bi-directional sync with Stemcell
- RE updates in Stemcell reflected in CRM
- Follow-up tasks created automatically

---

### 2.5 STAGE: SEF (Enrollment)

**Definition:** Final enrollment stage triggered by Stemcell when customer completes enrollment process.

**Entry Conditions:**
- RE completes enrollment in Stemcell app
- Stemcell sends SEF data via webhook/API
- Sales Status = "Enrolled"

**Data Captured from Stemcell:**
```
- SEF Date
- Customer CRM Number
- Plan Details (ASF/OTP/LTP/Lifecell Gold)
- Branch Code
- RE Name
- RE Code
- Centre
- Lead Hospital
- Overall Status = "SEF"
```

**Exit Conditions:**
- **NONE** - This is a terminal success state

**Key Behaviors:**
- Counted in conversion metrics
- Included in SEF reports
- Revenue attribution to source/medium
- Agent performance metrics updated
- Commission calculations triggered

---

## 3. LEAD STATUS DEFINITIONS (40+ Dispositions)

### 3.1 Status Categories

#### **Category A: Active/Valid Statuses (Lead Stage)**
```
1. New Lead - Initial status on creation
2. Call back - Customer requested callback
3. Customer Hungup - Call connected but customer disconnected
4. Enquiry only - General inquiry, needs nurturing
5. Interested - Expressed interest, needs follow-up
6. Language Barrier - Needs language-specific agent
7. Not contacted - Dialer attempted but no connection
8. Not interested After Content - Rejected after explanation
9. Not interested Early Pregnancy - Too early in pregnancy
10. Ringing - Phone ringing but not answered
```

#### **Category B: Invalid Statuses (Invalid Stage)**
```
11. Already Delivered - Customer already delivered baby
12. Blank Calls - No response on connection
13. Do not call - Customer requested DNC
14. Duplicate lead - Duplicate entry
15. Enrolled with Lifecell already - Existing customer
16. Enquiry for Diagnostics - Different product line
17. Enquiry for HPV - Different product
18. Enquiry for NBS - Different product
19. Enquiry for NIPT/PNS - Different product
20. Enquiry for Ovascore - Different product
21. Enquiry for Sperm banking - Different product
22. Enquiry for STD - Different product
23. Existing Cust Enquiry - Existing customer inquiry
24. Existing Customer - Already a customer
25. Existing Customer for other product - Cross-sell opportunity
26. Invalid number - Wrong/non-working number
27. Irrelevant Enquiry - Not relevant to business
28. Lifecell Employee - Internal employee
29. Not interested - General rejection
30. Not interested - Upfront - Immediate rejection
31. Not Pregnant - Not in target demographic
32. Not reachable after 7 attempts - NR7 automation
33. Not Right Party Contact - Wrong person
34. Rechurn for Marketing - Marketing rechurn candidate
35. Transferred to CS Team - Escalated to customer service
36. Wrong number - Incorrect contact
```

#### **Category C: Appointment Status**
```
37. Appointment set - Appointment created
```

#### **Category D: Presentation Statuses**
```
38. Presentation Done - Presentation completed
39. Presentation Not Done - Presentation not completed
40. Follow-up call - Needs follow-up
41. Dropped - Customer dropped
42. Enrolled - Customer enrolled
```

---

## 4. STATE TRANSITION RULES

### 4.1 Transition Matrix

```
FROM STAGE    │ TO STAGE      │ TRIGGER                          │ VALIDATION
──────────────┼───────────────┼──────────────────────────────────┼─────────────────
LEAD          │ INVALID       │ Call Counter = 7 + Not Reachable │ Automatic (NR7)
LEAD          │ INVALID       │ Agent selects Invalid status     │ Manual
LEAD          │ APPOINTMENT   │ Agent creates appointment        │ Form validation
APPOINTMENT   │ PRESENTATION  │ Agent updates presentation       │ Appointment exists
APPOINTMENT   │ LEAD          │ Admin manual change              │ Admin role only
PRESENTATION  │ SEF           │ Stemcell sends SEF data          │ Enrollment complete
PRESENTATION  │ LEAD          │ Dropped + re-nurture             │ Admin approval
INVALID       │ Any           │ Admin manual override            │ Admin role only
```

### 4.2 Forbidden Transitions

```
❌ LEAD → SEF (must go through Appointment → Presentation)
❌ APPOINTMENT → SEF (must go through Presentation)
❌ INVALID → APPOINTMENT (terminal state)
❌ SEF → Any other stage (terminal success state)
❌ Agent changing stage from APPOINTMENT (Admin only)
```

---

## 5. LEAD STATUS UPDATE FLOWS

### 5.1 Standard Disposition Update

```
1. Agent clicks "Update Status" button
2. Dynamic form loads with current lead data
3. Form shows:
   - Lead Status dropdown (all statuses)
   - Owner (pre-populated, non-editable)
   - Pregnancy EDD (calendar, no backdating)
   - Notes (free text)
4. Agent selects status
5. Form adapts based on status selection
6. Agent fills required fields
7. Agent submits form
8. System validates:
   - Required fields present
   - No backdating
   - Valid status for current stage
9. System updates:
   - Lead status
   - Modified date/time
   - Modified by
10. Activity log created
11. Automation triggered (if applicable)
```

### 5.2 Language Barrier Flow

```
1. Agent selects "Language Barrier" status
2. Form shows additional field:
   - Language Barrier dropdown:
     • Barrier Bengali
     • Barrier Kannada
     • Barrier Malayalam
     • Barrier Telugu
     • Barrier Tamil
     • Barrier Gujrati
3. Agent selects language
4. System triggers automation:
   - Finds agent with matching language skill
   - Changes lead owner to that agent
   - Removes from current agent's queue
   - Adds to new agent's queue
5. Activity log: "Owner changed - Language Barrier"
6. New agent receives notification
```

### 5.3 Callback Flow

```
1. Agent selects "Call back" status
2. Form shows additional fields:
   - Callback Date and Time (calendar + time picker)
   - No backdating allowed
   - Pregnancy EDD
   - Notes
3. Agent selects future date/time
4. System validates:
   - Date is in future
   - Time is within business hours
5. System updates:
   - Lead Status = "Call back"
   - Callback Date/Time field
6. System triggers automation:
   - Creates scheduled job in queue
   - Priority = 2 (Callback priority)
   - Scheduled for exact date/time
7. At scheduled time:
   - Lead pushed to dialer
   - Priority 2 in LIFO queue
8. Activity log created
```

### 5.4 Interested Flow

```
1. Agent selects "Interested" status
2. Form shows additional fields:
   - Callback Date and Time
   - Pregnancy EDD
   - Notes
3. Same flow as Callback
4. Additional automation:
   - Lead score increased
   - Marked as hot lead
   - Higher priority in queue
```

### 5.5 Not Interested - Upfront Flow

```
1. Agent selects "Not interested - Upfront"
2. Form shows additional field:
   - Not interested sub disposition dropdown:
     • Cost too high
     • Enrolled with competitor
     • Not Useful
     • Need more time & Information
     • Others
3. Agent selects sub-disposition
4. System updates:
   - Lead Status = "Not interested - Upfront"
   - Sub-disposition field
   - Lead Stage = "Invalid"
5. Lead removed from dialer queue
6. Activity log created
```

---

## 6. CALL COUNTER LOGIC

### 6.1 Counter Increment Rules

```
Event: Dialer sends call log to CRM

IF call_status IN ['Not Connected', 'Ringing', 'Busy', 'Switched Off', 'Not Reachable']:
    call_counter = call_counter + 1
    
IF call_status = 'Connected':
    call_counter = call_counter + 1
    (Agent will update disposition)

Activity Log: "Outbound Phone Call Activity" created
```

### 6.2 NR7 Automation (Not Reachable after 7 attempts)

```
Trigger: Call log activity added

Conditions:
1. call_counter >= 7
2. lead_status = "Not Reachable" OR all attempts were unsuccessful
3. lead_stage = "Lead"

Actions:
1. Update lead_stage = "Invalid"
2. Update lead_status = "Not reachable after 7 attempts"
3. Remove from dialer queue
4. Create activity log: "Lead stage changed to Invalid - NR7"
5. Update modified_date and modified_by = "System"

Result: Lead no longer eligible for calling
```

---

## 7. OWNER ASSIGNMENT LOGIC

### 7.1 Owner Change Scenarios

```
Scenario 1: Lead Creation
- Owner = "Admin"
- Reason: Centralized pool for dialer

Scenario 2: Language Barrier
- Owner = Language-specific agent
- Reason: Customer needs specific language support

Scenario 3: Appointment Creation
- Owner = Agent who created appointment
- Reason: Accountability and follow-up

Scenario 4: Manual Reassignment (Admin only)
- Owner = Selected agent/RE
- Reason: Load balancing or specific assignment
```

### 7.2 Owner Change Activity Log

```
Every owner change creates activity log:

Log Type: "Owner changed log"
Fields:
- Previous Owner
- New Owner
- Changed By
- Changed Date/Time
- Reason (Language Barrier, Appointment, Manual, etc.)
```

---

## 8. LEAD AGE & LIFECYCLE METRICS

### 8.1 Lead Age Calculation

```typescript
lead_age_days = CURRENT_DATE - lead_created_date

Buckets:
- 0-7 days: Fresh leads
- 8-14 days: Warm leads
- 15-30 days: Aging leads
- 31-60 days: Old leads
- 60+ days: Stale leads
```

### 8.2 Stage Duration Tracking

```
Implicit Requirement: Track time spent in each stage

lead_stage_duration = stage_exit_time - stage_entry_time

Metrics:
- Average time in Lead stage
- Average time in Appointment stage
- Average time in Presentation stage
- Lead to Appointment conversion time
- Appointment to SEF conversion time
```

---

## 9. VALIDATION RULES BY STAGE

### 9.1 LEAD Stage Validations

```
✓ Call counter must be >= 0
✓ Owner must exist in system
✓ Lead status must be valid for Lead stage
✓ Pregnancy EDD cannot be backdated
✓ Phone number required
✓ Source and Medium required
✓ Cannot create appointment if already exists
```

### 9.2 APPOINTMENT Stage Validations

```
✓ Appointment ID must exist
✓ Appointment date cannot be backdated
✓ RE must be available (for Personal appointments)
✓ Agent must be available (for Telesales appointments)
✓ Hospital/Doctor combination must be valid
✓ Cannot create duplicate appointment
✓ Only Admin can modify appointment fields
✓ Only Admin can change stage back to Lead
```

### 9.3 PRESENTATION Stage Validations

```
✓ Appointment must exist
✓ Presentation date cannot be backdated
✓ Sales status must be valid
✓ If Enrolled: Plan type required
✓ If Follow-up: Follow-up date required
✓ If Dropped: Dropped reason required
✓ Hospital/Doctor required for Sales push
```

### 9.4 INVALID Stage Validations

```
✓ Cannot be moved to Appointment (unless Admin override)
✓ Cannot be pushed to dialer
✓ Status must be from Invalid status list
```

---

## 10. IMPLICIT REQUIREMENTS

### 10.1 Concurrency Control

```
Requirement: Prevent race conditions during status updates

Implementation:
- Optimistic locking (version field)
- Row-level locking during update
- Transaction isolation level: READ COMMITTED
- Retry logic for concurrent updates
```

### 10.2 Audit Trail

```
Requirement: Complete audit trail of all changes

Track:
- Who changed what field
- When it was changed
- Old value → New value
- IP address of user
- User agent
```

### 10.3 Data Retention

```
Requirement: Retain historical data

- Keep all activity logs indefinitely
- Archive old leads (2+ years) to separate table
- Maintain referential integrity
- Enable historical reporting
```

---

**Next Document:** [URS_ANALYSIS_03_DIALER_INTEGRATION.md](./URS_ANALYSIS_03_DIALER_INTEGRATION.md)
