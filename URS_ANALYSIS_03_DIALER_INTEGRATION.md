# URS ANALYSIS 03 - DIALER INTEGRATION & CALL MANAGEMENT

## 1. DIALER INTEGRATION OVERVIEW

### 1.1 Integration Purpose
Bi-directional integration between CRM and external dialer system for automated outbound calling and inbound call capture with complete call lifecycle management.

### 1.2 Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIALER INTEGRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

CRM                          DIALER                    SERVICE PROVIDER
 │                              │                              │
 │──── Push Lead (API) ────────▶│                              │
 │    Priority + Lead Data      │                              │
 │                              │                              │
 │                              │──── Dial Number ────────────▶│
 │                              │                              │
 │                              │◀─── Provider Status ─────────│
 │                              │   (Ringing/Busy/etc.)        │
 │                              │                              │
 │◀─── Call Log (Webhook) ──────│                              │
 │    Status + Recording        │                              │
 │                              │                              │
 │──── Agent Disposition ───────▶│                              │
 │    (After connected call)    │                              │
 │                              │                              │
```

---

## 2. LIFO PRIORITY QUEUE SYSTEM

### 2.1 Priority Levels

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRIORITY QUEUE STRUCTURE                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Priority 0 (HIGHEST) - NEW LEADS                                │
│  ├─ Lead Status: "New Lead"                                      │
│  ├─ Dial Time: Within 1 minute of creation                       │
│  ├─ Business Hours: Immediate                                    │
│  └─ Non-Business Hours: Queue for next morning 10:00 AM          │
│                                                                   │
│  Priority 1 - ABANDONED CALLS                                    │
│  ├─ Leads received in non-business hours                         │
│  ├─ Inbound calls missed/abandoned                               │
│  ├─ Digital inbound non-ops hours                                │
│  └─ Dial Time: Next morning 10:00 AM                             │
│                                                                   │
│  Priority 2 - CALLBACKS                                          │
│  ├─ Lead Status: "Call back" or "Interested"                     │
│  ├─ Scheduled date/time set by agent                             │
│  ├─ Dial Time: Exact scheduled date/time                         │
│  └─ LSQ (Lead Scheduled Queue) date/time field                   │
│                                                                   │
│  Priority 3 (LOWEST) - CHURN                                     │
│  ├─ Lead Status: "Not contacted", "Ringing"                      │
│  ├─ Service Provider Codes: Busy, Switched Off, etc.             │
│  ├─ Churn Interval: 3 hours                                      │
│  └─ Max Attempts: 7 (then move to Invalid)                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

LIFO Logic: Within same priority, Last-In-First-Out
Example: If 3 leads in Priority 0, dial order: Lead 3 → Lead 2 → Lead 1
```

### 2.2 Queue Management Algorithm

