# URS ANALYSIS 01 - SYSTEM OVERVIEW & END-TO-END FLOW

## 1. COMPLETE END-TO-END PROJECT FLOW

### 1.1 System Purpose
A comprehensive CRM system for managing the complete lifecycle of leads from capture through enrollment in Bio-Bank services (cord blood banking, diagnostics, biologics).

### 1.2 High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LEAD CAPTURE SOURCES                             │
├─────────────────────────────────────────────────────────────────────────┤
│  • Facebook Ads          • Instagram Ads        • Website Forms          │
│  • Google Ads            • Inbound Calls        • Referrals              │
│  • Hospital Partners     • Toll-free IVR        • DID Numbers            │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEAD INGESTION & VALIDATION                           │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Automation Tree Routes Lead                                          │
│  2. Source/Medium ID Mapping                                             │
│  3. Duplicate Check (Phone/Email vs Stemcell DB)                         │
│  4. Lead Creation in CRM                                                 │
│  5. Stemcell Lead Migration (Get Lead ID)                                │
│  6. Owner Assignment (Default: Admin)                                    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DIALER INTEGRATION (OUTBOUND)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  LIFO Priority Queue:                                                    │
│  • Priority 0: New Leads (dial within 1 min)                             │
│  • Priority 1: Abandoned Calls                                           │
│  • Priority 2: Callbacks (scheduled date/time)                           │
│  • Priority 3: Churn (3-hour intervals)                                  │
│                                                                           │
│  Business Hours: 10:00 AM - 8:59 PM                                      │
│  Non-business hours → Queue for next morning                             │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CALL HANDLING & LOGGING                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Dialer → CRM Data Sync:                                                 │
│  • Call Date/Time, Duration, Recording URL                               │
│  • Service Provider Status (Ringing, Busy, Switched Off, etc.)          │
│  • Call Counter Increment                                                │
│  • Raw Call Status                                                       │
│                                                                           │
│  Agent Updates Lead Disposition via Dynamic Form                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEAD STAGE PROGRESSION                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   LEAD   │───▶│ INVALID  │    │  APPOINTMENT │───▶│ PRESENTATION │  │
│  │          │    │          │    │              │    │              │  │
│  │ • New    │    │ • 7 Tries│    │ • Personal   │    │ • Follow-up  │  │
│  │ • Callback│   │ • Wrong# │    │ • Telesales  │    │ • Dropped    │  │
│  │ • Churn  │    │ • DNC    │    │              │    │ • Enrolled   │  │
│  └──────────┘    └──────────┘    └──────────────┘    └──────┬───────┘  │
│                                                               │          │
│                                                               ▼          │
│                                                        ┌──────────────┐  │
│                                                        │     SEF      │  │
│                                                        │              │  │
│                                                        │ • Enrollment │  │
│                                                        │ • Complete   │  │
│                                                        └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEMCELL APP INTEGRATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│  • Appointment Creation → Appointment ID                                 │
│  • RE Assignment & Availability Check                                    │
│  • Hospital/Doctor Database Integration                                  │
│  • Presentation Status Updates (Bi-directional)                          │
│  • SEF (Enrollment) Confirmation                                         │
│  • Customer CRM Number Generation                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MODULE BREAKDOWN & INTERACTIONS

### 2.1 Core Modules

#### **Module 1: Lead Management Module**
**Responsibilities:**
- Lead capture from multiple sources
- Manual lead creation
- Lead field management
- Lead search & filtering
- Bulk operations (upload, update, delete)
- Lead ownership management

**Key Entities:**
- Lead
- LeadSource
- LeadMedium
- LeadHistory
- LeadActivity

**Interactions:**
- → Automation Engine (trigger events)
- → Dialer Module (push leads)
- → Stemcell Integration (sync leads)
- → Validation Module (check duplicates)

---

#### **Module 2: Dialer Integration Module**
**Responsibilities:**
- Outbound call queue management (LIFO)
- Inbound call capture
- Call log synchronization
- Priority management
- Callback scheduling
- Churn algorithm execution

**Key Entities:**
- CallLog
- CallQueue
- CallbackSchedule
- ChurnQueue

**Interactions:**
- ← Lead Management (receive leads)
- → Call Log Service (store logs)
- → Automation Engine (trigger call events)
- ↔ External Dialer API (bi-directional)

---

#### **Module 3: Appointment Management Module**
**Responsibilities:**
- Personal appointment creation
- Telesales appointment creation
- RE availability checking
- Hospital/Doctor mapping
- Appointment rescheduling
- Task creation & reminders

**Key Entities:**
- Appointment
- AppointmentTask
- REAvailability
- HospitalDoctorMapping

**Interactions:**
- ← Lead Management (lead data)
- → Stemcell Integration (create appointment)
- → Task Management (create tasks)
- → Notification Service (send reminders)

