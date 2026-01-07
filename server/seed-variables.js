import sequelize from './src/config/sequelize.js';
import TemplateVariable from './src/models/templateVariable.js';

async function seedVariables() {
  try {
    console.log('Seeding template variables...');

    const variables = [
      { variableName: 'First Name', variableKey: 'firstName', variableType: 'text', description: 'First name of the recipient' },
      { variableName: 'Client Business Name', variableKey: 'clientBusinessName', variableType: 'text', description: 'Name of the client business' },
      { variableName: 'Company Name', variableKey: 'clientBusinessName', variableType: 'text', description: 'Name of the client business (legacy)' },
      { variableName: 'Website', variableKey: 'website', variableType: 'text', description: 'Client website URL' },
      { variableName: 'Client Website', variableKey: 'website', variableType: 'text', description: 'Client website URL (legacy)' },
      { variableName: 'Client Traffic', variableKey: 'clientTraffic', variableType: 'text', description: 'Monthly traffic of the client' },
      { variableName: 'Competitor Name', variableKey: 'competitorName', variableType: 'text', description: 'Name of the competitor' },
      { variableName: 'Competitor Business Name 1', variableKey: 'competitorName', variableType: 'text', description: 'Primary competitor business name' },
      { variableName: 'Competitor Traffic', variableKey: 'competitorTraffic', variableType: 'text', description: 'Traffic of the competitor' },
      { variableName: 'Competitor Traffic 1', variableKey: 'competitorTraffic', variableType: 'text', description: 'Primary competitor traffic' },
      { variableName: 'Competitor Website', variableKey: 'competitorWebsite', variableType: 'text', description: 'Competitor website URL' },
      { variableName: 'Competitor Website 1', variableKey: 'competitorWebsite', variableType: 'text', description: 'Primary competitor website' },
      { variableName: 'Competitor Name 2', variableKey: 'competitorName2', variableType: 'text', description: 'Second competitor name' },
      { variableName: 'Competitor Business Name 2', variableKey: 'competitorName2', variableType: 'text', description: 'Second competitor business name' },
      { variableName: 'Competitor Traffic 2', variableKey: 'competitorTraffic2', variableType: 'text', description: 'Second competitor traffic' },
      { variableName: 'Competitor Website 2', variableKey: 'competitorWebsite2', variableType: 'text', description: 'Second competitor website' },
      { variableName: 'Calendar Link', variableKey: 'calendarLink', variableType: 'link', description: 'Calendar booking link (clickable)' },
      { variableName: 'Client Screenshot URL', variableKey: 'clientScreenshotUrl', variableType: 'image', description: 'URL of client screenshot' },
      { variableName: 'Client Screenshot', variableKey: 'clientScreenshotUrl', variableType: 'image', description: 'URL of client screenshot (legacy)' },
      { variableName: 'Client SS', variableKey: 'clientScreenshotUrl', variableType: 'image', description: 'URL of client screenshot (short)' },
      { variableName: 'Competitor Screenshot URL', variableKey: 'competitorScreenshotUrl', variableType: 'image', description: 'URL of competitor screenshot' },
      { variableName: 'Competitor Screenshot', variableKey: 'competitorScreenshotUrl', variableType: 'image', description: 'URL of competitor screenshot (legacy)' },
      { variableName: 'Sending Account Name', variableKey: 'sendingAccountName', variableType: 'text', description: 'Email account sending the email' },
      { variableName: 'Email', variableKey: 'sendingAccountName', variableType: 'text', description: 'Recipient email address' },
    ];

    for (const v of variables) {
      const existing = await TemplateVariable.findOne({
        where: { variableKey: v.variableKey }
      });

      if (existing) {
        // Update the existing variable's type if needed
        if (existing.variableName === v.variableName) {
          await existing.update({ variableType: v.variableType, description: v.description });
          console.log(`✓ Updated: ${v.variableName} -> type: ${v.variableType}`);
        } else {
          // For legacy variables, check if we need to update the type
          await existing.update({ variableType: v.variableType });
          console.log(`✓ Updated type for variableKey: ${v.variableKey} -> type: ${v.variableType}`);
        }
      } else {
        await TemplateVariable.create(v);
        console.log(`✓ Created: ${v.variableName} (${v.variableType})`);
      }
    }

    console.log('\n✓ Template variables seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seedVariables();
