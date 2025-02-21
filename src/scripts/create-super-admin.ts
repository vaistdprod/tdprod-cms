#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getPayload } from '../utilities/getPayload';

interface SuperAdminAnswers {
  email: string;
  password: string;
  confirmPassword: string;
}

program
  .name('create-super-admin')
  .description('Create a super admin user for the CMS')
  .option('-e, --email <email>', 'Super admin email')
  .parse(process.argv);

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) || 'Please enter a valid email address';
};

const validatePassword = (password: string) => {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
  return true;
};

async function promptUser(): Promise<SuperAdminAnswers> {
  let answers: SuperAdminAnswers = {
    email: program.opts().email,
    password: '',
    confirmPassword: '',
  };

  if (!answers.email) {
    const emailAnswer = await inquirer.prompt({
      type: 'input',
      name: 'email',
      message: 'What is the super admin email?',
      validate: validateEmail,
    });
    answers.email = emailAnswer.email;
  }

  const passwordAnswer = await inquirer.prompt({
    type: 'password',
    name: 'password',
    message: 'Enter a strong password:',
    validate: validatePassword,
  });
  answers.password = passwordAnswer.password;

  const confirmAnswer = await inquirer.prompt({
    type: 'password',
    name: 'confirmPassword',
    message: 'Confirm password:',
    validate: (input: string) => input === answers.password || 'Passwords do not match',
  });
  answers.confirmPassword = confirmAnswer.confirmPassword;

  return answers;
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

    // Check if super admin already exists
    spinner.start('Checking existing users...');
    const existingAdmin = await payload.find({
      collection: 'users',
      where: {
        roles: { contains: 'super-admin' },
      },
    });

    if (existingAdmin.totalDocs > 0) {
      spinner.fail('Super admin already exists');
      console.log(chalk.yellow('\nWarning: A super admin user already exists in the system.'));
      console.log('If you need to reset the super admin password, use the reset-password command instead.');
      await payload.shutdown();
      process.exit(1);
    }
    spinner.succeed('No existing super admin found');

    // Create super admin user
    spinner.start('Creating super admin user...');
    const superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: answers.email,
        password: answers.password,
        roles: ['super-admin'],
        status: 'active',
      },
      overrideAccess: true,
    });
    spinner.succeed('Super admin created successfully');

    // Display results
    console.log('\nSuper Admin Details:');
    console.log(chalk.blue('Email:'), superAdmin.email);
    console.log(chalk.blue('Status:'), superAdmin.status);
    console.log(chalk.blue('Roles:'), superAdmin.roles.join(', '));
    
    console.log('\n' + chalk.bold('Next Steps:'));
    console.log('1. Log in to the admin panel at', chalk.cyan(process.env.PAYLOAD_PUBLIC_SERVER_URL + '/admin'));
    console.log('2. Set up your first tenant using the create-tenant command');
    console.log('3. Configure your domain settings');

    await payload.shutdown();
  } catch (error) {
    console.error('\n' + chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
};

run();
