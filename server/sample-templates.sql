-- Sample Email Templates for Database
-- Run these INSERT statements to add the templates to your email_templates table

-- Template 1: Traffic Comparison Outreach
INSERT INTO email_templates (name, subject, body, created_at) VALUES (
  'Traffic Comparison Outreach',
  'Boost {{Company Name}}\'s Traffic Beyond {{Competitor Business Name 1}}',
  'Hi {{First Name}},

I noticed that {{Company Name}} ({{Website}}) currently has {{Client Traffic}} monthly visitors, while your competitor {{Competitor Business Name 1}} ({{Competitor Website 1}}) is getting {{Competitor Traffic 1}} visits.

I specialize in helping businesses like yours increase their online visibility and outrank competitors. Here\'s what I found about your website:

{{Client Screenshot}}

And here\'s what {{Competitor Business Name 1}} is doing:

{{Competitor Screenshot}}

I\'d love to show you how we can help {{Company Name}} capture more market share and increase your traffic. Would you be interested in a quick 15-minute call to discuss strategies?

Best regards',
  NOW()
);

-- Template 2: Multi-Competitor Analysis
INSERT INTO email_templates (name, subject, body, created_at) VALUES (
  'Multi-Competitor Analysis',
  '{{Company Name}} vs Your Top 2 Competitors - Traffic Analysis',
  'Hello {{First Name}},

I\'ve analyzed {{Website}} and noticed you\'re competing in a challenging space:

**Your Current Position:**
- {{Company Name}}: {{Client Traffic}} monthly visitors

**Competitor Analysis:**
- {{Competitor Business Name 1}} ({{Competitor Website 1}}): {{Competitor Traffic 1}} visitors
- {{Competitor Business Name 2}} ({{Competitor Website 2}}): {{Competitor Traffic 2}} visitors

Take a look at your site\'s performance:
{{Client Screenshot}}

And here\'s what your competitors are achieving:
{{Competitor Screenshot}}

I\'ve helped similar businesses increase their traffic by 150-300% within 6 months. Let\'s discuss how we can get {{Company Name}} ahead of the competition.

Would you be available for a brief call this week?

Best regards',
  NOW()
);

-- Template 3: Simple Direct Outreach
INSERT INTO email_templates (name, subject, body, created_at) VALUES (
  'Simple Direct Outreach',
  'Quick Question About {{Website}}',
  'Hi {{First Name}},

I was analyzing {{Company Name}} and noticed you\'re currently at {{Client Traffic}} monthly visitors, while {{Competitor Business Name 1}} is getting {{Competitor Traffic 1}}.

I specialize in SEO and digital growth strategies. Here\'s a snapshot of your current site:

{{Client Screenshot}}

I have some ideas that could help you close this gap. Would you be open to a 10-minute conversation?

Thanks,',
  NOW()
);

-- Template 4: Detailed Opportunity
INSERT INTO email_templates (name, subject, body, created_at) VALUES (
  'Detailed Opportunity Analysis',
  '{{Company Name}}: Untapped Growth Opportunity Analysis',
  'Dear {{First Name}},

I conducted a competitive analysis of {{Website}} and discovered significant growth opportunities:

**Current Metrics:**
- Your Traffic: {{Client Traffic}}/month
- {{Competitor Business Name 1}}: {{Competitor Traffic 1}}/month ({{Competitor Website 1}})
- {{Competitor Business Name 2}}: {{Competitor Traffic 2}}/month ({{Competitor Website 2}})

**Visual Analysis:**

Your current position:
{{Client Screenshot}}

Market leaders:
{{Competitor Screenshot}}

The gap between {{Company Name}} and your competitors represents a clear opportunity. I\'ve developed strategies that have helped similar companies increase their organic traffic by 200%+ within 12 months.

I\'d love to share specific tactics that could work for {{Company Name}}. Are you available for a brief strategy call?

Looking forward to connecting,',
  NOW()
);