---

#### **Module 4: Presentation Management Module**
**Responsibilities:**
- Presentation status updates
- Follow-up scheduling
- Sales push to RE
- Enrollment push
- Dropped reason capture

**Key Entities:**
- Presentation
- PresentationFollowup
- SalesPush

**Interactions:**
- ← Appointment Module (appointment data)
- → Stemcell Integration (push to RE)
- → Automation Engine (trigger events)
- → Lead Management (update stage)

---

#### **Module 5: Stemcell Integration Module**
**Responsibilities:**
- Lead migration to Stemcell
- Duplicate checking
- Appointment ID generation
- RE assignment
- Status synchronization (bi-directional)
- SEF data capture

**Key Entities:**
- StemcellLead
- StemcellAppointment
- StemcellSync
- StemcellWebhook

**Interactions:**
- ↔ Lead Management (sync leads)
- ↔ Appointment Module (sync appointments)
- ↔ Presentation Module (sync status)
- → Activity Log (log updates)

---

#### **Module 6: Automation Engine**
**Responsibilities:**
- Event-driven automation execution
- Trigger management
- Automation sequencing
- Conditional logic execution
- Sub-automation orchestration

**Key Entities:**
- Automation
- AutomationTrigger
- AutomationLog
- EventQueue

**Interactions:**
- ← All Modules (receive events)
- → All Modules (execute actions)
- → Queue Service (manage event queue)

---

#### **Module 7: Validation Module**
**Responsibilities:**
- Duplicate detection
- Field validation
- Business rule validation
- State transition validation
- Permission validation

**Key Entities:**
- ValidationRule
- DuplicateCheck
- ValidationLog

**Interactions:**
- ← All Modules (validation requests)
- → Stemcell Integration (duplicate check)

---

#### **Module 8: User & Role Management Module**
**Responsibilities:**
- User authentication
- Role-based access control
- Permission management
- Leave calendar management
- Login/logout tracking

**Key Entities:**
- User
- Role
- Permission
- UserSession
- LeaveCalendar

**Interactions:**
- → All Modules (authorization)
- → Appointment Module (availability check)

---

#### **Module 9: Reporting & Analytics Module**
**Responsibilities:**
- Real-time dashboard generation
- Report execution
- Data export
- Advanced search
- Performance metrics

**Key Entities:**
- Report
- Dashboard
- ReportSchedule
- ExportLog

**Interactions:**
- ← All Modules (data aggregation)
- ← Dialer Module (call metrics)
- ← Stemcell Integration (conversion data)

---

#### **Module 10: Task & Notification Module**
**Responsibilities:**
- Task creation & management
- Email notifications
- WhatsApp message logging
- Reminder scheduling
- Task status tracking

**Key Entities:**
- Task
- Notification
- NotificationTemplate
- TaskReminder

**Interactions:**
- ← Appointment Module (create tasks)
- ← Presentation Module (follow-up tasks)
- → Email Service (send emails)

---

#### **Module 11: Activity & Audit Module**
**Responsibilities:**
- Activity history logging
- Audit trail maintenance
- Change tracking
- Timeline generation

**Key Entities:**
- ActivityLog
- AuditTrail
- ChangeHistory

**Interactions:**
- ← All Modules (log activities)
- → Reporting Module (activity reports)

---

## 3. COMPLETE SYSTEM SEQUENCE

### 3.1 Lead Capture to First Call (Detailed)

```
1. LEAD CAPTURE EVENT
   ├─ Landing page form submission
   ├─ Automation tree triggered
   ├─ Source/Medium ID extracted
   └─ Lead data captured

2. LEAD VALIDATION
   ├─ Check required fields
   ├─ Duplicate check against Stemcell DB
   │  ├─ Check primary phone
   │  ├─ Check secondary phone
   │  └─ Check email IDs
   └─ If duplicate → Reject or Merge

3. LEAD CREATION IN CRM
   ├─ Generate internal Lead ID
   ├─ Set Owner = "Admin"
   ├─ Set Lead Stage = "Lead"
   ├─ Set Lead Status = "New Lead"
   ├─ Set Call Counter = 0
   └─ Timestamp creation

4. STEMCELL MIGRATION
   ├─ Push lead data to Stemcell API
   ├─ Receive Stemcell Lead ID
   ├─ Update CRM lead with Stemcell ID
   └─ Log activity

5. DIALER PUSH (Priority 0)
   ├─ Check business hours (10 AM - 8:59 PM)
   ├─ If business hours:
   │  ├─ Push to dialer within 1 minute
   │  └─ Set Priority = 0 (New Lead)
   └─ If non-business hours:
      ├─ Queue for next morning
      └─ Set Priority = 1 (Abandoned)

6. CALL INITIATION
   ├─ Dialer picks lead from queue (LIFO)
   ├─ Dials customer number
   └─ Waits for connection

7. CALL OUTCOME HANDLING
   ├─ If Connected:
   │  ├─ Agent conversation
   │  ├─ Agent updates disposition
   │  └─ Call log created
   ├─ If Not Connected:
   │  ├─ Capture service provider code
   │  ├─ Increment call counter
   │  ├─ Apply churn logic
   │  └─ Re-queue with Priority 3

8. CALL LOG SYNC
   ├─ Dialer sends call data to CRM
   ├─ Update call counter
   ├─ Store recording URL
   ├─ Update lead status (if auto-disposition)
   └─ Create activity log entry
```