```typescript
interface QueueEntry {
  leadId: string;
  priority: 0 | 1 | 2 | 3;
  queuedAt: Date;
  scheduledFor?: Date; // For Priority 2 (Callbacks)
  callCounter: number;
  lastAttemptAt?: Date;
}

class DialerQueue {
  
  // Add lead to queue
  enqueue(lead: Lead): void {
    const priority = this.calculatePriority(lead);
    const entry: QueueEntry = {
      leadId: lead.id,
      priority,
      queuedAt: new Date(),
      scheduledFor: lead.callbackDateTime,
      callCounter: lead.callCounter,
      lastAttemptAt: lead.lastCallAttempt
    };
    
    // Insert based on priority and LIFO
    this.insertLIFO(entry);
  }
  
  // Calculate priority
  calculatePriority(lead: Lead): 0 | 1 | 2 | 3 {
    // Priority 0: New Leads
    if (lead.leadStatus === 'New Lead' && lead.callCounter === 0) {
      return 0;
    }
    
    // Priority 1: Abandoned Calls
    if (lead.isAbandoned || lead.receivedInNonBusinessHours) {
      return 1;
    }
    
    // Priority 2: Callbacks
    if (lead.callbackDateTime && lead.leadStatus in ['Call back', 'Interested']) {
      return 2;
    }
    
    // Priority 3: Churn
    if (lead.leadStatus in ['Not contacted', 'Ringing'] && lead.callCounter < 7) {
      return 3;
    }
    
    return 3; // Default to churn
  }
  
  // Dequeue next lead (LIFO within priority)
  dequeue(): QueueEntry | null {
    const now = new Date();
    
    // Check Priority 0 first
    const p0 = this.getLatestByPriority(0);
    if (p0 && this.isBusinessHours(now)) return p0;
    
    // Check Priority 1
    const p1 = this.getLatestByPriority(1);
    if (p1 && this.isBusinessHours(now)) return p1;
    
    // Check Priority 2 (scheduled callbacks)
    const p2 = this.getScheduledCallback(now);
    if (p2) return p2;
    
    // Check Priority 3 (churn with 3-hour interval)
    const p3 = this.getChurnLead(now);
    if (p3) return p3;
    
    return null;
  }
  
  // Get latest entry by priority (LIFO)
  getLatestByPriority(priority: number): QueueEntry | null {
    return this.queue
      .filter(e => e.priority === priority)
      .sort((a, b) => b.queuedAt.getTime() - a.queuedAt.getTime())[0] || null;
  }
  
  // Get scheduled callback if time matches
  getScheduledCallback(now: Date): QueueEntry | null {
    return this.queue
      .filter(e => e.priority === 2)
      .filter(e => e.scheduledFor && e.scheduledFor <= now)
      .sort((a, b) => b.queuedAt.getTime() - a.queuedAt.getTime())[0] || null;
  }
  
  // Get churn lead (3-hour interval check)
  getChurnLead(now: Date): QueueEntry | null {
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    
    return this.queue
      .filter(e => e.priority === 3)
      .filter(e => !e.lastAttemptAt || e.lastAttemptAt <= threeHoursAgo)
      .filter(e => e.callCounter < 7)
      .sort((a, b) => b.queuedAt.getTime() - a.queuedAt.getTime())[0] || null;
  }
  
  // Business hours check
  isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 10 && hour < 21; // 10:00 AM - 8:59 PM
  }
}
```

---

## 3. OUTBOUND CALL FLOW

### 3.1 Lead Push to Dialer

**API Endpoint:** `POST /dialer/api/v1/leads/push`

**Request Payload:**
```json
{
  "leadId": "CRM_LEAD_12345",
  "phoneNumber": "+919876543210",
  "alternatePhone": "+919876543211",
  "customerName": "John Doe",
  "priority": 0,
  "leadSource": "Digital - Facebook",
  "leadMedium": "Digital",
  "campaignId": "FB_CAMP_001",
  "ownerId": "admin",
  "metadata": {
    "pregnancyEDD": "2026-08-15",
    "leadCreatedAt": "2026-05-12T10:30:00Z",
    "leadStatus": "New Lead"
  }
}
```

**Response:**
```json
{
  "success": true,
  "dialerLeadId": "DIALER_123456",
  "queuePosition": 1,
  "estimatedDialTime": "2026-05-12T10:31:00Z",
  "message": "Lead queued successfully"
}
```

### 3.2 Dialing Logic

```
1. DIALER RECEIVES LEAD
   ├─ Validates phone number format
   ├─ Checks DND registry (if applicable)
   └─ Adds to internal queue

2. DIALER PICKS LEAD FROM QUEUE
   ├─ Based on priority (0 > 1 > 2 > 3)
   ├─ LIFO within same priority
   └─ Checks business hours

3. DIALER INITIATES CALL
   ├─ Dials primary phone number
   ├─ Waits for connection (30-45 seconds)
   └─ Captures service provider response

4. SERVICE PROVIDER RESPONSES
   ├─ Connected → Route to available agent
   ├─ Ringing → No answer after timeout
   ├─ Busy → Line busy
   ├─ Switched Off → Phone powered off
   ├─ Not Reachable → Out of coverage
   ├─ Invalid Number → Number doesn't exist
   └─ Network Error → Technical issue

5. CALL LOG CREATION
   ├─ Generate unique Call Log ID
   ├─ Capture all call metadata
   ├─ Store recording (if connected)
   └─ Send to CRM via webhook
```

