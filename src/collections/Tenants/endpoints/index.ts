import { CollectionConfig, Endpoint } from 'payload'
import { createNewTenant } from './create'

const endpoint: Endpoint = {
  path: createNewTenant.path,
  method: 'post' as const,
  handler: createNewTenant.handler,
}

export const addTenantEndpoints = (collection: CollectionConfig): CollectionConfig => {
  return {
    ...collection,
    endpoints: [
      ...(collection.endpoints || []),
      endpoint,
    ],
  }
}
