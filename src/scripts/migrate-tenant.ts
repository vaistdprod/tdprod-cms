#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPayload } from '../utilities/getPayload';
import { CollectionSlug, TenantData } from '../utilities/types';

interface MigrationAnswers {
  sourceTenant: string;
  targetTenant: string;
  collections: CollectionSlug[];
  includeMedia: boolean;
  overwrite: boolean;
}

interface TenantChoice {
  name: string;
  value: string;
}

program
  .name('migrate-tenant')
  .description('Migrate data between tenants')
  .option('-s, --source <tenant>', 'Source tenant domain or ID')
  .option('-t, --target <tenant>', 'Target tenant domain or ID')
  .option('-c, --collections <items>', 'Collections to migrate (comma-separated)')
  .option('-m, --media', 'Include media files')
  .option('-o, --overwrite', 'Overwrite existing data')
  .parse(process.argv);

async function promptUser(): Promise<MigrationAnswers> {
  const opts = program.opts();
  let answers: Partial<MigrationAnswers> = {
    sourceTenant: opts.source,
    targetTenant: opts.target,
    collections: opts.collections?.split(',') as CollectionSlug[],
    includeMedia: opts.media ?? false,
    overwrite: opts.overwrite ?? false,
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

  const tenantChoices: TenantChoice[] = tenants.docs.map((tenant: TenantData) => ({
    name: `${tenant.name} (${tenant.domain})`,
    value: tenant.id as string,
  }));

  if (!answers.sourceTenant) {
    const sourceAnswer = await inquirer.prompt<{ sourceTenant: string }>({
      type: 'list',
      name: 'sourceTenant',
      message: 'Select source tenant:',
      choices: tenantChoices,
    });
    answers.sourceTenant = sourceAnswer.sourceTenant;
  }

  if (!answers.targetTenant) {
    const targetAnswer = await inquirer.prompt<{ targetTenant: string }>({
      type: 'list',
      name: 'targetTenant',
      message: 'Select target tenant:',
      choices: tenantChoices.filter((t: TenantChoice) => t.value !== answers.sourceTenant),
    });
    answers.targetTenant = targetAnswer.targetTenant;
  }

  if (!answers.collections) {
    const collectionChoices = [
      { name: 'Pages', value: 'pages' as const },
      { name: 'Services', value: 'services' as const },
      { name: 'Team Members', value: 'team' as const },
      { name: 'Testimonials', value: 'testimonials' as const },
      { name: 'Blog Posts', value: 'posts' as const },
    ];

    const collectionsAnswer = await inquirer.prompt<{ collections: CollectionSlug[] }>({
      type: 'checkbox',
      name: 'collections',
      message: 'Select collections to migrate:',
      choices: collectionChoices,
      validate: (input: unknown) => {
        const collections = input as CollectionSlug[];
        return collections.length > 0 || 'Please select at least one collection';
      },
    });
    answers.collections = collectionsAnswer.collections;
  }

  if (answers.includeMedia === undefined) {
    const mediaAnswer = await inquirer.prompt<{ includeMedia: boolean }>({
      type: 'confirm',
      name: 'includeMedia',
      message: 'Include media files?',
      default: true,
    });
    answers.includeMedia = mediaAnswer.includeMedia;
  }

  if (answers.overwrite === undefined) {
    const overwriteAnswer = await inquirer.prompt<{ overwrite: boolean }>({
      type: 'confirm',
      name: 'overwrite',
      message: 'Overwrite existing data in target tenant?',
      default: false,
    });
    answers.overwrite = overwriteAnswer.overwrite;
  }

  await payload.shutdown();
  return answers as MigrationAnswers;
}

async function migrateCollection<T extends CollectionSlug>(
  payload: any,
  collection: T,
  sourceTenantId: string,
  targetTenantId: string,
  overwrite: boolean
): Promise<void> {
  // Get source items
  const sourceItems = await payload.find({
    collection,
    where: {
      associatedTenant: { equals: sourceTenantId },
    },
    limit: 1000,
  });

  for (const item of sourceItems.docs) {
    // Check for existing item in target
    const existingItem = await payload.find({
      collection,
      where: {
        and: [
          { associatedTenant: { equals: targetTenantId } },
          { slug: { equals: item.slug } },
        ],
      },
    });

    if (existingItem.totalDocs > 0) {
      if (overwrite) {
        await payload.update({
          collection,
          id: existingItem.docs[0].id,
          data: {
            ...item,
            associatedTenant: targetTenantId,
          },
        });
      }
    } else {
      await payload.create({
        collection,
        data: {
          ...item,
          associatedTenant: targetTenantId,
        },
      });
    }
  }
}

async function migrateMedia(
  payload: any,
  sourceTenantId: string,
  targetTenantId: string,
  overwrite: boolean
): Promise<void> {
  const sourceMedia = await payload.find({
    collection: 'media',
    where: {
      associatedTenant: { equals: sourceTenantId },
    },
    limit: 1000,
  });

  for (const item of sourceMedia.docs) {
    // Download media file
    const response = await fetch(item.url);
    if (!response.ok) {
      console.warn(`Failed to download media file: ${item.filename}`);
      continue;
    }
    const fileBuffer = Buffer.from(await response.arrayBuffer());

    // Check for existing media in target
    const existingMedia = await payload.find({
      collection: 'media',
      where: {
        and: [
          { associatedTenant: { equals: targetTenantId } },
          { filename: { equals: item.filename } },
        ],
      },
    });

    if (existingMedia.totalDocs > 0) {
      if (overwrite) {
        await payload.update({
          collection: 'media',
          id: existingMedia.docs[0].id,
          data: {
            ...item,
            associatedTenant: targetTenantId,
            file: fileBuffer,
          },
        });
      }
    } else {
      await payload.create({
        collection: 'media',
        data: {
          ...item,
          associatedTenant: targetTenantId,
          file: fileBuffer,
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

    // Verify tenants exist
    spinner.start('Verifying tenants...');
    const sourceTenant = await payload.findByID({
      collection: 'tenants',
      id: answers.sourceTenant,
    });

    const targetTenant = await payload.findByID({
      collection: 'tenants',
      id: answers.targetTenant,
    });

    if (!sourceTenant || !targetTenant) {
      spinner.fail('Tenant verification failed');
      console.log(chalk.red('One or both tenants not found'));
      await payload.shutdown();
      process.exit(1);
    }
    spinner.succeed('Tenants verified');

    // Migrate collections
    for (const collection of answers.collections) {
      spinner.start(`Migrating ${collection}...`);
      await migrateCollection(
        payload,
        collection,
        answers.sourceTenant,
        answers.targetTenant,
        answers.overwrite
      );
      spinner.succeed(`${collection} migrated`);
    }

    // Migrate media if requested
    if (answers.includeMedia) {
      spinner.start('Migrating media files...');
      await migrateMedia(
        payload,
        answers.sourceTenant,
        answers.targetTenant,
        answers.overwrite
      );
      spinner.succeed('Media files migrated');
    }

    console.log('\n' + chalk.green('✓') + ' Migration completed successfully!');
    console.log('\nMigration Details:');
    console.log(chalk.blue('From:'), sourceTenant.name, `(${sourceTenant.domain})`);
    console.log(chalk.blue('To:'), targetTenant.name, `(${targetTenant.domain})`);

    console.log('\nMigrated Collections:');
    answers.collections.forEach(collection => {
      console.log(chalk.green('•'), collection);
    });
    if (answers.includeMedia) {
      console.log(chalk.green('•'), 'media');
    }

    await payload.shutdown();
  } catch (error) {
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
