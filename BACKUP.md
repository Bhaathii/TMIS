# TMIS Data Backup & Recovery Guide

## Overview
TMIS has a comprehensive backup and recovery system to protect your data from loss.

---

## 🔄 Backup Layers

### 1. **Firebase Automatic Backups** (Managed by Google)
- ✅ **Automatic daily backups** - Firebase automatically creates daily snapshots
- ✅ **30-day retention** - Google keeps 30 days of backup history
- ✅ **Geographic redundancy** - Stored across multiple Google data centers
- ✅ **No configuration needed** - Automatic and included in free tier
- **Location**: Google Cloud Storage
- **Recovery Time**: 24-48 hours (contact Firebase support)

### 2. **Manual/On-Demand Backups** (Via App)
- Click **💾 Backup** button on dashboard
- Download complete JSON backup file
- Store on local computer, USB drive, or cloud storage
- Can be downloaded anytime
- Includes: Headers, Layers, Processes, Slittings

### 3. **Git Repository Backup** (GitHub)
- Code is version controlled on GitHub
- Data snapshots in `.json` format can be committed
- All changes logged with timestamps

---

## 📥 How to Download a Backup

### From Dashboard:
1. Click **💾 Backup** button (top-right corner)
2. View current data statistics
3. Click **📥 Download Backup Now**
4. File will download as: `tmis-backup-YYYY-MM-DD.json`
5. Store in safe location

### Backup File Contents:
```json
{
  "timestamp": "2026-04-02T10:30:00.000Z",
  "version": "1.0",
  "data": {
    "headers": [...],
    "layers": [...],
    "processes": [...],
    "slittings": [...]
  }
}
```

---

## 📊 Backup Statistics

The Backup Modal shows:
- 📋 Number of TMIS Records
- 📑 Total Layers involved
- ⚙️ Total Processes
- ✂️ Total Slittings
- **Total items** in database
- **Backup file size**

Example: 10 KB for typical dataset

---

## 🛡️ Recovery Procedures

### **If Firebase Loses Data:**
1. Contact Firebase support: https://firebase.google.com/support
2. Request point-in-time recovery
3. Specify date/time and affected collections
4. Wait 24-48 hours for restoration

### **If You Have a Downloaded Backup:**
1. Keep the `.json` backup file safe
2. Data can be analyzed, shared, or re-imported if needed
3. Send to team members or store offline

---

## ✅ Backup Best Practices

### **Frequency:**
- Download backup **at least weekly**
- Download after major changes or new records
- Download before making bulk deletions

### **Storage:**
- ✅ Store on **external hard drive**
- ✅ Upload to **Google Drive** or **Dropbox**
- ✅ Email to team lead monthly
- ✅ Keep **multiple copies** (at least 2-3)

### **Location Diversity:**
- Local computer: 1 copy
- Cloud storage (Google Drive): 1 copy
- External USB drive: 1 copy
- Team backup (email): 1 copy

### **Retention Policy:**
- Keep current backups: ♾️ Forever
- Keep weekly backups: 3 months
- Archive monthly backups: 1 year

---

## 🔍 Verifying Backup Integrity

### **Check Backup File:**
1. Open downloaded `.json` file with text editor
2. Verify `timestamp` and `version` fields
3. Check that all data sections are present:
   - `headers`
   - `layers`
   - `processes`
   - `slittings`

### **Quick Validation:**
- Backup file size should be 5-50 KB (typical)
- File should be valid JSON (not corrupted)
- Timestamp should be recent

---

## ⚡ Automated Backup Strategy

### **Recommended Schedule:**
```
Daily:      View dashboard (automatic Firebase backup)
Weekly:     Click Backup button, download & store
Monthly:    Email backup summary to team
Quarterly:  Test restore procedure with copy
```

---

## 🚨 Disaster Recovery Plan

### **Worst Case Scenario:**
If all data is lost due to catastrophic failure:

1. **Immediate Action (< 1 hour)**
   - Check if recent downloaded backup exists
   - Contact Firebase support

2. **Short Term (1-24 hours)**
   - Recover from local backup
   - Restore to fresh Firebase database
   - Verify data integrity

3. **Long Term**
   - Implement stricter backup frequency
   - Add monitoring/alerts
   - Review security

---

## 📋 Backup Checklist

- [ ] Downloaded backup this week
- [ ] Verified backup file integrity
- [ ] Stored in multiple locations
- [ ] Shared with team lead
- [ ] Tested recovery procedure
- [ ] Updated backup schedule

---

## 🔐 Security Considerations

- Backups contain **no passwords**
- Backups contain **no API keys**
- Safe to store in cloud services
- Safe to email to team members
- No sensitive authentication data

---

## 📞 Support

**If data is lost or corrupted:**
1. Check if recent backup exists
2. Contact project administrator
3. Request recovery from Firebase backup
4. Reference timestamp for specific recovery point

**For questions about backups:**
- See this guide
- Contact technical support
- Review Firebase documentation

---

**Last Updated**: April 2, 2026
**Backup System Version**: 1.0
**Firebase Retention**: 30 days automatic
