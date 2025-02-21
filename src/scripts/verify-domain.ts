#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPayload } from '../utilities/getPayload';
import { checkDomainVerification } from '../utilities/checkDomainVerification';
import { manageDomains } from '../utilities/manageDomains';

interface DomainAnswers {
  domain: string;
  provider: 'cloudflare' | 'manual';
  autoSetup: boolean;
}

program
  .name('verify-domain')
  .description('Verify and configure domain for a tenant')
  .option('-d, --domain <domain>', 'Domain to verify')
  .option('-p, --provider <provider>', 'DNS provider (cloudflare|manual)')
  .option('-a, --auto-setup', 'Automatically configure DNS records')
  .parse(process.argv);

async function promptUser(): Promise<DomainAnswers> {
  let answers: Partial<DomainAnswers> = {
    domain: program.opts().domain,
    provider: program.opts().provider,
    autoSetup: program.opts().autoSetup,
  };

  if (!answers.domain) {
    const domainAnswer = await inquirer.prompt({
      type: 'input',
      name: 'domain',
      message: 'Enter the domain to verify:',
      validate: (domain: string) => {
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
        return domainRegex.test(domain) || 'Please enter a valid domain name (e.g., example.com)';
      },
    });
    answers.domain = domainAnswer.domain;
  }

  if (!answers.provider) {
    const providerAnswer = await inquirer.prompt({
      type: 'list',
      name: 'provider',
      message: 'Select your DNS provider:',
      choices: [
        { name: 'Cloudflare', value: 'cloudflare' },
        { name: 'Manual Setup', value: 'manual' },
      ],
    });
    answers.provider = providerAnswer.provider;
  }

  if (answers.provider === 'cloudflare' && !answers.autoSetup) {
    const autoSetupAnswer = await inquirer.prompt({
      type: 'confirm',
      name: 'autoSetup',
      message: 'Would you like to automatically configure DNS records?',
      default: true,
    });
    answers.autoSetup = autoSetupAnswer.autoSetup;
  }

  return answers as DomainAnswers;
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

    // Find tenant by domain
    spinner.start('Finding tenant...');
    const tenant = await payload.find({
      collection: 'tenants',
      where: {
        domain: { equals: answers.domain },
      },
    });

    if (tenant.totalDocs === 0) {
      spinner.fail('Tenant not found');
      console.log(chalk.yellow(`\nNo tenant found for domain ${answers.domain}`));
      console.log('Create a tenant first using the create-tenant command');
      await payload.shutdown();
      process.exit(1);
    }
    spinner.succeed('Tenant found');

    // Verify domain
    spinner.start('Verifying domain...');
    const verificationResult = await checkDomainVerification(answers.domain);

    if (!verificationResult.verified) {
      spinner.fail('Domain verification failed');
      console.log('\nRequired DNS Records:');
      verificationResult.requiredRecords.forEach(record => {
        console.log(chalk.cyan(`\nRecord Type: ${record.type}`));
        console.log(`Name: ${record.name}`);
        console.log(`Value: ${record.value}`);
        if (record.ttl) console.log(`TTL: ${record.ttl}`);
      });

      if (answers.provider === 'cloudflare' && answers.autoSetup) {
        const setupAnswer = await inquirer.prompt({
          type: 'confirm',
          name: 'setup',
          message: 'Would you like to set up these records now?',
          default: true,
        });

        if (setupAnswer.setup) {
          spinner.start('Setting up DNS records...');
          await manageDomains.setupDNSRecords(answers.domain, verificationResult.requiredRecords);
          spinner.succeed('DNS records configured');
        }
      }

      console.log('\n' + chalk.bold('Next Steps:'));
      if (answers.provider === 'manual') {
        console.log('1. Add the above DNS records to your domain');
        console.log('2. Wait for DNS propagation (may take up to 24 hours)');
        console.log('3. Run this command again to verify');
      }
    } else {
      spinner.succeed('Domain verified');

      // Set up SSL if needed
      if (!verificationResult.hasSSL) {
        spinner.start('Setting up SSL certificate...');
        await manageDomains.setupSSL(answers.domain);
        spinner.succeed('SSL certificate issued');
      }

      console.log('\n' + chalk.green('✓') + ' Domain setup complete!');
      console.log('\nYour site is now available at:');
      console.log(chalk.cyan(`https://${answers.domain}`));
    }

    await payload.shutdown();
  } catch (error) {
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
