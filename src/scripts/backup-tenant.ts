#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { getPayload } from '../utilities/getPayload';
import { CollectionDataMap, CollectionSlug } from '../utilities/types';

interface BackupAnswers {
  tenant: string;
  includeMedia: boolean;
  backupPath?: string;
}

program
  .name('backup-tenant')
  .description('Create a backup of a tenant\'s data')
  .option('-t, --tenant <tenant>', 'Tenant domain or ID')
  .option('-m, --media', 'Include media files')
  .option('-p, --path <path>', 'Backup destination path')
  .parse(process.argv);

async function promptUser(): Promise<BackupAnswers> {
  let answers: Partial<BackupAnswers> = {
    tenant: program.opts().tenant,
    includeMedia: program.opts().media,
    backupPath: program.opts().path,
  };

  if (!answers.tenant) {
    const tenantAnswer = await inquirer.prompt({
      type: 'input',
      name: 'tenant',
      message: 'Enter tenant domain or ID:',
      validate: (input: string) => input.length > 0 || 'Tenant identifier is required',
    });
    answers.tenant = tenantAnswer.tenant;
  }

  if (answers.includeMedia === undefined) {
    const mediaAnswer = await inquirer.prompt({
      type: 'confirm',
      name: 'includeMedia',
      message: 'Include media files in backup?',
      default: true,
    });
    answers.includeMedia = mediaAnswer.includeMedia;
  }

  if (!answers.backupPath) {
    const pathAnswer = await inquirer.prompt({
      type: 'input',
      name: 'backupPath',
      message: 'Enter backup destination path (optional):',
      default: './backups',
    });
    answers.backupPath = pathAnswer.backupPath;
  }

  return answers as BackupAnswers;
}

async function backupCollection<T extends CollectionSlug>(
  payload: any,
  collection: T,
  tenantId: string,
  backupDir: string
): Promise<void> {
  const items = await payload.find({
    collection,
    where: {
      associatedTenant: { equals: tenantId },
    },
    limit: 1000,
  });

  if (items.totalDocs > 0) {
    const backupPath = path.join(backupDir, `${collection}.json`);
    await fs.writeFile(
      backupPath,
      JSON.stringify(items.docs, null, 2),
      'utf-8'
    );
    return;
  }
}

async function backupMedia(
  payload: any,
  tenantId: string,
  backupDir: string
): Promise<void> {
  const mediaItems = await payload.find({
    collection: 'media',
    where: {
      associatedTenant: { equals: tenantId },
    },
    limit: 1000,
  });

  if (mediaItems.totalDocs > 0) {
    const mediaDir = path.join(backupDir, 'media');
    await fs.mkdir(mediaDir, { recursive: true });

    for (const item of mediaItems.docs) {
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`Failed to download ${item.filename}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(
          path.join(mediaDir, item.filename),
          buffer
        );
      } catch (error) {
        console.error(`Failed to backup media file ${item.filename}:`, error);
      }
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

    // Find tenant
    spinner.start('Finding tenant...');
    const tenant = await payload.find({
      collection: 'tenants',
      where: {
        or: [
          { domain: { equals: answers.tenant } },
          { id: { equals: answers.tenant } },
        ],
      },
    });

    if (tenant.totalDocs === 0) {
      spinner.fail('Tenant not found');
      console.log(chalk.yellow(`\nNo tenant found with identifier ${answers.tenant}`));
      await payload.shutdown();
      process.exit(1);
    }
    const tenantData = tenant.docs[0];
    spinner.succeed(`Found tenant: ${tenantData.name}`);

    // Create backup directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(
      answers.backupPath || './backups',
      `${tenantData.slug}_${timestamp}`
    );
    await fs.mkdir(backupDir, { recursive: true });

    // Backup collections
    spinner.start('Backing up tenant data...');
    const collections: CollectionSlug[] = [
      'pages',
      'services',
      'team',
      'testimonials',
      'posts',
    ];

    await Promise.all(
      collections.map(collection =>
        backupCollection(payload, collection, tenantData.id, backupDir)
      )
    );
    spinner.succeed('Tenant data backed up');

    // Backup media if requested
    if (answers.includeMedia) {
      spinner.start('Backing up media files...');
      await backupMedia(payload, tenantData.id, backupDir);
      spinner.succeed('Media files backed up');
    }

    // Create backup manifest
    const manifest = {
      tenant: {
        id: tenantData.id,
        name: tenantData.name,
        domain: tenantData.domain,
      },
      timestamp,
      includesMedia: answers.includeMedia,
      collections: collections.concat(answers.includeMedia ? ['media'] : []),
    };

    await fs.writeFile(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    console.log('\n' + chalk.green('✓') + ' Backup completed successfully!');
    console.log('\nBackup location:');
    console.log(chalk.cyan(backupDir));
    
    console.log('\nBackup contains:');
    collections.forEach(collection => {
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
