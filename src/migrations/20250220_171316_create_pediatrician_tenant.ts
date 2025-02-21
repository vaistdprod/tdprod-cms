// Disable plugins during migration
process.env.PAYLOAD_DISABLE_PLUGINS = 'true';

import { up, down } from './create-pediatrician-tenant';

export { up, down };
