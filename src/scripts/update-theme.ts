#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPayload } from '../utilities/getPayload';
import { FontFamily, TenantData } from '../utilities/types';

interface ThemeAnswers {
  tenant: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: FontFamily;
  preview: boolean;
}

program
  .name('update-theme')
  .description('Update tenant theme settings')
  .option('-t, --tenant <tenant>', 'Tenant domain or ID')
  .option('-p, --primary <color>', 'Primary color (hex)')
  .option('-s, --secondary <color>', 'Secondary color (hex)')
  .option('-f, --font <family>', 'Font family')
  .option('--preview', 'Preview changes before applying')
  .parse(process.argv);

const validateHexColor = (color: string) => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color) || 'Please enter a valid hex color (e.g., #FF0000)';
};

async function promptUser(): Promise<ThemeAnswers> {
  const opts = program.opts();
  let answers: Partial<ThemeAnswers> = {
    tenant: opts.tenant,
    primaryColor: opts.primary,
    secondaryColor: opts.secondary,
    fontFamily: opts.font as FontFamily,
    preview: opts.preview ?? true,
  };

  // Initialize payload early to get tenant list
  const spinner = ora('Initializing CMS...').start();
  const payload = await getPayload();
  spinner.succeed('CMS initialized');

  // Get list of tenants
  const tenants = await payload.find({
    collection: 'tenants',
    limit: 100,
  });

  const tenantChoices = tenants.docs.map((tenant: TenantData) => ({
    name: `${tenant.name} (${tenant.domain})`,
    value: tenant.id as string,
  }));

  if (!answers.tenant) {
    const tenantAnswer = await inquirer.prompt<{ tenant: string }>({
      type: 'list',
      name: 'tenant',
      message: 'Select tenant:',
      choices: tenantChoices,
    });
    answers.tenant = tenantAnswer.tenant;
  }

  // Get current theme for defaults
  const currentTenant = await payload.findByID({
    collection: 'tenants',
    id: answers.tenant,
  });

  if (!answers.primaryColor) {
    const primaryAnswer = await inquirer.prompt<{ primaryColor: string }>({
      type: 'input',
      name: 'primaryColor',
      message: 'Enter primary color (hex):',
      default: currentTenant.theme?.primaryColor || '#000000',
      validate: validateHexColor,
    });
    answers.primaryColor = primaryAnswer.primaryColor;
  }

  if (!answers.secondaryColor) {
    const secondaryAnswer = await inquirer.prompt<{ secondaryColor: string }>({
      type: 'input',
      name: 'secondaryColor',
      message: 'Enter secondary color (hex):',
      default: currentTenant.theme?.secondaryColor || '#FFFFFF',
      validate: validateHexColor,
    });
    answers.secondaryColor = secondaryAnswer.secondaryColor;
  }

  if (!answers.fontFamily) {
    const fontAnswer = await inquirer.prompt<{ fontFamily: FontFamily }>({
      type: 'list',
      name: 'fontFamily',
      message: 'Select font family:',
      choices: [
        { name: 'Inter', value: 'inter' },
        { name: 'Montserrat', value: 'montserrat' },
        { name: 'Roboto', value: 'roboto' },
        { name: 'Open Sans', value: 'open-sans' },
      ],
      default: currentTenant.theme?.fontFamily || 'inter',
    });
    answers.fontFamily = fontAnswer.fontFamily;
  }

  if (answers.preview === undefined) {
    const previewAnswer = await inquirer.prompt<{ preview: boolean }>({
      type: 'confirm',
      name: 'preview',
      message: 'Preview changes before applying?',
      default: true,
    });
    answers.preview = previewAnswer.preview;
  }

  await payload.shutdown();
  return answers as ThemeAnswers;
}

async function generatePreview(theme: Partial<ThemeAnswers>): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: ${theme.fontFamily}, system-ui, sans-serif;
    }
    .preview {
      max-width: 800px;
      margin: 0 auto;
    }
    .color-block {
      padding: 20px;
      margin: 10px 0;
      color: white;
      border-radius: 8px;
    }
    .primary {
      background-color: ${theme.primaryColor};
    }
    .secondary {
      background-color: ${theme.secondaryColor};
      color: ${theme.primaryColor};
    }
    .text-sample {
      margin: 20px 0;
    }
    h1, h2, h3 {
      color: ${theme.primaryColor};
    }
    p {
      color: #333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: ${theme.primaryColor};
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 5px;
    }
    .button.secondary {
      background-color: ${theme.secondaryColor};
      color: ${theme.primaryColor};
    }
  </style>
</head>
<body>
  <div class="preview">
    <h1>Theme Preview</h1>
    <div class="color-block primary">
      Primary Color: ${theme.primaryColor}
    </div>
    <div class="color-block secondary">
      Secondary Color: ${theme.secondaryColor}
    </div>
    <div class="text-sample">
      <h2>Typography Sample</h2>
      <p>Font Family: ${theme.fontFamily}</p>
      <h3>Heading Example</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <a href="#" class="button">Primary Button</a>
      <a href="#" class="button secondary">Secondary Button</a>
    </div>
  </div>
</body>
</html>`;
}

const run = async () => {
  try {
    const spinner = ora();
    
    // Get answers from command line or prompt
    const answers = await promptUser();

    // Start payload
    spinner.start('Initializing CMS...');
    const payload = await getPayload();
    spinner.succeed('CMS initialized');

    // Preview changes if requested
    if (answers.preview) {
      spinner.start('Generating preview...');
      const preview = await generatePreview(answers);
      
      // Write preview to temporary file
      const previewPath = './theme-preview.html';
      await payload.fs.write({
        path: previewPath,
        data: preview,
      });

      spinner.succeed('Preview generated');
      console.log('\nPreview file created at:', chalk.cyan(previewPath));
      console.log('Open the file in your browser to preview the theme');

      const confirmAnswer = await inquirer.prompt<{ confirm: boolean }>({
        type: 'confirm',
        name: 'confirm',
        message: 'Apply these changes?',
        default: true,
      });

      if (!confirmAnswer.confirm) {
        console.log(chalk.yellow('\nChanges cancelled'));
        await payload.shutdown();
        process.exit(0);
      }
    }

    // Update tenant theme
    spinner.start('Updating theme...');
    const updatedTenant = await payload.update({
      collection: 'tenants',
      id: answers.tenant,
      data: {
        theme: {
          primaryColor: answers.primaryColor,
          secondaryColor: answers.secondaryColor,
          fontFamily: answers.fontFamily,
        },
      },
    });
    spinner.succeed('Theme updated');

    console.log('\n' + chalk.green('✓') + ' Theme updated successfully!');
    console.log('\nTheme Details:');
    console.log(chalk.blue('Tenant:'), updatedTenant.name, `(${updatedTenant.domain})`);
    console.log(chalk.blue('Primary Color:'), answers.primaryColor);
    console.log(chalk.blue('Secondary Color:'), answers.secondaryColor);
    console.log(chalk.blue('Font Family:'), answers.fontFamily);

    await payload.shutdown();
  } catch (error) {
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