### 3.3 Call Attempt Timing

```
Priority 0 (New Leads):
├─ Business Hours (10 AM - 8:59 PM): Dial within 1 minute
└─ Non-Business Hours: Queue for next day 10:00 AM

Priority 1 (Abandoned):
└─ Dial at 10:00 AM next business day

Priority 2 (Callbacks):
└─ Dial at exact scheduled date/time

Priority 3 (Churn):
├─ First attempt: Immediate (if in business hours)
├─ Subsequent attempts: 3-hour intervals
└─ Max attempts: 7
```

---

## 4. CALL LOG SYNCHRONIZATION

### 4.1 Dialer to CRM Webhook

**Webhook Endpoint:** `POST /crm/api/v1/webhooks/call-log`

**Payload Structure:**
```json
{
  "callLogId": "CALL_LOG_789",
  "leadId": "CRM_LEAD_12345",
  "dialerLeadId": "DIALER_123456",
  "callType": "OUTBOUND",
  "displayNumber": "+911234567890",
  "customerNumber": "+919876543210",
  "callDateTime": "2026-05-12T10:31:15Z",
  "callDuration": 125,
  "callStatus": "CONNECTED",
  "rawCallStatus": "ANSWERED",
  "serviceProviderCode": "200_OK",
  "callRecordingUrl": "https://dialer.com/recordings/call_789.mp3",
  "agentId": "AGENT_001",
  "agentName": "Jane Smith",
  "callOrigin": "AUTO_DIALER",
  "provider": "Genesys",
  "metadata": {
    "ringDuration": 8,
    "talkTime": 117,
    "holdTime": 0,
    "transferCount": 0
  }
}
```

### 4.2 CRM Processing Logic

```typescript
async processCallLog(callLog: CallLogWebhook): Promise<void> {
  
  // 1. Find lead
  const lead = await this.leadRepository.findOne({ id: callLog.leadId });
  if (!lead) throw new Error('Lead not found');
  
  // 2. Increment call counter
  lead.callCounter += 1;
  lead.lastCallAttempt = new Date(callLog.callDateTime);
  
  // 3. Update lead based on call status
  if (callLog.callStatus === 'CONNECTED') {
    // Agent will update disposition manually
    // Just log the call
  } else {
    // Auto-update status based on service provider code
    lead.leadStatus = this.mapServiceCodeToStatus(callLog.serviceProviderCode);
    
    // Check NR7 condition
    if (lead.callCounter >= 7 && lead.leadStatus === 'Not Reachable') {
      lead.leadStage = 'Invalid';
      lead.leadStatus = 'Not reachable after 7 attempts';
      // Trigger NR7 automation
      await this.automationService.triggerNR7(lead);
    } else {
      // Re-queue for churn (Priority 3)
      await this.dialerService.requeueLead(lead, 3);
    }
  }
  
  // 4. Create call log activity
  await this.activityService.createCallLogActivity({
    leadId: lead.id,
    activityType: 'Outbound Phone Call Activity',
    callLogId: callLog.callLogId,
    callDateTime: callLog.callDateTime,
    callDuration: callLog.callDuration,
    callStatus: callLog.callStatus,
    rawCallStatus: callLog.rawCallStatus,
    recordingUrl: callLog.callRecordingUrl,
    agentId: callLog.agentId,
    provider: callLog.provider
  });
  
  // 5. Save lead
  await this.leadRepository.save(lead);
  
  // 6. Emit event for real-time updates
  this.eventEmitter.emit('call.logged', { leadId: lead.id, callLog });
}

// Map service provider codes to lead statuses
mapServiceCodeToStatus(code: string): string {
  const mapping = {
    'RINGING': 'Ringing',
    'BUSY': 'Not contacted',
    'SWITCHED_OFF': 'Not contacted',
    'NOT_REACHABLE': 'Not Reachable',
    'INVALID_NUMBER': 'Invalid number',
    'NETWORK_ERROR': 'Not contacted',
    'NO_ANSWER': 'Ringing'
  };
  return mapping[code] || 'Not contacted';
}
```

---

## 5. INBOUND CALL HANDLING

### 5.1 Inbound Call Sources

