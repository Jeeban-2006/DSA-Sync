# Import Problems - Quick Start Guide

## 🚀 Overview

The Import System allows you to bulk import your solved problems from CSV files or directly from Codeforces. No more manual entry for your existing problem-solving history!

## 📥 CSV Import (3 Easy Steps)

### Step 1: Download Template
1. Go to `/import` page
2. Click **"Download CSV Template"** button
3. Open the downloaded file in Excel, Google Sheets, or any CSV editor

### Step 2: Fill Your Data
The template has these columns:
- **Problem Name** *(Required)* - Name of the problem
- **Platform** *(Required)* - LeetCode, Codeforces, etc.
- **Difficulty** *(Required)* - Easy, Medium, or Hard
- **Topic** *(Required)* - Array, DP, Graph, etc.
- **Solved Date** *(Required)* - Format: YYYY-MM-DD (e.g., 2024-01-15)
- **Time Taken** *(Optional)* - Time in minutes
- **Notes** *(Optional)* - Any notes about your solution

**Example:**
```csv
Two Sum,LeetCode,Easy,Array,2024-01-10,15,Used hashmap approach
Valid Parentheses,LeetCode,Easy,Stack,2024-01-11,20,Stack LIFO property
```

### Step 3: Upload & Import
1. Click **"Upload & Import"** button
2. Select your filled CSV file
3. Wait for validation and import
4. View detailed import summary

### ✅ What Happens:
- ✅ Valid problems are imported
- ⏭️ Duplicates are automatically skipped
- ❌ Invalid rows are reported with reasons
- 📊 You get a detailed summary

## 🔥 Codeforces Import (Even Easier!)

### Option 1: Initial Import
1. Go to `/import` page
2. Enter your Codeforces handle
3. Click **"Import from Codeforces"**
4. Wait while we fetch your submissions
5. Done! All your accepted problems are imported

### Option 2: Sync New Submissions
Already imported once? Just sync:
1. Enter your Codeforces handle
2. Click **"Sync New Submissions"**
3. Only NEW problems are added (no duplicates!)

### ✅ What Gets Imported:
- ✅ All accepted submissions (verdict = OK)
- ✅ Problem names and ratings
- ✅ Automatic difficulty mapping based on rating
- ✅ Topic inference from problem tags
- ✅ Direct problem links

### Difficulty Mapping:
- Rating < 1200 → **Easy**
- Rating 1200-1599 → **Medium**  
- Rating ≥ 1600 → **Hard**

## 📊 View Import History

Your import history is automatically tracked:
- See all past imports
- View statistics per import
- Check CSV filenames or Codeforces handles
- Track total problems imported

## ❓ FAQ

### Q: What if I have duplicates in my CSV?
**A:** Duplicates are automatically detected and skipped. A problem is considered duplicate if it has the same name and platform.

### Q: Can I import from multiple sources?
**A:** Yes! Import from CSV, Codeforces, or any combination. All imports are tracked separately.

### Q: What happens if my CSV has errors?
**A:** Invalid rows are skipped, valid rows are imported. You'll see a detailed error report.

### Q: How often can I import?
**A:**
- CSV: 5 imports per hour
- Codeforces: 10 requests per hour

### Q: Will my manually added problems be affected?
**A:** No! Import only adds new problems. It never modifies or deletes existing ones.

### Q: Can I edit imported problems?
**A:** Yes! Imported problems work exactly like manually added problems.

## 🔒 Security

- ✅ All processing happens on the server (secure)
- ✅ No credentials stored
- ✅ Rate limiting prevents abuse
- ✅ Input validation on all fields

## 💡 Pro Tips

1. **CSV Best Practices:**
   - Use the provided template
   - Keep date format as YYYY-MM-DD
   - Use only Easy/Medium/Hard for difficulty
   - Remove any extra blank rows

2. **Codeforces Tips:**
   - Import once, then use Sync regularly
   - Sync is faster and prevents duplicates
   - Your handle must be public on Codeforces

3. **General Tips:**
   - Check import summary for errors
   - Fix errors in CSV and re-upload
   - Use import history to track your imports

## 🎯 Example Workflow

### Starting Fresh:
1. Download CSV template
2. Export your LeetCode/other platform data
3. Format it to match template
4. Import via CSV
5. For Codeforces: Use Codeforces import

### Regular Usage:
1. Manually add problems as you solve them
2. Once a week, sync Codeforces
3. For other platforms, batch import via CSV

## 🚨 Troubleshooting

### CSV Import Issues:

**"Invalid CSV format"**
- Ensure first row has headers
- Check for proper comma separation

**"Invalid difficulty"**
- Must be exactly: Easy, Medium, or Hard (case-sensitive)

**"Invalid date"**
- Use format: YYYY-MM-DD
- Example: 2024-01-15

**"Problem Name is required"**
- Every row must have a problem name
- No empty names

### Codeforces Import Issues:

**"Invalid Codeforces handle"**
- Check spelling
- Handle must be 3-24 characters
- Only letters, numbers, underscore allowed

**"Failed to fetch"**
- Check internet connection
- Codeforces API might be down
- Try again in a few minutes

**"Rate limit exceeded"**
- Wait 1 hour before trying again
- Rate limits prevent API abuse

## 🎉 Success Indicators

After successful import, you'll see:
- ✅ Green success message
- 📊 Import summary with counts
- 📈 Updated dashboard statistics
- 📜 New entry in import history

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify your data format
3. Check import history for details
4. Try with a smaller batch first

---

Happy Importing! 🚀
