import { DNSRecord } from './types';

interface VercelAPI {
  addDomain(domain: string): Promise<void>;
  verifyDomain(domain: string): Promise<void>;
}

class VercelManager implements VercelAPI {
  private token: string;
  private projectId: string;
  private teamId?: string;
  private baseUrl = 'https://api.vercel.com';

  constructor(token: string, projectId: string, teamId?: string) {
    this.token = token;
    this.projectId = projectId;
    this.teamId = teamId;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = new URL(endpoint, this.baseUrl);
    if (this.teamId) {
      url.searchParams.append('teamId', this.teamId);
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Vercel API error: ${error.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async addDomain(domain: string): Promise<void> {
    await this.request(`/v10/projects/${this.projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });
  }

  async verifyDomain(domain: string): Promise<void> {
    // Vercel handles SSL automatically once domain is verified
    await this.request(`/v9/projects/${this.projectId}/domains/${domain}/verify`, {
      method: 'POST',
    });
  }

  async getDomainConfiguration(domain: string): Promise<{
    nameservers?: string[];
    aRecord?: string;
    cnameRecord?: string;
  }> {
    const response = await this.request(`/v9/projects/${this.projectId}/domains/${domain}/config`);
    return {
      nameservers: response.nameservers,
      aRecord: response.aRecord,
      cnameRecord: response.cnameRecord,
    };
  }
}

class VercelDomainManager {
  private vercel?: VercelManager;

  constructor() {
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
      this.vercel = new VercelManager(
        process.env.VERCEL_TOKEN,
        process.env.VERCEL_PROJECT_ID,
        process.env.VERCEL_TEAM_ID
      );
    }
  }

  async setupDomain(domain: string): Promise<{
    success: boolean;
    message: string;
    configuration?: {
      nameservers?: string[];
      aRecord?: string;
      cnameRecord?: string;
    };
  }> {
    if (!this.vercel) {
      return {
        success: false,
        message: 'Vercel configuration not found. Please set VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables.',
      };
    }

    try {
      // Add domain to project
      await this.vercel.addDomain(domain);

      // Get domain configuration
      const config = await this.vercel.getDomainConfiguration(domain);

      // Try to verify domain
      try {
        await this.vercel.verifyDomain(domain);
        return {
          success: true,
          message: 'Domain added and verified successfully',
          configuration: config,
        };
      } catch (error) {
        // If verification fails, return configuration for manual setup
        return {
          success: true,
          message: 'Domain added. Please configure your DNS settings with the following configuration:',
          configuration: config,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to setup domain',
      };
    }
  }
}

export const vercelDomains = new VercelDomainManager();
