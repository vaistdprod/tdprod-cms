import * as migration_20250220_185600_create_super_admin from './20250220_185600_create_super_admin';

// Only keep the super admin migration since we've moved to a dynamic tenant creation approach
export const migrations = [
  {
    up: migration_20250220_185600_create_super_admin.up,
    down: migration_20250220_185600_create_super_admin.down,
    name: '20250220_185600_create_super_admin',
  },
];