```
1. Toll-Free IVR
   ├─ General inquiries
   ├─ Callback requests
   └─ Existing customer support

2. DID Numbers (Direct Inbound Dial)
   ├─ Campaign-specific numbers
   ├─ Source tracking
   └─ Medium identification

3. Digital Inbound
   ├─ Website click-to-call
   ├─ Facebook Messenger call
   └─ Google Ads call extension
```

### 5.2 Inbound Call Flow

```
1. CUSTOMER DIALS NUMBER
   ├─ IVR answers
   ├─ Captures caller ID
   └─ Routes based on number dialed

2. BUSINESS HOURS CHECK
   ├─ If Business Hours (10 AM - 8:59 PM):
   │  ├─ Route to available agent
   │  └─ Create inbound call log
   └─ If Non-Business Hours:
      ├─ Play recorded message
      ├─ Capture as abandoned call
      └─ Queue for outbound next morning (Priority 1)

3. LEAD CREATION/UPDATE
   ├─ Check if phone number exists in CRM
   ├─ If exists: Update last contact
   └─ If new: Create lead with source = "Inbound"

4. CALL LOG TO CRM
   ├─ Send webhook to CRM
   ├─ Include call recording
   └─ Mark as inbound call
```

### 5.3 Inbound Call Webhook

**Payload:**
```json
{
  "callLogId": "INBOUND_CALL_456",
  "callType": "INBOUND",
  "customerNumber": "+919876543210",
  "dialedNumber": "+911234567890",
  "callDateTime": "2026-05-12T14:30:00Z",
  "callDuration": 180,
  "callStatus": "CONNECTED",
  "agentId": "AGENT_002",
  "callRecordingUrl": "https://dialer.com/recordings/inbound_456.mp3",
  "ivr_selection": "1",
  "callOrigin": "INBOUND_TOLLFREE",
  "isBusinessHours": true,
  "metadata": {
    "queueWaitTime": 15,
    "talkTime": 165
  }
}
```

### 5.4 Non-Business Hours Handling

```
1. CALL RECEIVED OUTSIDE 10 AM - 8:59 PM
   ├─ IVR plays recorded message:
   │  "Thank you for calling. Our business hours are 10 AM to 9 PM.
   │   We will call you back tomorrow morning."
   └─ Captures caller ID

2. LEAD CREATION
   ├─ Create lead with:
   │  ├─ Phone Number: Caller ID
   │  ├─ Source: "Digital - Inbound"
   │  ├─ Medium: "Digital"
   │  ├─ Lead Status: "New Lead"
   │  └─ Owner: "Admin"
   └─ Mark as abandoned call

3. QUEUE FOR OUTBOUND
   ├─ Add to dialer queue
   ├─ Priority: 1 (Abandoned)
   └─ Scheduled for: Next day 10:00 AM

4. ACTIVITY LOG
   └─ "Inbound Phone Call Activity - Non-business hours"
```

---

## 6. CALLBACK MECHANISM

### 6.1 Callback Scheduling

```
1. AGENT UPDATES LEAD STATUS TO "CALL BACK"
   ├─ Dynamic form shows:
   │  ├─ Callback Date (calendar, no backdating)
   │  ├─ Callback Time (time picker)
   │  ├─ Pregnancy EDD
   │  └─ Notes
   └─ Agent selects future date/time

2. SYSTEM VALIDATION
   ├─ Date must be in future
   ├─ Time must be within business hours (10 AM - 8:59 PM)
   └─ Cannot be more than 30 days in future (business rule)

3. CRM UPDATES
   ├─ Lead Status = "Call back"
   ├─ Callback Date/Time field updated
   └─ Activity log created

4. PUSH TO DIALER
   ├─ API call to dialer
   ├─ Priority: 2 (Callback)
   ├─ Scheduled for: Exact date/time
   └─ Dialer creates scheduled job

5. AT SCHEDULED TIME
   ├─ Dialer picks lead from Priority 2 queue
   ├─ Dials customer
   └─ Sends call log to CRM
```

### 6.2 Callback API

**Endpoint:** `POST /dialer/api/v1/callbacks/schedule`

