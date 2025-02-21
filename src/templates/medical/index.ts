import { medicalTheme } from './theme';
import { MedicalSiteConfig } from './template';

// Core template exports
export { createMedicalTemplate } from './template';
export type { MedicalSiteConfig } from './template';

// Theme
export { medicalTheme } from './theme';

// Components
export { default as AppointmentScheduler } from './components/AppointmentScheduler';
export type { AppointmentSchedulerProps } from './components/AppointmentScheduler';

// Example implementations
export { pediatricianSite } from './examples/pediatrician';

// Helper types
export interface MedicalPageSection {
  type: string;
  props: Record<string, any>;
}

export interface MedicalPage {
  path: string;
  sections: MedicalPageSection[];
}

export interface MedicalSite {
  theme: typeof medicalTheme;
  config: MedicalSiteConfig;
  pages: Record<string, MedicalPage>;
}
