import dns from 'dns';
import { promisify } from 'util';
import { DNSRecord } from './types';

const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const resolveCname = promisify(dns.resolveCname);

interface VerificationResult {
  verified: boolean;
  hasSSL: boolean;
  requiredRecords: DNSRecord[];
  errors?: string[];
}

export async function checkDomainVerification(domain: string): Promise<VerificationResult> {
  const errors: string[] = [];
  const requiredRecords: DNSRecord[] = [
    {
      type: 'A',
      name: '@',
      value: process.env.SERVER_IP || '0.0.0.0',
      ttl: 3600,
    },
    {
      type: 'CNAME',
      name: 'www',
      value: domain,
      ttl: 3600,
    },
    {
      type: 'TXT',
      name: '@',
      value: `v=spf1 include:_spf.${domain} -all`,
      ttl: 3600,
    },
  ];

  try {
    // Check A record
    const aRecords = await resolve4(domain);
    if (!aRecords.includes(process.env.SERVER_IP || '0.0.0.0')) {
      errors.push('A record not pointing to correct IP');
    }

    // Check CNAME record
    try {
      const cnameRecords = await resolveCname(`www.${domain}`);
      if (!cnameRecords.includes(domain)) {
        errors.push('www CNAME record not properly configured');
      }
    } catch (error) {
      errors.push('www CNAME record missing');
    }

    // Check TXT records
    try {
      const txtRecords = await resolveTxt(domain);
      const spfRecord = txtRecords.flat().find(record => record.startsWith('v=spf1'));
      if (!spfRecord) {
        errors.push('SPF record missing');
      }
    } catch (error) {
      errors.push('TXT records missing');
    }

    // Check SSL (simple check - can be enhanced)
    let hasSSL = false;
    try {
      const response = await fetch(`https://${domain}`);
      hasSSL = response.ok || response.status === 404; // 404 means domain resolves but page not found
    } catch (error) {
      errors.push('SSL certificate not found or invalid');
    }

    return {
      verified: errors.length === 0,
      hasSSL,
      requiredRecords,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      verified: false,
      hasSSL: false,
      requiredRecords,
      errors: ['Domain does not resolve'],
    };
  }
}

export async function checkAllDomainsVerification(domains: string[]): Promise<Record<string, VerificationResult>> {
  const results: Record<string, VerificationResult> = {};
  
  await Promise.all(
    domains.map(async (domain) => {
      results[domain] = await checkDomainVerification(domain);
    })
  );

  return results;
}
