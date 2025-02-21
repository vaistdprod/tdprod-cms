#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPayload } from '../utilities/getPayload';
import { TenantData } from '../utilities/types';

interface FeatureAnswers {
  tenant: string;
  features: {
    blog: boolean;
    team: boolean;
    services: boolean;
    testimonials: boolean;
    appointments: boolean;
  };
}

interface FeatureDefinition {
  name: string;
  value: keyof FeatureAnswers['features'];
  description: string;
}

program
  .name('toggle-features')
  .description('Toggle tenant features')
  .option('-t, --tenant <tenant>', 'Tenant domain or ID')
  .option('-f, --features <items>', 'Features to enable (comma-separated)')
  .option('-d, --disable <items>', 'Features to disable (comma-separated)')
  .parse(process.argv);

const AVAILABLE_FEATURES: FeatureDefinition[] = [
  { name: 'Blog', value: 'blog', description: 'Enable blog posts and categories' },
  { name: 'Team', value: 'team', description: 'Enable team members and profiles' },
  { name: 'Services', value: 'services', description: 'Enable service listings' },
  { name: 'Testimonials', value: 'testimonials', description: 'Enable client testimonials' },
  { name: 'Appointments', value: 'appointments', description: 'Enable appointment scheduling' },
];

async function promptUser(): Promise<FeatureAnswers> {
  const opts = program.opts();
  
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

  // Get tenant selection
  let selectedTenant = opts.tenant;
  if (!selectedTenant) {
    const tenantAnswer = await inquirer.prompt<{ tenant: string }>({
      type: 'list',
      name: 'tenant',
      message: 'Select tenant:',
      choices: tenantChoices,
    });
    selectedTenant = tenantAnswer.tenant;
  }

  // Get current tenant features
  const currentTenant = await payload.findByID({
    collection: 'tenants',
    id: selectedTenant,
  });

  // Parse command line feature toggles
  const enableFeatures = opts.features?.split(',') || [];
  const disableFeatures = opts.disable?.split(',') || [];

  // Initialize features with current state
  let features = {
    blog: currentTenant.features?.blog ?? false,
    team: currentTenant.features?.team ?? false,
    services: currentTenant.features?.services ?? false,
    testimonials: currentTenant.features?.testimonials ?? false,
    appointments: currentTenant.features?.appointments ?? false,
  };

  // Apply command line toggles
  enableFeatures.forEach((feature: string) => {
    if (feature in features) {
      features[feature as keyof typeof features] = true;
    }
  });

  disableFeatures.forEach((feature: string) => {
    if (feature in features) {
      features[feature as keyof typeof features] = false;
    }
  });

  // If no command line toggles, prompt for features
  if (!enableFeatures.length && !disableFeatures.length) {
    const featureAnswer = await inquirer.prompt<{ selectedFeatures: Array<keyof FeatureAnswers['features']> }>({
      type: 'checkbox',
      name: 'selectedFeatures',
      message: 'Select features to enable:',
      choices: AVAILABLE_FEATURES.map(feature => ({
        name: `${feature.name} - ${feature.description}`,
        value: feature.value,
        checked: features[feature.value],
      })),
    });

    // Update features based on selection
    AVAILABLE_FEATURES.forEach(feature => {
      features[feature.value] = featureAnswer.selectedFeatures.includes(feature.value);
    });
  }

  await payload.shutdown();
  return {
    tenant: selectedTenant,
    features,
  };
}

interface CollectionMapping {
  name: string;
  feature: keyof FeatureAnswers['features'];
}

async function updateCollections(
  payload: any,
  tenantId: string,
  features: FeatureAnswers['features']
): Promise<void> {
  // Update collection access based on features
  const collections: CollectionMapping[] = [
    { name: 'posts', feature: 'blog' },
    { name: 'team', feature: 'team' },
    { name: 'services', feature: 'services' },
    { name: 'testimonials', feature: 'testimonials' },
  ];

  for (const collection of collections) {
    if (!features[collection.feature]) {
      // If feature is disabled, archive existing items
      await payload.update({
        collection: collection.name,
        where: {
          associatedTenant: { equals: tenantId },
        },
        data: {
          status: 'archived',
        },
      });
    }
  }
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

    // Update tenant features
    spinner.start('Updating features...');
    const updatedTenant = await payload.update({
      collection: 'tenants',
      id: answers.tenant,
      data: {
        features: answers.features,
      },
    });

    // Update related collections
    await updateCollections(payload, answers.tenant, answers.features);
    
    spinner.succeed('Features updated');

    console.log('\n' + chalk.green('✓') + ' Features updated successfully!');
    console.log('\nTenant Details:');
    console.log(chalk.blue('Name:'), updatedTenant.name);
    console.log(chalk.blue('Domain:'), updatedTenant.domain);

    console.log('\nEnabled Features:');
    Object.entries(answers.features).forEach(([feature, enabled]) => {
      if (enabled) {
        console.log(chalk.green('•'), feature);
      }
    });

    console.log('\nDisabled Features:');
    Object.entries(answers.features).forEach(([feature, enabled]) => {
      if (!enabled) {
        console.log(chalk.red('•'), feature);
      }
    });

    await payload.shutdown();
  } catch (error) {
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
