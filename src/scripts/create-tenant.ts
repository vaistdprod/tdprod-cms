#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPayload } from '../utilities/getPayload';
import { createNewTenant } from '../utilities/createNewTenant';
import { TenantType, FontFamily } from '../utilities/types';

interface TenantAnswers {
  name: string;
  domain: string;
  type: TenantType;
  customTheme: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: FontFamily;
  features: string[];
}

program
  .name('create-tenant')
  .description('Create a new tenant in the multi-tenant CMS')
  .option('-n, --name <name>', 'Tenant name')
  .option('-d, --domain <domain>', 'Tenant domain')
  .option('-t, --type <type>', 'Tenant type')
  .parse(process.argv);

const validateDomain = (domain: string) => {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
  return domainRegex.test(domain) || 'Please enter a valid domain name (e.g., example.com)';
};

const validateHexColor = (color: string) => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color) || 'Please enter a valid hex color (e.g., #FF0000)';
};

async function promptUser(): Promise<TenantAnswers> {
  let answers: Partial<TenantAnswers> = {
    name: program.opts().name,
    domain: program.opts().domain,
    type: program.opts().type as TenantType,
  };

  // Basic info
  if (!answers.name) {
    const nameAnswer = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'What is the name of the tenant?',
      validate: (input: string) => input.length >= 2 || 'Name must be at least 2 characters long',
    });
    answers.name = nameAnswer.name;
  }

  if (!answers.domain) {
    const domainAnswer = await inquirer.prompt({
      type: 'input',
      name: 'domain',
      message: 'What is the domain name for the tenant?',
      validate: validateDomain,
    });
    answers.domain = domainAnswer.domain;
  }

  if (!answers.type) {
    const typeAnswer = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'What type of tenant is this?',
      choices: ['healthcare', 'legal', 'education', 'professional', 'non-profit', 'other'] as TenantType[],
    });
    answers.type = typeAnswer.type;
  }

  // Theme customization
  const customThemeAnswer = await inquirer.prompt({
    type: 'confirm',
    name: 'customTheme',
    message: 'Would you like to customize the theme?',
    default: false,
  });
  answers.customTheme = customThemeAnswer.customTheme;

  if (answers.customTheme) {
    const themeAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'primaryColor',
        message: 'Primary color (hex):',
        validate: validateHexColor,
      },
      {
        type: 'input',
        name: 'secondaryColor',
        message: 'Secondary color (hex):',
        validate: validateHexColor,
      },
      {
        type: 'list',
        name: 'fontFamily',
        message: 'Font family:',
        choices: ['inter', 'montserrat', 'roboto', 'open-sans'] as FontFamily[],
      },
    ]);
    Object.assign(answers, themeAnswers);
  }

  // Features
  const featureAnswer = await inquirer.prompt({
    type: 'checkbox',
    name: 'features',
    message: 'Select the features to enable:',
    choices: [
      { name: 'Blog', value: 'blog' },
      { name: 'Team', value: 'team' },
      { name: 'Services', value: 'services' },
      { name: 'Testimonials', value: 'testimonials' },
      { name: 'Appointments', value: 'appointments' },
    ],
  });
  answers.features = featureAnswer.features;

  return answers as TenantAnswers;
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

    // Create tenant
    spinner.start('Creating tenant...');
    const result = await createNewTenant(payload, {
      name: answers.name,
      domain: answers.domain,
      type: answers.type,
      theme: answers.customTheme ? {
        primaryColor: answers.primaryColor,
        secondaryColor: answers.secondaryColor,
        fontFamily: answers.fontFamily,
      } : undefined,
      features: {
        blog: answers.features.includes('blog'),
        team: answers.features.includes('team'),
        services: answers.features.includes('services'),
        testimonials: answers.features.includes('testimonials'),
        appointments: answers.features.includes('appointments'),
      },
    });
    spinner.succeed('Tenant created successfully');

    // Display results
    console.log('\nTenant Details:');
    console.log(chalk.blue('Name:'), result.tenant.name);
    console.log(chalk.blue('Domain:'), result.tenant.domain);
    console.log(chalk.blue('Admin URL:'), result.tenant.adminUrl);
    
    console.log('\nAdmin User:');
    console.log(chalk.yellow('Email:'), result.admin.email);
    console.log(chalk.yellow('Username:'), result.admin.username);
    console.log(chalk.yellow('Login URL:'), result.admin.loginUrl);
    
    console.log('\nCreated Pages:');
    result.pages.forEach(page => {
      console.log(chalk.green('•'), page.title);
      console.log('  URL:', page.url);
    });

    console.log('\n' + chalk.bold('Next Steps:'));
    console.log('1. Set up DNS records for', chalk.cyan(answers.domain));
    console.log('2. Log in to the admin panel at', chalk.cyan(result.admin.loginUrl));
    console.log('3. Change the default admin password');
    console.log('4. Customize your site content');

    await payload.shutdown();
  } catch (error) {
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