**Request:**
```json
{
  "leadId": "CRM_LEAD_12345",
  "dialerLeadId": "DIALER_123456",
  "callbackDateTime": "2026-05-15T15:30:00Z",
  "phoneNumber": "+919876543210",
  "priority": 2,
  "notes": "Customer requested callback after 3 PM"
}
```

**Response:**
```json
{
  "success": true,
  "callbackId": "CALLBACK_789",
  "scheduledFor": "2026-05-15T15:30:00Z",
  "message": "Callback scheduled successfully"
}
```

---

## 7. CHURN ALGORITHM

### 7.1 Churn Logic

```
Definition: Leads that were attempted but not connected, requiring retry

Churn Statuses:
├─ Not contacted
├─ Ringing
├─ Customer Hungup (if no disposition update)
└─ Service provider codes: Busy, Switched Off, etc.

Churn Interval: 3 hours between attempts
Max Attempts: 7
Priority: 3 (Lowest)
```

### 7.2 Churn Processing

```typescript
class ChurnProcessor {
  
  async processChurn(): Promise<void> {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    
    // Find leads eligible for churn
    const churnLeads = await this.leadRepository.find({
      where: {
        leadStage: 'Lead',
        leadStatus: In(['Not contacted', 'Ringing']),
        callCounter: LessThan(7),
        lastCallAttempt: LessThanOrEqual(threeHoursAgo)
      }
    });
    
    for (const lead of churnLeads) {
      // Check business hours
      if (!this.isBusinessHours(now)) {
        // Queue for next morning
        await this.queueForNextMorning(lead);
        continue;
      }
      
      // Push to dialer with Priority 3
      await this.dialerService.pushLead(lead, 3);
      
      // Log activity
      await this.activityService.create({
        leadId: lead.id,
        activityType: 'Automation log',
        description: `Lead re-queued for churn attempt ${lead.callCounter + 1}`,
        timestamp: now
      });
    }
  }
  
  // Run every 30 minutes
  @Cron('*/30 * * * *')
  async churnCronJob(): Promise<void> {
    await this.processChurn();
  }
}
```

### 7.3 Churn Intervals

```
Attempt 1: Immediate (Priority 0 - New Lead)
Attempt 2: +3 hours (Priority 3 - Churn)
Attempt 3: +3 hours (Priority 3 - Churn)
Attempt 4: +3 hours (Priority 3 - Churn)
Attempt 5: +3 hours (Priority 3 - Churn)
Attempt 6: +3 hours (Priority 3 - Churn)
Attempt 7: +3 hours (Priority 3 - Churn)

After Attempt 7 with "Not Reachable":
└─ NR7 Automation triggers
   └─ Lead Stage = "Invalid"
   └─ Lead Status = "Not reachable after 7 attempts"
```

---

## 8. CALL RECORDING MANAGEMENT

### 8.1 Recording Storage

```
1. DIALER STORES RECORDING
   ├─ Format: MP3 or WAV
   ├─ Storage: Dialer's cloud storage
   └─ Retention: As per compliance (typically 90 days)

2. CRM RECEIVES URL
   ├─ Recording URL in call log webhook
   ├─ Store URL in call_logs table
   └─ No local storage of audio files

3. PLAYBACK
   ├─ Agent clicks "Play Recording" in CRM
   ├─ CRM fetches from dialer URL
   ├─ Streams audio to browser
   └─ Logs playback activity

4. COMPLIANCE
   ├─ GDPR/Data protection compliance
   ├─ Customer consent recorded
   ├─ Secure HTTPS URLs
   └─ Access control (role-based)
```

---

## 9. DIALER API SPECIFICATIONS

### 9.1 Push Lead API

```
POST /dialer/api/v1/leads/push
Authorization: Bearer {API_KEY}
Content-Type: application/json

Request Body: (See section 3.1)
Response: (See section 3.1)

Error Responses:
400 Bad Request - Invalid payload
401 Unauthorized - Invalid API key
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Dialer system error
```

### 9.2 Update Lead API