---

### 3.2 Appointment Creation Flow (Personal)

```
1. AGENT SELECTS "APPOINTMENT SET"
   └─ Dynamic form loads

2. AGENT SELECTS "SALES" → "PERSONAL"
   ├─ Pregnancy EDD captured
   └─ Notes added

3. PAGE 2: HOSPITAL/DOCTOR SELECTION
   ├─ Agent selects State
   ├─ Agent selects City
   ├─ System loads Hospitals (from Stemcell)
   ├─ Agent selects Hospital
   ├─ System loads Doctors for that Hospital
   └─ Agent selects Doctor

4. RE ASSIGNMENT LOGIC
   ├─ System maps State/City/Pincode to RE
   ├─ Check RE availability calendar
   ├─ If RE available:
   │  └─ Assign to RE
   └─ If RE unavailable:
      └─ Assign to RE's Manager

5. APPOINTMENT DATE SELECTION
   ├─ Agent selects date (no backdating)
   ├─ System shows RE's available time slots
   └─ Agent confirms slot

6. STEMCELL APPOINTMENT CREATION
   ├─ Push appointment data to Stemcell API
   ├─ Stemcell generates Appointment ID
   ├─ CRM receives Appointment ID
   └─ Update CRM lead with Appointment ID

7. CRM UPDATES
   ├─ Lead Stage → "Appointment"
   ├─ Lead Status → "Appointment Set"
   ├─ Owner → Agent who created appointment
   ├─ Original Appointment Date → Selected date
   ├─ Current Appointment Date → Selected date
   ├─ Appointment Set By → Agent name
   └─ Consultation Type → "Personal"

8. TASK CREATION
   ├─ Create task with unique Task ID
   ├─ Task Status → "Pending"
   ├─ Schedule email reminder (15 min before)
   └─ Link task to appointment

9. ACTIVITY LOG
   ├─ Log "Appointment Created"
   ├─ Capture all appointment fields
   └─ Timestamp entry

10. FIELD LOCKING
    └─ Agent cannot modify appointment fields
       (Only Admin can change)
```

---

### 3.3 Presentation to SEF Flow

```
1. AGENT OPENS PRESENTATION FORM
   └─ Dynamic form loads

2. AGENT SELECTS "PRESENTATION DONE"
   ├─ Presentation Date auto-populated
   └─ Sales Status dropdown shown

3. IF "ENROLLED" SELECTED
   ├─ Sales Push Type → "Enrollment"
   ├─ Pregnancy EDD pre-populated
   ├─ Plan Type selected (ASF/OTP/LTP/Gold)
   └─ Notes added

4. PAGE 2: HOSPITAL/DOCTOR SELECTION
   ├─ Same as appointment flow
   └─ Confirm Enrollment → "Yes"

5. PUSH TO STEMCELL (ENROLLMENT)
   ├─ Send enrollment data to Stemcell
   ├─ Include Hospital/Doctor details
   ├─ Include Plan Type
   └─ Stemcell assigns to RE

6. RE PROCESSES ENROLLMENT
   ├─ RE meets customer
   ├─ Completes enrollment paperwork
   └─ Updates status in Stemcell app

7. STEMCELL SENDS SEF DATA TO CRM
   ├─ SEF Date
   ├─ Customer CRM Number
   ├─ Plan Details
   ├─ Branch Code
   └─ RE Details

8. CRM UPDATES
   ├─ Lead Stage → "SEF"
   ├─ Sales Status → "Enrolled"
   ├─ Overall Status → "SEF"
   ├─ SEF Date captured
   └─ Customer CRM Number captured

9. ACTIVITY LOG
   ├─ Log "Stemcell Log - SEF"
   ├─ Capture all SEF fields
   └─ Timestamp entry

10. REPORTING UPDATE
    └─ Lead counted in SEF metrics
```

---

## 4. TECHNOLOGY STACK RECOMMENDATIONS

### 4.1 Backend Framework
**Recommended: NestJS (TypeScript)**
- Already in use (based on project structure)
- Modular architecture fits requirements
- Built-in dependency injection
- Excellent for microservices
- Strong typing for complex business logic

