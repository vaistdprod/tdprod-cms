#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPayload } from '../utilities/getPayload';
import { createNewTenant } from '../utilities/createNewTenant';
import { manageDomains } from '../utilities/manageDomains';
import { TenantType, FontFamily, DNSRecord } from '../utilities/types';

interface TenantAnswers {
  name: string;
  domain: string;
  type: TenantType;
  adminEmail: string;
  setupDNS: boolean;
  useTemplate: boolean;
  template?: string;
  customTheme: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: FontFamily;
  features: string[];
}

program
  .name('create-tenant-v2')
  .description('Streamlined tenant creation with DNS setup')
  .option('-n, --name <name>', 'Tenant name')
  .option('-d, --domain <domain>', 'Tenant domain')
  .option('-t, --type <type>', 'Business type')
  .option('-e, --email <email>', 'Admin email')
  .option('--quick', 'Use default settings')
  .parse(process.argv);

const validateDomain = (domain: string) => {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
  return domainRegex.test(domain) || 'Please enter a valid domain name (e.g., example.com)';
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) || 'Please enter a valid email address';
};

const validateHexColor = (color: string) => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color) || 'Please enter a valid hex color (e.g., #FF0000)';
};

async function promptUser(): Promise<TenantAnswers> {
  const opts = program.opts();
  let answers: Partial<TenantAnswers> = {
    name: opts.name,
    domain: opts.domain,
    type: opts.type as TenantType,
  };

  // Quick mode with defaults
  if (opts.quick && answers.name && answers.domain && answers.type) {
    return {
      ...answers,
      adminEmail: opts.email || `admin@${answers.domain}`,
      setupDNS: true,
      useTemplate: true,
      template: answers.type,
      customTheme: false,
      features: ['team', 'services', 'testimonials'],
    } as TenantAnswers;
  }

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

  // Admin email
  const emailAnswer = await inquirer.prompt({
    type: 'input',
    name: 'adminEmail',
    message: 'Admin email address:',
    default: opts.email || `admin@${answers.domain}`,
    validate: validateEmail,
  });
  answers.adminEmail = emailAnswer.adminEmail;

  // Business type
  if (!answers.type) {
    const typeAnswer = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'What type of business is this?',
      choices: ['healthcare', 'legal', 'education', 'professional', 'non-profit', 'other'] as TenantType[],
    });
    answers.type = typeAnswer.type;
  }

  // DNS Setup
  const dnsAnswer = await inquirer.prompt({
    type: 'confirm',
    name: 'setupDNS',
    message: 'Would you like to set up DNS records now?',
    default: true,
  });
  answers.setupDNS = dnsAnswer.setupDNS;

  // Template
  const templateAnswer = await inquirer.prompt({
    type: 'confirm',
    name: 'useTemplate',
    message: 'Would you like to use a pre-built template?',
    default: true,
  });
  answers.useTemplate = templateAnswer.useTemplate;

  if (answers.useTemplate) {
    const templateTypeAnswer = await inquirer.prompt({
      type: 'list',
      name: 'template',
      message: 'Select a template:',
      choices: [
        { name: `${answers.type} - Standard`, value: answers.type },
        { name: `${answers.type} - Minimal`, value: `${answers.type}-minimal` },
        { name: 'Blank', value: 'blank' },
      ],
    });
    answers.template = templateTypeAnswer.template;
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
      { name: 'Blog', value: 'blog', checked: answers.type === 'professional' },
      { name: 'Team', value: 'team', checked: true },
      { name: 'Services', value: 'services', checked: true },
      { name: 'Testimonials', value: 'testimonials', checked: true },
      { name: 'Appointments', value: 'appointments', checked: answers.type === 'healthcare' },
    ],
  });
  answers.features = featureAnswer.features;

  return answers as TenantAnswers;
}

import { vercelDomains } from '../utilities/vercelDomains';

async function setupDNSRecords(domain: string): Promise<void> {
  const spinner = ora('Setting up domain with Vercel...').start();
  
  const result = await vercelDomains.setupDomain(domain);
  
  if (!result.success) {
    spinner.fail(result.message);
    throw new Error(result.message);
  }

  if (result.configuration) {
    spinner.succeed('Domain added to Vercel project');
    
    console.log('\nDNS Configuration:');
    if (result.configuration.nameservers?.length) {
      console.log('\nNameservers:');
      result.configuration.nameservers.forEach(ns => console.log(chalk.cyan(`  ${ns}`)));
    }
    if (result.configuration.aRecord) {
      console.log('\nA Record:');
      console.log(chalk.cyan(`  ${result.configuration.aRecord}`));
    }
    if (result.configuration.cnameRecord) {
      console.log('\nCNAME Record:');
      console.log(chalk.cyan(`  ${result.configuration.cnameRecord}`));
    }
    
    console.log('\nPlease configure your DNS settings with the above configuration.');
    console.log('Once DNS is configured, Vercel will automatically provision SSL.');
  } else {
    spinner.succeed(result.message);
  }
}

const run = async () => {
  const spinner = ora();
  try {
    // Get answers from command line or prompt
    const answers = await promptUser();

    // Initialize CMS
    spinner.start('Initializing CMS...');
    const payload = await getPayload();
    spinner.succeed('CMS initialized');

    // Set up DNS if requested
    if (answers.setupDNS) {
      spinner.start('Setting up DNS records...');
      await setupDNSRecords(answers.domain);
      spinner.succeed('DNS records created');
    }

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
    console.log('\n' + chalk.bold('Tenant Details:'));
    console.log(chalk.blue('Name:'), result.tenant.name);
    console.log(chalk.blue('Domain:'), result.tenant.domain);
    console.log(chalk.blue('Admin URL:'), result.tenant.adminUrl);
    
    console.log('\n' + chalk.bold('Admin User:'));
    console.log(chalk.yellow('Email:'), result.admin.email);
    console.log(chalk.yellow('Username:'), result.admin.username);
    console.log(chalk.yellow('Initial Password:'), 'changeme123');  // Default password from createEnhancedTenant
    console.log(chalk.yellow('Login URL:'), result.admin.loginUrl);
    
    if (result.pages?.length) {
      console.log('\n' + chalk.bold('Created Pages:'));
      result.pages.forEach(page => {
        console.log(chalk.green('•'), page.title);
        console.log('  URL:', page.url);
      });
    }

    console.log('\n' + chalk.bold('Next Steps:'));
    if (!answers.setupDNS) {
      console.log('1. Set up DNS records for', chalk.cyan(answers.domain));
      console.log('2. Configure SSL certificate');
      console.log('3. Log in to the admin panel at', chalk.cyan(result.admin.loginUrl));
      console.log('4. Change the default admin password');
    } else {
      console.log('1. Log in to the admin panel at', chalk.cyan(result.admin.loginUrl));
      console.log('2. Change the default admin password');
      console.log('3. Customize your site content');
    }

    await payload.shutdown();
  } catch (error) {
    spinner.fail('Error occurred');
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
