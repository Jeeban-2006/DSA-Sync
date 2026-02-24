# Import System Implementation Guide

## Overview

The Import System is a production-ready feature that allows users to bulk import their solved problems from CSV files or the Codeforces API. It includes duplicate detection, validation, sync capabilities, and detailed import history tracking.

## Features

✅ **CSV Import**
- Download CSV template with example data
- Upload and validate CSV files
- Automatic duplicate detection
- Detailed error reporting

✅ **Codeforces API Import**
- Import all accepted submissions
- Automatic difficulty mapping
- Topic inference from tags
- Sync functionality for new submissions

✅ **Import Management**
- Comprehensive import history
- Import statistics dashboard
- Rate limiting (5 CSV imports/hour, 10 Codeforces requests/hour)
- Activity logging

✅ **Data Integrity**
- Server-side processing (secure)
- Duplicate prevention by userId + problemName + platform
- Data validation and sanitization
- Bulk insert optimization

## Architecture

### Database Models

#### 1. Problem Model (Enhanced)
```typescript
{
  // Existing fields...
  imported: boolean,
  importSource: 'CSV' | 'Codeforces' | 'LeetCode',
  externalId: string,          // e.g., "cf-1234-A"
  importBatchId: string,        // UUID for tracking batch
  importedAt: Date,
  originalSolvedDate: Date,     // Original solve date from source
  lastSyncedAt: Date           // Last sync timestamp
}
```

#### 2. ImportHistory Model (New)
```typescript
{
  userId: ObjectId,
  batchId: string,              // Unique batch identifier
  source: 'CSV' | 'Codeforces' | 'LeetCode',
  totalRows: number,
  imported: number,
  duplicatesSkipped: number,
  invalidRows: number,
  errors: [{ row: number, reason: string }],
  metadata: {
    fileName?: string,
    codeforcesHandle?: string
  },
  createdAt: Date
}
```

#### 3. ActivityLog Model (Enhanced)
Added activity types:
- `import_completed` - Initial import
- `import_synced` - Sync operation

## API Endpoints

### 1. Download CSV Template
```
GET /api/import/template
```
Downloads a CSV template with example data.

### 2. Upload CSV Import
```
POST /api/import/csv
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  file: File (.csv)

Response:
{
  "success": true,
  "batchId": "uuid",
  "totalRows": 100,
  "imported": 92,
  "duplicatesSkipped": 6,
  "invalidRows": 2,
  "errors": [
    { "row": 5, "reason": "Invalid difficulty" }
  ]
}
```

**CSV Format:**
```csv
Problem Name,Platform,Difficulty,Topic,Solved Date,Time Taken (Optional),Notes (Optional)
Two Sum,LeetCode,Easy,Array,2024-01-10,15,Used hashmap
```

**Validation Rules:**
- Problem Name: Required, non-empty
- Platform: Required, non-empty
- Difficulty: Must be "Easy", "Medium", or "Hard"
- Topic: Required, non-empty
- Solved Date: Required, format YYYY-MM-DD
- Time Taken: Optional, default 30 minutes
- Notes: Optional, used for approachSummary

**Rate Limit:** 5 imports per hour per user

### 3. Codeforces Import
```
POST /api/import/codeforces
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "handle": "tourist",
  "isSync": false
}

Response:
{
  "success": true,
  "batchId": "uuid",
  "handle": "tourist",
  "totalProblems": 150,
  "imported": 145,
  "duplicatesSkipped": 5,
  "message": "Imported 145 problems from Codeforces"
}
```

**Features:**
- Fetches from Codeforces API: `https://codeforces.com/api/user.status?handle={handle}`
- Filters submissions with verdict "OK"
- Removes duplicate problems (keeps first accepted)
- Maps problem rating to difficulty:
  - < 1200: Easy
  - 1200-1599: Medium
  - ≥ 1600: Hard
- Infers topics from problem tags
- Generates problem links automatically

**Sync Mode (`isSync: true`):**
- Only imports new submissions
- Updates `lastSyncedAt` for existing problems
- Prevents re-importing duplicates

**Rate Limit:** 10 requests per hour per user

### 4. Import History
```
GET /api/import/history?limit=10&skip=0
Authorization: Bearer {token}

Response:
{
  "history": [...],
  "stats": {
    "totalImports": 5,
    "totalProblemsImported": 250,
    "csvImports": 2,
    "codeforcesImports": 3
  },
  "pagination": {
    "total": 5,
    "limit": 10,
    "skip": 0,
    "hasMore": false
  }
}
```

## UI Components

### Import Page (`/import`)

**Location:** `app/import/page.tsx`

**Features:**
1. **Statistics Dashboard**
   - Total imports count
   - Total problems imported
   - Breakdown by source

2. **CSV Import Card**
   - Download template button
   - File upload input
   - Upload & import button
   - Import summary with errors

3. **Codeforces Import Card**
   - Handle input field
   - Import button
   - Sync button
   - Import summary

4. **Import History**
   - Recent import records
   - Source badges
   - Import statistics per batch
   - Metadata (filename, handle)

**Responsive Design:**
- Mobile-optimized layout
- Grid-based responsive design
- Touch-friendly buttons

## Client API Methods

```typescript
// lib/api-client.ts

// Download CSV template
api.downloadTemplate()

// Import CSV file
api.importCSV(file: File)

// Import from Codeforces
api.importFromCodeforces(handle: string, isSync?: boolean)

// Get import history
api.getImportHistory(limit?: number, skip?: number)
```