### 4.2 Database
**Primary: PostgreSQL**
- ACID compliance for transactions
- JSON support for flexible fields
- Excellent performance for complex queries
- Strong indexing capabilities
- Audit logging support

**Cache: Redis**
- Session management
- Queue management (Bull/BullMQ)
- Real-time data caching
- Pub/Sub for events

### 4.3 Queue System
**Bull/BullMQ with Redis**
- Priority queue support (LIFO)
- Retry mechanisms
- Delayed jobs (callbacks)
- Job scheduling (churn intervals)

### 4.4 Event System
**Event-Driven Architecture**
- NestJS EventEmitter
- Message Queue (RabbitMQ/Kafka for scale)
- Webhook handling
- Async processing

### 4.5 API Integration
**HTTP Client: Axios**
- Retry logic
- Timeout handling
- Request/response interceptors

### 4.6 Real-Time Features
**WebSockets (Socket.io)**
- Real-time dashboard updates
- Live call status
- Notification delivery

### 4.7 Reporting
**Query Builder: TypeORM + Raw SQL**
- Complex aggregations
- Date range queries
- Export to CSV/Excel

### 4.8 Authentication
**JWT + Refresh Tokens**
- Role-based access control
- Session management
- Token rotation

---

## 5. CRITICAL SYSTEM BEHAVIORS

### 5.1 Business Hours Logic
```typescript
// Operational Hours: 10:00 AM - 8:59 PM
const isBusinessHours = (timestamp: Date): boolean => {
  const hour = timestamp.getHours();
  return hour >= 10 && hour < 21; // 10 AM to 8:59 PM
};

// Lead received at 9:30 PM → Queue for next day 10:00 AM
// Lead received at 11:00 AM → Dial within 1 minute
```

### 5.2 LIFO Priority Queue
```
Priority 0 (Highest): New Leads - Dial immediately
Priority 1: Abandoned Calls - Next in queue
Priority 2: Callbacks - Scheduled time-based
Priority 3 (Lowest): Churn - 3-hour interval retry

Within same priority: Last-In-First-Out (LIFO)
```

### 5.3 Call Counter & Invalid Logic
```
Call Counter increments on each attempt
If Call Counter = 7 AND Status = "Not Reachable"
  → Lead Stage = "Invalid"
  → No further churn/calls
```

### 5.4 Owner Assignment Rules
```
Lead Creation: Owner = "Admin"
Appointment Creation: Owner = Agent who created appointment
Language Barrier: Owner = Assigned language-specific agent
```

### 5.5 Duplicate Detection
```
Check against Stemcell DB:
  - Primary Phone Number
  - Secondary Phone Number
  - Primary Email
  - Secondary Email

If match found → Reject or flag as duplicate
```

---

## 6. DATA FLOW SUMMARY

```
┌──────────────┐
│ Landing Page │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ Automation   │────▶│ CRM Database │
│ Tree         │     └──────┬───────┘
└──────────────┘            │
                            ▼
                     ┌──────────────┐
                     │ Stemcell API │◀─┐
                     └──────┬───────┘  │
                            │          │
                            ▼          │
                     ┌──────────────┐  │
                     │ Dialer API   │  │
                     └──────┬───────┘  │
                            │          │
                            ▼          │
                     ┌──────────────┐  │
                     │ Agent Action │  │
                     └──────┬───────┘  │
                            │          │
                            ▼          │
                     ┌──────────────┐  │
                     │ Appointment  │──┘
                     │ Creation     │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Presentation │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │     SEF      │
                     └──────────────┘
```

---

## 7. IMPLICIT REQUIREMENTS IDENTIFIED

### 7.1 Transaction Management
- Appointment creation must be atomic (CRM + Stemcell)
- Rollback on Stemcell API failure
- Idempotency for duplicate API calls

### 7.2 Concurrency Handling
- Prevent double appointment creation
- Lock lead during status update
- Queue-based processing for high volume

### 7.3 Error Recovery
- Retry failed Stemcell API calls
- Dead letter queue for failed automations
- Admin notification on critical failures

### 7.4 Data Consistency
- Bi-directional sync with Stemcell
- Conflict resolution strategy
- Eventual consistency model

### 7.5 Performance Requirements
- Dial within 1 minute (SLA)
- Real-time dashboard updates
- Sub-second search response

### 7.6 Security Requirements
- Encrypt PII data at rest
- Secure API communication (HTTPS)
- Audit all data access
- Role-based field masking

### 7.7 Scalability Considerations
- Horizontal scaling for API servers
- Database read replicas
- Queue-based async processing
- CDN for static assets

---

**Next Document:** [URS_ANALYSIS_02_LEAD_LIFECYCLE.md](./URS_ANALYSIS_02_LEAD_LIFECYCLE.md)