```
PUT /dialer/api/v1/leads/{dialerLeadId}
Authorization: Bearer {API_KEY}
Content-Type: application/json

Request:
{
  "phoneNumber": "+919876543210",
  "priority": 2,
  "metadata": {
    "leadStatus": "Call back",
    "callbackDateTime": "2026-05-15T15:30:00Z"
  }
}

Response:
{
  "success": true,
  "message": "Lead updated successfully"
}
```

### 9.3 Remove Lead from Queue API

```
DELETE /dialer/api/v1/leads/{dialerLeadId}/queue
Authorization: Bearer {API_KEY}

Response:
{
  "success": true,
  "message": "Lead removed from queue"
}

Use Cases:
- Lead marked as Invalid
- Lead moved to Appointment stage
- Agent manually removes from queue
```

---

## 10. FAILURE SCENARIOS & RETRY LOGIC

### 10.1 API Failure Handling

```typescript
class DialerIntegrationService {
  
  async pushLeadWithRetry(lead: Lead, priority: number): Promise<void> {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.dialerApi.pushLead({
          leadId: lead.id,
          phoneNumber: lead.phoneNumber,
          priority,
          // ... other fields
        });
        
        // Success - log and return
        await this.logSuccess(lead.id, 'Lead pushed to dialer');
        return;
        
      } catch (error) {
        if (attempt === maxRetries) {
          // Final attempt failed
          await this.handlePushFailure(lead, error);
          throw error;
        }
        
        // Wait before retry
        await this.sleep(retryDelay * attempt);
      }
    }
  }
  
  async handlePushFailure(lead: Lead, error: any): Promise<void> {
    // 1. Log error
    await this.errorLogRepository.save({
      leadId: lead.id,
      operation: 'DIALER_PUSH',
      error: error.message,
      timestamp: new Date()
    });
    
    // 2. Add to dead letter queue
    await this.deadLetterQueue.add({
      leadId: lead.id,
      operation: 'DIALER_PUSH',
      payload: lead,
      failedAt: new Date()
    });
    
    // 3. Notify admin
    await this.notificationService.notifyAdmin({
      type: 'DIALER_INTEGRATION_FAILURE',
      leadId: lead.id,
      error: error.message
    });
    
    // 4. Update lead with error flag
    lead.dialerPushFailed = true;
    lead.dialerPushError = error.message;
    await this.leadRepository.save(lead);
  }
}
```

### 10.2 Webhook Failure Handling

```
1. DIALER SENDS WEBHOOK TO CRM
   ├─ CRM endpoint unavailable
   └─ Dialer retries with exponential backoff

2. RETRY SCHEDULE
   ├─ Attempt 1: Immediate
   ├─ Attempt 2: +30 seconds
   ├─ Attempt 3: +2 minutes
   ├─ Attempt 4: +10 minutes
   └─ Attempt 5: +30 minutes

3. AFTER 5 FAILED ATTEMPTS
   ├─ Dialer stores in failed webhook queue
   ├─ Admin notification sent
   └─ Manual intervention required

4. CRM RECOVERY
   ├─ CRM comes back online
   ├─ Calls dialer API to fetch missed call logs
   └─ Processes backlog
```

---

## 11. PERFORMANCE & SCALABILITY

### 11.1 Queue Performance

```
Expected Load:
├─ 10,000 leads/day
├─ Peak hours: 10 AM - 12 PM, 2 PM - 5 PM
├─ Concurrent calls: 50-100
└─ Average call duration: 2-3 minutes

Queue Processing:
├─ Redis-based priority queue
├─ Sub-second enqueue/dequeue
├─ Atomic operations
└─ Distributed locking for concurrency
```

### 11.2 Monitoring Metrics

```
Key Metrics:
├─ Queue depth by priority
├─ Average wait time
├─ Call connection rate
├─ API response time
├─ Webhook delivery success rate
├─ Churn effectiveness
└─ NR7 conversion rate

Alerts:
├─ Queue depth > 1000
├─ API failure rate > 5%
├─ Webhook failure rate > 2%
└─ Average wait time > 5 minutes
```

---

**Next Document:** [URS_ANALYSIS_04_AUTOMATION_EVENTS.md](./URS_ANALYSIS_04_AUTOMATION_EVENTS.md)