## Security Features

1. **Authentication Required:** All endpoints require valid JWT token
2. **Rate Limiting:** Prevents abuse (map-based rate limiting)
3. **Server-Side Processing:** All API calls and validations happen server-side
4. **Input Validation:**
   - File type validation (.csv only)
   - Handle format validation (3-24 alphanumeric chars)
   - Date format validation
   - Difficulty enum validation
5. **Error Handling:** Graceful error handling with detailed messages

## Duplicate Detection

Duplicates are identified by:
```
userId + problemName + platform
```

For Codeforces imports, also checks:
```
userId + externalId (e.g., "cf-1234-A")
```

## Activity Logging

Every successful import creates an activity log:
```typescript
{
  userId: ObjectId,
  type: "import_completed" | "import_synced",
  metadata: {
    count: 92,
    source: "CSV" | "Codeforces",
    importBatchId: "uuid",
    handle?: "tourist" // For Codeforces
  }
}
```

## Performance Optimizations

1. **Bulk Insert:** Uses `insertMany()` for efficient database writes
2. **Indexes:** Added indexes on:
   - `userId + problemName + platform`
   - `userId + imported`
   - `importBatchId`
3. **Pagination:** Import history supports pagination
4. **Ordered: false:** Allows partial success on bulk inserts

## Future Enhancements

### Planned Features:
1. **LeetCode Import**
   - Requires API authentication
   - Similar to Codeforces implementation

2. **Automatic Sync**
   - Weekly cron job
   - Sync new submissions automatically

3. **Import Analytics**
   - Graphs showing import trends
   - Platform distribution
   - Time-based analysis

4. **Advanced CSV Features**
   - Multi-file upload
   - Excel (.xlsx) support
   - Preview before import

5. **AI Analysis**
   - Analyze imported problem history
   - Generate insights
   - Recommend topics based on history

## Usage Example

### CSV Import Flow:
1. User navigates to `/import`
2. Downloads CSV template
3. Fills in their solved problems
4. Uploads CSV file
5. System validates and imports
6. User sees detailed summary
7. Problems appear in dashboard

### Codeforces Import Flow:
1. User navigates to `/import`
2. Enters Codeforces handle
3. Clicks "Import from Codeforces"
4. System fetches and imports problems
5. User can later click "Sync" to get new submissions

## Testing

### Manual Testing Checklist:

**CSV Import:**
- [ ] Download template works
- [ ] Upload valid CSV succeeds
- [ ] Invalid difficulty shows error
- [ ] Invalid date format shows error
- [ ] Empty rows are skipped
- [ ] Duplicates are detected
- [ ] Import summary is accurate
- [ ] Activity log is created
- [ ] Problems appear in dashboard

**Codeforces Import:**
- [ ] Valid handle imports successfully
- [ ] Invalid handle shows error
- [ ] Duplicate problems are skipped
- [ ] Difficulty mapping is correct
- [ ] Topic inference works
- [ ] Sync only imports new problems
- [ ] Activity log is created
- [ ] Rate limiting works

**UI/UX:**
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Error messages are clear
- [ ] Import history displays correctly
- [ ] Statistics update after import

## Troubleshooting

### Common Issues:

**CSV Import fails with "Invalid CSV format"**
- Ensure file has headers in first row
- Check for proper comma separation
- Verify no special characters in quotes

**Codeforces import shows "Invalid handle"**
- Check handle spelling
- Ensure handle exists on Codeforces
- Verify handle is 3-24 characters

**Rate limit exceeded**
- Wait 1 hour before trying again
- Rate limits reset after time window

**Import successful but problems not showing**
- Refresh dashboard
- Check import summary for duplicate count
- Verify user is logged in

## File Structure

```
app/
├── import/
│   └── page.tsx                 # Main import UI
├── api/
    ├── import/
        ├── template/
        │   └── route.ts         # CSV template download
        ├── csv/
        │   └── route.ts         # CSV import handler
        ├── codeforces/
        │   └── route.ts         # Codeforces import handler
        └── history/
            └── route.ts         # Import history endpoint

models/
├── Problem.ts                   # Enhanced with import fields
├── ImportHistory.ts             # New model
└── ActivityLog.ts               # Enhanced with import types

lib/
└── api-client.ts                # Enhanced with import methods
```

## API Client Usage

```typescript
import { api } from '@/lib/api-client';

// Download template
api.downloadTemplate();

// Import CSV
const file = document.getElementById('file-input').files[0];
const { data, error } = await api.importCSV(file);

// Import from Codeforces
const { data, error } = await api.importFromCodeforces('tourist');

// Sync Codeforces
const { data, error } = await api.importFromCodeforces('tourist', true);

// Get history
const { data, error } = await api.getImportHistory(10, 0);
```

## Production Deployment

### Environment Variables:
No additional environment variables required.

### Vercel Configuration:
Works out of the box on Vercel with no special configuration.

### Rate Limiting:
Current implementation uses in-memory Map. For production scale, consider:
- Redis for distributed rate limiting
- Database-based rate limiting
- Vercel Edge Config

### Monitoring:
- Track import success/failure rates
- Monitor API response times
- Log error patterns
- Track duplicate rates per source

## Conclusion

The Import System is production-ready and provides a seamless experience for users to onboard their existing problem-solving history. It's secure, scalable, and maintainable with room for future enhancements.
