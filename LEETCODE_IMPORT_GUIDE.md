# LeetCode Import Guide

## Understanding LeetCode Import Limitations

### Why Don't All My Problems Import?

LeetCode's public API has limitations that prevent fetching all solved problems in a single import:

1. **API Restriction**: The public API only returns a limited number of recent submissions (typically 20-50)
2. **No Official Export**: LeetCode doesn't provide an official export feature for all problems
3. **Authentication Required**: Getting complete data requires authentication cookies

### Your Profile Shows 60 Problems, But Only 20 Imported

This is expected behavior due to LeetCode's API limitations. Here's what's happening:

- **LeetCode API**: Returns ~20-50 most recent accepted submissions
- **Your Total**: 60 problems solved over time
- **What's Missing**: Older problems solved before the "recent" submissions window

## Solutions & Workarounds

### ✅ Solution 1: Regular Syncing (Recommended)

The best approach is to import regularly:

1. **Initial Import**: Import your recent submissions (20-50 problems)
2. **Regular Sync**: Use the "Sync New Submissions" button after solving new problems
3. **Gradual Build**: Over time, you'll capture all problems as you continue solving

**Advantages:**
- Automatic and no manual work
- Keeps your tracker up-to-date
- Works reliably with LeetCode's public API

### ✅ Solution 2: Manual CSV Import for Old Problems

For problems that weren't captured in the initial import:

1. **Download Template**: Go to Import page → Download CSV template
2. **Fill in Old Problems**: Manually add problems not captured
3. **Upload CSV**: Import the CSV file

**CSV Template Format:**
```csv
Problem Name,Platform,Problem Link,Difficulty,Topic,Date Solved
Two Sum,LeetCode,https://leetcode.com/problems/two-sum/,Easy,Array,2024-01-15
Add Two Numbers,LeetCode,https://leetcode.com/problems/add-two-numbers/,Medium,Linked List,2024-01-20
```

### ✅ Solution 3: Use Multiple Imports

Try importing multiple times with breaks:

1. **First Import**: Import immediate recent submissions
2. **Wait 5 minutes**: Allow API to reset
3. **Sync Again**: Click "Sync New Submissions"
4. **Repeat**: Continue until most problems are captured

## Dashboard Problem List

### Why Can't I See My Imported Problems?

If you've imported problems but don't see them in your dashboard:

1. **Check Filter**: Make sure you're not filtering by date/status
2. **Refresh Page**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check Status**: Problems are imported with "Solved" status
4. **Verify Import**: Go to Import page → Check Import History section

### Dashboard Display

Imported problems should appear in your dashboard with:
- ✅ Status: Solved
- 📊 Difficulty: As per LeetCode
- 🏷️ Topic: Auto-mapped from LeetCode tags
- 📅 Date: Original solve date from LeetCode
- 🔖 Badge: "Imported from LeetCode"

## Technical Details

### What Data Is Imported?

For each problem, we import:
- **Problem Name**: e.g., "Two Sum"
- **Platform**: LeetCode
- **Difficulty**: Easy, Medium, or Hard
- **Topic**: Auto-detected from LeetCode tags
- **Solve Date**: Original submission timestamp
- **Problem Link**: Direct link to problem
- **Tags**: LeetCode topic tags
- **Metadata**: Import source and batch ID

### Duplicate Prevention

The system prevents importing the same problem twice:
- Uses LeetCode's problem slug as unique identifier
- Skips duplicates automatically
- Shows count in import summary

### Data Accuracy

Imported data is mapped from LeetCode:

| LeetCode Data | DSA Tracker Field |
|---------------|-------------------|
| Title | Problem Name |
| titleSlug | Unique ID |
| Difficulty | Difficulty (Easy/Medium/Hard) |
| Topic Tags | Topic (auto-mapped) |
| Timestamp | Date Solved |

## Troubleshooting

### Issue: "User not found"
- **Cause**: Username doesn't exist or profile is private
- **Solution**: Check username spelling and ensure profile is public

### Issue: "No accepted submissions found"
- **Cause**: No problems solved yet or API returned empty
- **Solution**: Solve at least one problem and try again

### Issue: "Failed to fetch from LeetCode"
- **Cause**: LeetCode API is down or rate limited
- **Solution**: Wait a few minutes and try again

### Issue: "Only 20 problems imported instead of 60"
- **Cause**: API limitation (as explained above)
- **Solution**: Use Solution 1 or 2 above

## Best Practices

### For New Users

1. ✅ Import your recent LeetCode submissions
2. ✅ Manually add any old/favorite problems via CSV
3. ✅ Going forward, sync after every session

### For Regular Use

1. ✅ Sync weekly or after solving 5-10 problems
2. ✅ Keep your dashboard updated
3. ✅ Use the system to track revision and progress

### For Migration

If you're migrating from LeetCode to this tracker:

1. ✅ Accept that old problems may need manual entry (CSV)
2. ✅ Import recent problems via LeetCode sync
3. ✅ Going forward, track everything here
4. ✅ Sync occasionally to capture any problems missed

## Future Enhancements

We're exploring ways to improve LeetCode import:

- 🔄 LeetCode session cookie import (for authenticated access)
- 🔄 Scraping alternative (if permitted)
- 🔄 Integration with LeetCode premium API (if available)
- 🔄 Browser extension for one-click import

## Need Help?

If you're still having issues:

1. Check Import History on the Import page
2. Look at the summary to see what was imported
3. Verify problem counts match expectations
4. Use CSV import as a reliable fallback

---

**Remember**: The goal is to track your progress going forward. Don't worry about capturing every historical problem - focus on using the system consistently for new problems!
