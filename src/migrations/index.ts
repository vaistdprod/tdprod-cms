import * as migration_20250220_171316_create_pediatrician_tenant from './20250220_171316_create_pediatrician_tenant';

export const migrations = [
  {
    up: migration_20250220_171316_create_pediatrician_tenant.up,
    down: migration_20250220_171316_create_pediatrician_tenant.down,
    name: '20250220_171316_create_pediatrician_tenant',
  },
];
