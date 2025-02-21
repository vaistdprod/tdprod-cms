import { DNSRecord } from './types';

interface CloudflareAPI {
  createDNSRecord(zoneId: string, record: DNSRecord): Promise<void>;
  setupSSLCertificate(zoneId: string, domain: string): Promise<void>;
}

class CloudflareManager implements CloudflareAPI {
  private apiToken: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudflare API error: ${error.errors?.[0]?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async createDNSRecord(zoneId: string, record: DNSRecord): Promise<void> {
    await this.request(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify({
        type: record.type,
        name: record.name,
        content: record.value,
        ttl: record.ttl || 1,
        priority: record.priority,
        proxied: record.proxied ?? true,
      }),
    });
  }

  async setupSSLCertificate(zoneId: string, domain: string): Promise<void> {
    // Enable Universal SSL
    await this.request(`/zones/${zoneId}/ssl/universal/settings`, {
      method: 'PATCH',
      body: JSON.stringify({
        enabled: true,
      }),
    });

    // Set SSL mode to Full
    await this.request(`/zones/${zoneId}/ssl/package/settings`, {
      method: 'PATCH',
      body: JSON.stringify({
        value: 'full',
      }),
    });
  }
}

class ManualDNSManager {
  async setupDNSRecords(domain: string, records: DNSRecord[]): Promise<void> {
    // For manual setup, we just validate the records
    records.forEach(record => {
      if (!record.type || !record.name || !record.value) {
        throw new Error(`Invalid DNS record: ${JSON.stringify(record)}`);
      }
    });
  }

  async setupSSL(domain: string): Promise<void> {
    // For manual setup, we just validate the domain
    if (!domain) {
      throw new Error('Domain is required for SSL setup');
    }
  }
}

class DomainManager {
  private cloudflare?: CloudflareManager;
  private manual: ManualDNSManager;

  constructor() {
    if (process.env.CLOUDFLARE_API_TOKEN) {
      this.cloudflare = new CloudflareManager(process.env.CLOUDFLARE_API_TOKEN);
    }
    this.manual = new ManualDNSManager();
  }

  async setupDNSRecords(domain: string, records: DNSRecord[]): Promise<void> {
    if (this.cloudflare && process.env.CLOUDFLARE_ZONE_ID) {
      for (const record of records) {
        await this.cloudflare.createDNSRecord(process.env.CLOUDFLARE_ZONE_ID, record);
      }
    } else {
      await this.manual.setupDNSRecords(domain, records);
    }
  }

  async setupSSL(domain: string): Promise<void> {
    if (this.cloudflare && process.env.CLOUDFLARE_ZONE_ID) {
      await this.cloudflare.setupSSLCertificate(process.env.CLOUDFLARE_ZONE_ID, domain);
    } else {
      await this.manual.setupSSL(domain);
    }
  }
}

export const manageDomains = new DomainManager();
