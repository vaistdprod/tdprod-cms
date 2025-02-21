#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { getPayload } from '../utilities/getPayload';
import { CollectionDataMap, CollectionSlug } from '../utilities/types';

interface RestoreAnswers {
  backupPath: string;
  targetDomain?: string;
  includeMedia: boolean;
  overwrite: boolean;
}

program
  .name('restore-tenant')
  .description('Restore a tenant from backup')
  .option('-b, --backup <path>', 'Path to backup directory')
  .option('-d, --domain <domain>', 'Target domain (if different from backup)')
  .option('-m, --media', 'Restore media files')
  .option('-o, --overwrite', 'Overwrite existing data')
  .parse(process.argv);

async function validateBackupPath(input: string): Promise<true | string> {
  try {
    const stat = await fs.stat(input);
    return stat.isDirectory() || 'Please enter a valid directory path';
  } catch {
    return 'Directory does not exist';
  }
}

async function promptUser(): Promise<RestoreAnswers> {
  const opts = program.opts();
  let backupPath = opts.backup;

  // Always ensure we have a valid backup path
  if (!backupPath) {
    const backupAnswer = await inquirer.prompt<{ backupPath: string }>({
      type: 'input',
      name: 'backupPath',
      message: 'Enter path to backup directory:',
      validate: validateBackupPath,
    });
    backupPath = backupAnswer.backupPath;
  } else {
    // Validate provided backup path
    const isValid = await validateBackupPath(backupPath);
    if (isValid !== true) {
      throw new Error(isValid);
    }
  }

  // Read manifest to get backup info
  const manifestPath = path.join(backupPath, 'manifest.json');
  const manifest = JSON.parse(
    await fs.readFile(manifestPath, 'utf-8')
  );

  let answers: RestoreAnswers = {
    backupPath,
    targetDomain: opts.domain,
    includeMedia: opts.media ?? false,
    overwrite: opts.overwrite ?? false,
  };

  if (!answers.targetDomain) {
    const domainAnswer = await inquirer.prompt({
      type: 'input',
      name: 'targetDomain',
      message: 'Enter target domain (leave empty to use original):',
      default: manifest.tenant.domain,
    });
    answers.targetDomain = domainAnswer.targetDomain || manifest.tenant.domain;
  }

  if (answers.includeMedia === undefined && manifest.includesMedia) {
    const mediaAnswer = await inquirer.prompt({
      type: 'confirm',
      name: 'includeMedia',
      message: 'Restore media files?',
      default: true,
    });
    answers.includeMedia = mediaAnswer.includeMedia;
  }

  if (answers.overwrite === undefined) {
    const overwriteAnswer = await inquirer.prompt({
      type: 'confirm',
      name: 'overwrite',
      message: 'Overwrite existing data?',
      default: false,
    });
    answers.overwrite = overwriteAnswer.overwrite;
  }

  return answers;
}

async function restoreCollection<T extends CollectionSlug>(
  payload: any,
  collection: T,
  backupDir: string,
  tenantId: string,
  overwrite: boolean
): Promise<void> {
  const backupPath = path.join(backupDir, `${collection}.json`);
  
  try {
    const items = JSON.parse(
      await fs.readFile(backupPath, 'utf-8')
    );

    for (const item of items) {
      const existingItem = await payload.find({
        collection,
        where: {
          and: [
            { associatedTenant: { equals: tenantId } },
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
              associatedTenant: tenantId,
            },
          });
        }
      } else {
        await payload.create({
          collection,
          data: {
            ...item,
            associatedTenant: tenantId,
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      // File doesn't exist, skip this collection
      return;
    }
    throw error;
  }
}

async function restoreMedia(
  payload: any,
  backupDir: string,
  tenantId: string,
  overwrite: boolean
): Promise<void> {
  const mediaDir = path.join(backupDir, 'media');
  const mediaJsonPath = path.join(backupDir, 'media.json');

  try {
    const mediaItems = JSON.parse(
      await fs.readFile(mediaJsonPath, 'utf-8')
    );

    for (const item of mediaItems) {
      const filePath = path.join(mediaDir, item.filename);
      const fileBuffer = await fs.readFile(filePath);

      const existingMedia = await payload.find({
        collection: 'media',
        where: {
          and: [
            { associatedTenant: { equals: tenantId } },
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
              associatedTenant: tenantId,
              file: fileBuffer,
            },
          });
        }
      } else {
        await payload.create({
          collection: 'media',
          data: {
            ...item,
            associatedTenant: tenantId,
            file: fileBuffer,
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      // Media files don't exist, skip
      return;
    }
    throw error;
  }
}

const run = async () => {
  try {
    const spinner = ora();
    
    // Get answers from command line or prompt
    const answers = await promptUser();

    // Read manifest
    const manifestPath = path.join(answers.backupPath, 'manifest.json');
    const manifest = JSON.parse(
      await fs.readFile(manifestPath, 'utf-8')
    );

    // Start payload
    spinner.start('Initializing CMS...');
    const payload = await getPayload();
    spinner.succeed('CMS initialized');

    // Create or update tenant
    spinner.start('Setting up tenant...');
    let tenant;
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        domain: { equals: answers.targetDomain },
      },
    });

    if (existingTenant.totalDocs > 0) {
      if (!answers.overwrite) {
        spinner.fail('Tenant already exists');
        console.log(chalk.yellow('\nTenant already exists. Use --overwrite to update existing tenant.'));
        await payload.shutdown();
        process.exit(1);
      }
      tenant = await payload.update({
        collection: 'tenants',
        id: existingTenant.docs[0].id,
        data: {
          ...manifest.tenant,
          domain: answers.targetDomain,
        },
      });
    } else {
      tenant = await payload.create({
        collection: 'tenants',
        data: {
          ...manifest.tenant,
          domain: answers.targetDomain,
        },
      });
    }
    spinner.succeed('Tenant setup complete');

    // Restore collections
    spinner.start('Restoring tenant data...');
    const collections: CollectionSlug[] = [
      'pages',
      'services',
      'team',
      'testimonials',
      'posts',
    ];

    await Promise.all(
      collections.map(collection =>
        restoreCollection(payload, collection, answers.backupPath, tenant.id, answers.overwrite)
      )
    );
    spinner.succeed('Tenant data restored');

    // Restore media if requested
    if (answers.includeMedia && manifest.includesMedia) {
      spinner.start('Restoring media files...');
      await restoreMedia(payload, answers.backupPath, tenant.id, answers.overwrite);
      spinner.succeed('Media files restored');
    }

    console.log('\n' + chalk.green('✓') + ' Restore completed successfully!');
    console.log('\nTenant Details:');
    console.log(chalk.blue('Name:'), tenant.name);
    console.log(chalk.blue('Domain:'), tenant.domain);
    console.log(chalk.blue('Admin URL:'), `/admin/tenants/${tenant.id}`);

    console.log('\nRestored Collections:');
    collections.forEach(collection => {
      console.log(chalk.green('•'), collection);
    });
    if (answers.includeMedia && manifest.includesMedia) {
      console.log(chalk.green('•'), 'media');
    }

    await payload.shutdown();
  } catch (error) {
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
