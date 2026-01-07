# 📋 Variable Reference - Copy Paste Guide

Ye page aapke liye easy reference hai. Template me variable use karo, Excel me corresponding column header dalo. Bas!

---

## 🔗 Quick Mapping Table

| Template Variable (Copy करो)     | Excel Column Header (यही नाम Excel में रखो) | Example Value               |
| -------------------------------- | ------------------------------------------- | --------------------------- |
| `{{First Name}}`                 | First Name                                  | John                        |
| `{{Company Name}}`               | Client Business Name                        | TechStart Inc               |
| `{{Website}}`                    | Website                                     | techstart.com               |
| `{{Client Traffic}}`             | Client Traffic                              | 15000                       |
| `{{Competitor Business Name 1}}` | Competitor Name                             | CompetitorA Corp            |
| `{{Competitor Website 1}}`       | Competitor Website                          | competitora.com             |
| `{{Competitor Traffic 1}}`       | Competitor Traffic                          | 25000                       |
| `{{Competitor Business Name 2}}` | Competitor Name 2                           | CompetitorB Ltd             |
| `{{Competitor Website 2}}`       | Competitor Website 2                        | competitorb.com             |
| `{{Competitor Traffic 2}}`       | Competitor Traffic 2                        | 18000                       |
| `{{Client Screenshot}}`          | Client Screenshot URL                       | https://i.imgur.com/abc.png |
| `{{Competitor Screenshot}}`      | Competitor Screenshot URL                   | https://i.imgur.com/xyz.png |
| `{{Calendar Link}}`              | Calendar Link                               | https://calendly.com/...    |
| `{{Email}}`                      | Email                                       | john@techstart.com          |

---

## 📊 Excel Headers (Copy करके Excel में Paste करो)

```
First Name,Client Business Name,Website,Client Traffic,Competitor Name,Competitor Traffic,Competitor Website,Competitor Name 2,Competitor Traffic 2,Competitor Website 2,Calendar Link,Client Screenshot URL,Competitor Screenshot URL,Email
```

---

## ✍️ Template Example (Copy करो)

```
Subject: Boost {{Company Name}}'s Traffic Beyond {{Competitor Business Name 1}}

Hi {{First Name}},

I noticed that {{Company Name}} ({{Website}}) currently has {{Client Traffic}} monthly visitors, while your competitor {{Competitor Business Name 1}} ({{Competitor Website 1}}) is getting {{Competitor Traffic 1}} visits.

{{Client Screenshot}}

And here's what {{Competitor Business Name 1}} is doing:

{{Competitor Screenshot}}

I'd love to show you how we can help {{Company Name}} capture more market share.

Best regards
```

---

## 📝 Excel Row Example (एक Sample Row)

| Column                    | Value                           |
| ------------------------- | ------------------------------- |
| First Name                | John                            |
| Client Business Name      | TechStart Inc                   |
| Website                   | techstart.com                   |
| Client Traffic            | 15000                           |
| Competitor Name           | CompetitorA Corp                |
| Competitor Traffic        | 25000                           |
| Competitor Website        | competitora.com                 |
| Competitor Name 2         | CompetitorB Ltd                 |
| Competitor Traffic 2      | 18000                           |
| Competitor Website 2      | competitorb.com                 |
| Calendar Link             | https://calendly.com/john/30min |
| Client Screenshot URL     | https://i.imgur.com/sample1.png |
| Competitor Screenshot URL | https://i.imgur.com/comp1.png   |
| Email                     | john@techstart.com              |

---

## ⚡ Quick Tips

1. **Excel column headers EXACT match होने चाहिए** - ऊपर जो नाम दिए हैं वही use करो
2. **Screenshot URLs** - Imgur, Gyazo, या direct image link डालो
3. **Competitor 2 optional है** - अगर नहीं है तो blank छोड़ दो
4. **Template में `{{` और `}}` जरूरी है** - बिना इनके variable काम नहीं करेगा

---

## 🎯 Alternative Variable Names (ये भी काम करेंगे)

| Instead of this...               | You can also use...                            |
| -------------------------------- | ---------------------------------------------- |
| `{{Company Name}}`               | `{{Client Business Name}}`                     |
| `{{Competitor Business Name 1}}` | `{{Competitor Name}}`                          |
| `{{Competitor Traffic 1}}`       | `{{Competitor Traffic}}`                       |
| `{{Competitor Website 1}}`       | `{{Competitor Website}}`                       |
| `{{Client Screenshot}}`          | `{{Client Screenshot URL}}` या `{{Client SS}}` |
| `{{Competitor Screenshot}}`      | `{{Competitor Screenshot URL}}`                |

---

_Last Updated: January 2026_
