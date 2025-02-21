  import { BaseDatabaseAdapter, QueryDrafts } from 'payload/database'
import { createClient } from '@supabase/supabase-js'
import { PayloadRequest, Where, TypeWithID } from 'payload/types'
import path from 'path'
import fs from 'fs'

interface TypeWithVersion<T> {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: T;
  parent: string;
}

// Supabase specific types
type UUID = string;

interface SupabaseDocument {
  id: UUID;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface VersionDocument extends SupabaseDocument {
  version: any;
  parent: UUID;
}

interface PaginatedDocs<T = any> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

type FindArgs = {
  collection: string
  where?: Where
  sort?: string
  limit?: number
  page?: number
  skip?: number
}

// Helper type for converting Payload Where to Supabase filters
type SupabaseFilter = {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'in' | 'is';
  value: any;
}

type BaseVersionArgs<T> = {
  locale?: string;
  req?: PayloadRequest;
  versionData: T;
}

type VersionArgs<T> = BaseVersionArgs<T> & {
  collection: string;
  where?: Where;
  id?: string | number;
}

type GlobalVersionArgs<T> = BaseVersionArgs<T> & {
  global: string;
  where?: Where;
  id?: string | number;
}

type MigrationArgs = {
  collection?: string;
  file?: string;
  down?: boolean;
}

export const createSupabaseAdapter = () => {
  return ({ payload }: { payload: any }): BaseDatabaseAdapter => {
    // Helper function to convert Payload where clause to Supabase filter
    const convertWhereToFilter = (where: Where): SupabaseFilter[] => {
      const filters: SupabaseFilter[] = [];
      
      Object.entries(where).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([operator, val]) => {
            switch (operator) {
              case 'equals':
                filters.push({ column: key, operator: 'eq', value: val });
                break;
              case 'not_equals':
                filters.push({ column: key, operator: 'neq', value: val });
                break;
              case 'greater_than':
                filters.push({ column: key, operator: 'gt', value: val });
                break;
              case 'less_than':
                filters.push({ column: key, operator: 'lt', value: val });
                break;
              case 'greater_than_equal':
                filters.push({ column: key, operator: 'gte', value: val });
                break;
              case 'less_than_equal':
                filters.push({ column: key, operator: 'lte', value: val });
                break;
              case 'like':
                filters.push({ column: key, operator: 'like', value: `%${val}%` });
                break;
              case 'in':
                filters.push({ column: key, operator: 'in', value: val });
                break;
              case 'exists':
                filters.push({ column: key, operator: 'is', value: val ? 'NOT NULL' : 'NULL' });
                break;
            }
          });
        } else {
          filters.push({ column: key, operator: 'eq', value });
        }
      });
      
      return filters;
    };
    const client = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      throw new Error('Missing required Supabase environment variables. SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY must be provided.')
    }

    const executeMigrations = async (args: MigrationArgs) => {
      const migrationFiles = fs.readdirSync(path.resolve(__dirname, '../../migrations'))
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const sql = fs.readFileSync(path.resolve(__dirname, '../../migrations', file), 'utf8');
        const { error } = await client.rpc('run_sql', { sql });
        if (error) throw error;
        console.log(`Executed migration: ${file}`);
      }
    };

    let adapter: BaseDatabaseAdapter;
    
    adapter = {
      name: 'supabase',
      defaultIDType: 'text',
      payload,
      migrationDir: path.resolve(__dirname, '../../migrations'),
      queryDrafts: 'drafts' as unknown as QueryDrafts,

      async connect(): Promise<void> {
        try {
          const { count, error } = await client.from('tenants').select('*', { count: 'exact', head: true })
          if (error) throw error
          console.log('Successfully connected to Supabase; tenant count:', count)
        } catch (error) {
          console.error('Error connecting to Supabase:', error)
          throw error
        }
      },

      create: async <T = any>({ collection, data }: { collection: string; data: Record<string, unknown> }): Promise<T> => {
        try {
          const { data: result, error } = await client
            .from(collection)
            .insert(data)
            .select('*')
            .single()

          if (error) throw error
          return result
        } catch (error) {
          console.error('Error creating document:', error)
          throw error
        }
      },

      findOne: async <T = any>({ collection, where }: { collection: string; where?: Where }): Promise<T | null> => {
        try {
          let query = client.from(collection).select('*')

          if (where) {
            const filters = convertWhereToFilter(where);
            filters.forEach(filter => {
              switch (filter.operator) {
                case 'eq':
                  query = query.eq(filter.column, filter.value);
                  break;
                case 'neq':
                  query = query.neq(filter.column, filter.value);
                  break;
                case 'gt':
                  query = query.gt(filter.column, filter.value);
                  break;
                case 'lt':
                  query = query.lt(filter.column, filter.value);
                  break;
                case 'gte':
                  query = query.gte(filter.column, filter.value);
                  break;
                case 'lte':
                  query = query.lte(filter.column, filter.value);
                  break;
                case 'like':
                  query = query.ilike(filter.column, filter.value);
                  break;
                case 'in':
                  query = query.in(filter.column, filter.value);
                  break;
                case 'is':
                  if (filter.value === 'NULL') {
                    query = query.is(filter.column, null);
                  } else if (filter.value === 'NOT NULL') {
                    query = query.not(filter.column, 'is', null);
                  }
                  break;
              }
            });
          }

          const { data, error } = await query.single()

          if (error) throw error
          return data
        } catch (error) {
          console.error('Error finding document:', error)
          throw error
        }
      },

      find: async <T = TypeWithID>({ collection, where = {}, sort, limit, page, skip }: FindArgs): Promise<PaginatedDocs<T>> => {
        try {
          let query = client.from(collection).select('*')

          Object.entries(where).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([operator, val]) => {
                switch (operator) {
                  case 'equals':
                    query = query.eq(key, val)
                    break
                  case 'not_equals':
                    query = query.neq(key, val)
                    break
                  case 'greater_than':
                    query = query.gt(key, val)
                    break
                  case 'less_than':
                    query = query.lt(key, val)
                    break
                  case 'greater_than_equal':
                    query = query.gte(key, val)
                    break
                  case 'less_than_equal':
                    query = query.lte(key, val)
                    break
                  case 'like':
                    query = query.ilike(key, `%${val}%`)
                    break
                  case 'in':
                    query = query.in(key, val as any[])
                    break
                  case 'not_in':
                    query = query.not(key, 'in', val as any[])
                    break
                }
              })
            } else {
              query = query.eq(key, value)
            }
          })

          if (limit) {
            query = query.limit(limit)
          }
          if (skip) {
            query = query.range(skip, skip + (limit || 10) - 1)
          }

          if (sort) {
            const [field, order] = sort.split('_')
            query = query.order(field, { ascending: order === 'asc' })
          }

          const { data, error } = await query
          if (error) throw error

          const { count } = await client
            .from(collection)
            .select('*', { count: 'exact', head: true })
            .match(where)

          return {
            docs: data || [],
            totalDocs: count || 0,
            totalPages: Math.ceil((count || 0) / (limit || 10)),
            page: page || 1,
            pagingCounter: ((page || 1) - 1) * (limit || 10) + 1,
            hasPrevPage: (page || 1) > 1,
            hasNextPage: (page || 1) < Math.ceil((count || 0) / (limit || 10)),
            prevPage: (page || 1) > 1 ? (page || 1) - 1 : null,
            nextPage: (page || 1) < Math.ceil((count || 0) / (limit || 10)) ? (page || 1) + 1 : null,
            limit: limit || 10
          }
        } catch (error) {
          console.error('Error finding documents:', error)
          throw error
        }
      },

      createGlobal: async <T = any>({ data }: { data: Record<string, unknown> }): Promise<T> => {
        try {
          const { data: result, error } = await client
            .from('globals')
            .insert(data)
            .select('*')
            .single()

          if (error) throw error
          return result
        } catch (error) {
          console.error('Error creating global:', error)
          throw error
        }
      },

      findGlobal: async <T = any>({ slug }: { slug: string }): Promise<T> => {
        try {
          const { data, error } = await client
            .from('globals')
            .select('*')
            .eq('slug', slug)
            .single()

          if (error) throw error
          return data
        } catch (error) {
          console.error('Error finding global:', error)
          throw error
        }
      },

      updateGlobal: async <T = any>({ slug, data }: { slug: string; data: Record<string, unknown> }): Promise<T> => {
        try {
          const { data: result, error } = await client
            .from('globals')
            .update(data)
            .eq('slug', slug)
            .select('*')
            .single()

          if (error) throw error
          return result
        } catch (error) {
          console.error('Error updating global:', error)
          throw error
        }
      },

      deleteMany: async ({ collection, where }: { collection: string; where: Where }): Promise<void> => {
        try {
          let query = client.from(collection).delete()

          Object.entries(where).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([operator, val]) => {
                switch (operator) {
                  case 'equals':
                    query = query.eq(key, val)
                    break
                  case 'not_equals':
                    query = query.neq(key, val)
                    break
                }
              })
            } else {
              query = query.eq(key, value)
            }
          })

          const { error } = await query

          if (error) throw error
          return
        } catch (error) {
          console.error('Error deleting documents:', error)
          throw error
        }
      },

      deleteOne: async ({ collection, where }: { collection: string; where: Where }): Promise<void> => {
        try {
          const { error } = await client
            .from(collection)
            .delete()
            .match(where)
            .single()

          if (error) throw error
          return
        } catch (error) {
          console.error('Error deleting document:', error)
          throw error
        }
      },

      init: async () => {
        try {
          // Create globals table if it doesn't exist
          const { error } = await client.rpc('create_globals_if_not_exists', {})
          if (error) throw error
        } catch (error) {
          console.error('Error initializing database:', error)
          throw error
        }
      },

      updateOne: async <T = any>({ collection, data, id, where }: { collection: string; data: Record<string, unknown>; id?: string | number; where?: Where }): Promise<T> => {
        try {
          let query = client.from(collection).update(data)

          if (id) {
            query = query.eq('id', id)
          } else if (where) {
            Object.entries(where).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([operator, val]) => {
                  switch (operator) {
                    case 'equals':
                      query = query.eq(key, val)
                      break
                    case 'not_equals':
                      query = query.neq(key, val)
                      break
                  }
                })
              } else {
                query = query.eq(key, value)
              }
            })
          }

          const { data: result, error } = await query.select('*').single()

          if (error) throw error
          return result
        } catch (error) {
          console.error('Error updating document:', error)
          throw error
        }
      },

      // Version control methods
      findVersions: async <T = any>({ collection, where = {}, limit = 10, page = 1 }: { collection: string; where?: Where; limit?: number; page?: number }): Promise<PaginatedDocs<T>> => {
        try {
          let query = client.from(`${collection}_versions`).select('*')

          Object.entries(where).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([operator, val]) => {
                switch (operator) {
                  case 'equals':
                    query = query.eq(key, val)
                    break
                  case 'not_equals':
                    query = query.neq(key, val)
                    break
                }
              })
            } else {
              query = query.eq(key, value)
            }
          })

          query = query.range((page - 1) * limit, page * limit - 1)

          const { data, error } = await query
          if (error) throw error

          const { count } = await client
            .from(`${collection}_versions`)
            .select('*', { count: 'exact', head: true })
            .match(where)

          return {
            docs: data || [],
            totalDocs: count || 0,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
            page,
            pagingCounter: (page - 1) * limit + 1,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil((count || 0) / limit),
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil((count || 0) / limit) ? page + 1 : null
          }
        } catch (error) {
          console.error('Error finding versions:', error)
          throw error
        }
      },

      createVersion: async (args: { parent: any }): Promise<TypeWithVersion<any>> => {
        try {
          const { data: result, error } = await client
            .from('versions')
            .insert({
              version: args.parent,
              parent: args.parent,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
            .select('*')
            .single()

          if (error) throw error
          return {
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            version: args.parent,
            parent: result.parent
          }
        } catch (error) {
          console.error('Error creating version:', error)
          throw error
        }
      },

      updateVersion: async <T = any>(args: VersionArgs<T>): Promise<TypeWithVersion<T>> => {
        try {
          const { collection, id, where, versionData } = args;
          let query = client.from(`${collection}_versions`).update({
            version: versionData,
            updatedAt: new Date().toISOString()
          });

          if (id) {
            query = query.eq('id', id);
          } else if (where) {
            Object.entries(where).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([operator, val]) => {
                  switch (operator) {
                    case 'equals':
                      query = query.eq(key, val);
                      break;
                    case 'not_equals':
                      query = query.neq(key, val);
                      break;
                  }
                });
              } else {
                query = query.eq(key, value);
              }
            });
          }

          const { data: result, error } = await query.select('*').single();

          if (error) throw error;
          return {
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            version: versionData,
            parent: result.parent
          }
        } catch (error) {
          console.error('Error updating version:', error)
          throw error
        }
      },

      deleteVersions: async ({ collection, where }: { collection: string; where: Where }): Promise<void> => {
        try {
          let query = client.from(`${collection}_versions`).delete()

          Object.entries(where).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([operator, val]) => {
                switch (operator) {
                  case 'equals':
                    query = query.eq(key, val)
                    break
                  case 'not_equals':
                    query = query.neq(key, val)
                    break
                }
              })
            } else {
              query = query.eq(key, value)
            }
          })

          const { error } = await query
          if (error) throw error
        } catch (error) {
          console.error('Error deleting versions:', error)
          throw error
        }
      },

      createGlobalVersion: async (args: { parent: any }): Promise<TypeWithVersion<any>> => {
        try {
          const { data: result, error } = await client
            .from('globals_versions')
            .insert({
              version: args.parent,
              parent: args.parent,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
            .select('*')
            .single()

          if (error) throw error
          return {
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            version: args.parent,
            parent: result.parent
          }
        } catch (error) {
          console.error('Error creating global version:', error)
          throw error
        }
      },

      updateGlobalVersion: async <T = any>(args: GlobalVersionArgs<T>): Promise<TypeWithVersion<T>> => {
        try {
          const { id, where, versionData } = args;
          let query = client.from('globals_versions').update({
            version: versionData,
            updatedAt: new Date().toISOString()
          });

          if (id) {
            query = query.eq('id', id);
          } else if (where) {
            Object.entries(where).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([operator, val]) => {
                  switch (operator) {
                    case 'equals':
                      query = query.eq(key, val);
                      break;
                    case 'not_equals':
                      query = query.neq(key, val);
                      break;
                  }
                });
              } else {
                query = query.eq(key, value);
              }
            });
          }

          const { data: result, error } = await query.select('*').single();

          if (error) throw error;
          return {
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            version: versionData,
            parent: result.parent
          }
        } catch (error) {
          console.error('Error updating global version:', error)
          throw error
        }
      },

      findGlobalVersions: async <T = any>({ where = {}, limit = 10, page = 1 }: { where?: Where; limit?: number; page?: number }): Promise<PaginatedDocs<T>> => {
        try {
          let query = client.from('globals_versions').select('*')

          Object.entries(where).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([operator, val]) => {
                switch (operator) {
                  case 'equals':
                    query = query.eq(key, val)
                    break
                  case 'not_equals':
                    query = query.neq(key, val)
                    break
                }
              })
            } else {
              query = query.eq(key, value)
            }
          })

          query = query.range((page - 1) * limit, page * limit - 1)

          const { data, error } = await query
          if (error) throw error

          const { count } = await client
            .from('globals_versions')
            .select('*', { count: 'exact', head: true })
            .match(where)

          return {
            docs: data || [],
            totalDocs: count || 0,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
            page,
            pagingCounter: (page - 1) * limit + 1,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil((count || 0) / limit),
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil((count || 0) / limit) ? page + 1 : null
          }
        } catch (error) {
          console.error('Error finding global versions:', error)
          throw error
        }
      },

      createMigration: async (args: { file?: string; forceAcceptWarning?: boolean; migrationName?: string; payload: any }): Promise<void> => {
        try {
          const { migrationName } = args
          if (!migrationName) return

          const { error } = await client
            .from('migrations')
            .insert({ name: migrationName, executed_at: new Date().toISOString() })

          if (error) throw error
        } catch (error) {
          console.error('Error creating migration:', error)
          throw error
        }
      },

      // Additional required methods
      count: async ({ collection, where }: { collection: string; where?: Where }): Promise<{ totalDocs: number }> => {
        try {
          const { count, error } = await client
            .from(collection)
            .select('*', { count: 'exact', head: true })
            .match(where || {})

          if (error) throw error
          return { totalDocs: count ?? 0 }
        } catch (error) {
          console.error('Error counting documents:', error)
          throw error
        }
      },

      migrate: async (): Promise<void> => {
        try {
          await executeMigrations({ collection: 'all' });
        } catch (error) {
          console.error('Error executing migration:', error)
          throw error
        }
      },

      migrateDown: async (): Promise<void> => {
        try {
          // For now, we'll just clear the migrations table since we don't have down migrations
          const { error } = await client
            .from('migrations')
            .delete()
            .neq('name', '');
          if (error) throw error;
        } catch (error) {
          console.error('Error rolling back migration:', error)
          throw error
        }
      },

      migrateFresh: async (): Promise<void> => {
        try {
          const { error } = await client
            .from('migrations')
            .delete()
            .neq('name', '')

          if (error) throw error
        } catch (error) {
          console.error('Error clearing migrations:', error)
          throw error
        }
      },

      migrateRefresh: async (): Promise<void> => {
        await adapter.migrateFresh();
        await adapter.migrate();
      },

      migrateReset: async (): Promise<void> => {
        await adapter.migrateFresh();
        await adapter.migrate();
      },

      migrateStatus: async (): Promise<void> => {
        try {
          const { data, error } = await client
            .from('migrations')
            .select('name, executed_at')
            .order('executed_at', { ascending: true })

          if (error) throw error
          if (data) {
            console.table(data)
          }
        } catch (error) {
          console.error('Error getting migration status:', error)
          throw error
        }
      },

      beginTransaction: async (): Promise<string | number | null> => {
        // Supabase doesn't support explicit transactions through the client
        // Return null to indicate no transaction support
        return null
      },

      commitTransaction: async (): Promise<void> => {
        // Supabase doesn't support explicit transactions through the client
      },

      rollbackTransaction: async (): Promise<void> => {
        // Supabase doesn't support explicit transactions through the client
      }
    }

    return adapter
  }
}
