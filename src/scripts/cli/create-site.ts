#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { createMedicalSite } from '../create-medical-site';
import { MedicalSiteConfig } from '../../templates/medical';
import { TemplateOptions } from '../../templates';

program
  .name('create-site')
  .description('Create a new medical practice site')
  .option('-t, --template <type>', 'Template type (e.g., medical)', 'medical')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-o, --output <path>', 'Output directory')
  .parse(process.argv);

const options = program.opts();

async function collectSiteInfo(): Promise<MedicalSiteConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'practiceName',
      message: 'What is the name of your medical practice?',
      validate: (input) => input.length > 0,
    },
    {
      type: 'input',
      name: 'tagline',
      message: 'Enter a tagline for your practice:',
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Enter your practice phone number:',
      validate: (input) => /^\(\d{3}\) \d{3}-\d{4}$/.test(input) || 'Please enter a valid phone number (e.g., (555) 123-4567)',
    },
    {
      type: 'input',
      name: 'email',
      message: 'Enter your practice email:',
      validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email address',
    },
    {
      type: 'input',
      name: 'street',
      message: 'Enter your street address:',
      validate: (input) => input.length > 0,
    },
    {
      type: 'input',
      name: 'city',
      message: 'Enter your city:',
      validate: (input) => input.length > 0,
    },
    {
      type: 'input',
      name: 'state',
      message: 'Enter your state:',
      validate: (input) => input.length === 2 || 'Please enter a two-letter state code',
    },
    {
      type: 'input',
      name: 'zip',
      message: 'Enter your ZIP code:',
      validate: (input) => /^\d{5}(-\d{4})?$/.test(input) || 'Please enter a valid ZIP code',
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select the features you want to enable:',
      choices: [
        { name: 'Online Appointments', value: 'appointments', checked: true },
        { name: 'Patient Portal', value: 'portal' },
        { name: 'Telemedicine', value: 'telemedicine' },
        { name: 'Dark Mode', value: 'darkMode' },
        { name: 'Multilingual Support', value: 'multilingual' },
        { name: 'Search Functionality', value: 'search' },
      ],
    },
    {
      type: 'list',
      name: 'deployment',
      message: 'Select your preferred deployment platform:',
      choices: [
        { name: 'Vercel', value: 'vercel' },
        { name: 'Netlify', value: 'netlify' },
        { name: 'AWS', value: 'aws' },
      ],
    },
  ]);

  // Build the site configuration
  const config: MedicalSiteConfig = {
    practiceName: answers.practiceName,
    tagline: answers.tagline,
    contact: {
      phone: answers.phone,
      email: answers.email,
      address: {
        street: answers.street,
        city: answers.city,
        state: answers.state,
        zip: answers.zip,
      },
    },
    hours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
    },
    services: [
      {
        id: 'general',
        name: 'General Services',
        description: 'General medical services and consultations',
        duration: 30,
      },
    ],
    team: [
      {
        id: 'doctor-1',
        name: 'Dr. Example',
        title: 'Lead Physician',
        specialty: 'General Practice',
      },
    ],
    insurance: {
      acceptedProviders: ['Major Insurance Plans Accepted'],
    },
    appointments: {
      scheduler: {
        title: 'Schedule an Appointment',
        description: 'Book your appointment online',
        services: [],
        doctors: [],
      },
    },
    content: {
      hero: {
        title: answers.practiceName,
        subtitle: answers.tagline,
      },
      about: {
        title: 'About Our Practice',
        content: `Welcome to ${answers.practiceName}. We are committed to providing high-quality medical care...`,
      },
    },
    seo: {
      title: `${answers.practiceName} | Medical Care in ${answers.city}, ${answers.state}`,
      description: `${answers.practiceName} provides comprehensive medical care in ${answers.city}, ${answers.state}...`,
      keywords: ['medical care', answers.city, answers.state],
    },
    theme: {
      colors: {
        primary: '#4A90E2',
        secondary: '#82B1FF',
        accent: '#2196F3',
      },
    },
    features: {
      onlineAppointments: answers.features.includes('appointments'),
      patientPortal: answers.features.includes('portal') ? {
        enabled: true,
        features: ['appointments', 'records', 'messaging'],
      } : undefined,
      telemedicine: answers.features.includes('telemedicine') ? {
        enabled: true,
        provider: 'default',
      } : undefined,
    },
  };

  return config;
}

async function collectTemplateOptions(features: string[]): Promise<TemplateOptions> {
  const options: TemplateOptions = {
    seo: {
      titleSuffix: ' | Healthcare Provider',
    },
    deployment: {
      platform: 'vercel',
      config: {},
    },
  };

  if (features.includes('darkMode')) {
    options.features = {
      ...options.features,
      darkMode: true,
    };
  }

  if (features.includes('multilingual')) {
    const { languages } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'languages',
        message: 'Select supported languages:',
        choices: [
          { name: 'English', value: 'en', checked: true },
          { name: 'Spanish', value: 'es' },
          { name: 'French', value: 'fr' },
          { name: 'Chinese', value: 'zh' },
        ],
      },
    ]);

    options.features = {
      ...options.features,
      multilingual: {
        enabled: true,
        defaultLocale: 'en',
        locales: languages,
      },
    };
  }

  if (features.includes('search')) {
    const { searchProvider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'searchProvider',
        message: 'Select search provider:',
        choices: [
          { name: 'Algolia', value: 'algolia' },
          { name: 'MeiliSearch', value: 'meilisearch' },
        ],
      },
    ]);

    options.features = {
      ...options.features,
      search: {
        enabled: true,
        provider: searchProvider,
      },
    };
  }

  return options;
}

async function main() {
  console.log(chalk.blue.bold('\nMedical Site Creator'));
  console.log(chalk.gray('Follow the prompts to create your medical practice site\n'));

  try {
    const spinner = ora('Collecting site information...');
    
    // Collect site configuration
    spinner.start();
    const config = await collectSiteInfo();
    spinner.succeed('Site information collected');

    // Collect template options
    spinner.text = 'Configuring template options...';
    spinner.start();
    const templateOptions = await collectTemplateOptions(config.features as unknown as string[]);
    spinner.succeed('Template options configured');

    // Create the site
    spinner.text = 'Creating site...';
    spinner.start();
    const site = await createMedicalSite(config, templateOptions);
    spinner.succeed('Site created successfully');

    // Display summary
    console.log('\n', chalk.green.bold('Site Creation Summary'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white.bold('Practice Name:'), config.practiceName);
    console.log(chalk.white.bold('Location:'), `${config.contact.address.city}, ${config.contact.address.state}`);
    console.log(chalk.white.bold('Features Enabled:'));
    Object.entries(config.features).forEach(([feature, enabled]) => {
      console.log(chalk.gray(`  • ${feature}: ${enabled ? chalk.green('✓') : chalk.red('✗')}`));
    });
    console.log(chalk.white.bold('Pages Created:'), Object.keys(site.pages || {}).length);
    console.log(chalk.gray('─'.repeat(50)), '\n');

    console.log(chalk.green('✨ Site created successfully!'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('1. Review and customize the generated configuration'));
    console.log(chalk.gray('2. Add your content and media assets'));
    console.log(chalk.gray('3. Deploy your site using the configured platform\n'));

  } catch (error) {
    console.error(chalk.red('\n✖ Error creating site:'), error);
    process.exit(1);
  }
}

main();
