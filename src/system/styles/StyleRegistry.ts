import { ComponentStyle, StyleObject } from '../core/types';

export interface ThemeTokens {
  colors: {
    [key: string]: {
      [shade: string]: string;
    };
  };
  typography: {
    fonts: {
      [key: string]: string;
    };
    sizes: {
      [key: string]: {
        fontSize: string;
        lineHeight: string;
      };
    };
    weights: {
      [key: string]: number;
    };
  };
  spacing: {
    [key: string]: string;
  };
  breakpoints: {
    [key: string]: number;
  };
  shadows: {
    [key: string]: string;
  };
  radii: {
    [key: string]: string;
  };
  transitions: {
    [key: string]: string;
  };
}

export interface StyleDefinition {
  base?: StyleObject;
  variants?: Record<string, StyleObject>;
  states?: Record<string, StyleObject>;
  responsive?: Record<string, StyleObject>;
  modifiers?: Record<string, StyleObject>;
}

export interface ThemeOverrides {
  tokens?: Partial<ThemeTokens>;
  components?: Record<string, StyleDefinition>;
  utilities?: Record<string, Record<string, string>>;
}

class StyleRegistry {
  private static instance: StyleRegistry;
  private themes: Map<string, ThemeTokens>;
  private componentStyles: Map<string, Record<string, StyleDefinition>>;
  private utilities: Map<string, Record<string, Record<string, string>>>;

  private constructor() {
    this.themes = new Map();
    this.componentStyles = new Map();
    this.utilities = new Map();
  }

  public static getInstance(): StyleRegistry {
    if (!StyleRegistry.instance) {
      StyleRegistry.instance = new StyleRegistry();
    }
    return StyleRegistry.instance;
  }

  public registerTheme(id: string, tokens: ThemeTokens): void {
    if (this.themes.has(id)) {
      throw new Error(`Theme with id ${id} is already registered`);
    }
    this.themes.set(id, this.processTokens(tokens));
  }

  public extendTheme(baseId: string, overrides: ThemeOverrides): ThemeTokens {
    const baseTheme = this.themes.get(baseId);
    if (!baseTheme) {
      throw new Error(`Base theme ${baseId} not found`);
    }

    // Deep merge tokens
    const tokens = this.mergeTokens(baseTheme, overrides.tokens || {});

    // Process and store component styles
    if (overrides.components) {
      const themeStyles = this.componentStyles.get(baseId) || {};
      this.componentStyles.set(baseId, {
        ...themeStyles,
        ...overrides.components,
      });
    }

    // Process and store utilities
    if (overrides.utilities) {
      const themeUtilities = this.utilities.get(baseId) || {};
      this.utilities.set(baseId, {
        ...themeUtilities,
        ...overrides.utilities,
      });
    }

    return tokens;
  }

  public getThemeTokens(themeId: string): ThemeTokens {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }
    return theme;
  }

  public getComponentStyle(themeId: string, componentId: string): StyleDefinition | undefined {
    const themeStyles = this.componentStyles.get(themeId);
    return themeStyles?.[componentId];
  }

  public getUtilities(themeId: string): Record<string, Record<string, string>> {
    return this.utilities.get(themeId) || {};
  }

  private processTokens(tokens: ThemeTokens): ThemeTokens {
    // Process and validate tokens
    return {
      colors: this.processColors(tokens.colors),
      typography: this.processTypography(tokens.typography),
      spacing: this.processSpacing(tokens.spacing),
      breakpoints: this.processBreakpoints(tokens.breakpoints),
      shadows: tokens.shadows,
      radii: tokens.radii,
      transitions: tokens.transitions,
    };
  }

  private processColors(colors: ThemeTokens['colors']): ThemeTokens['colors'] {
    const processed: ThemeTokens['colors'] = {};
    
    for (const [key, value] of Object.entries(colors)) {
      // Ensure color values are valid hex, rgb, hsl, etc.
      processed[key] = Object.entries(value).reduce((acc, [shade, color]) => {
        if (!this.isValidColor(color)) {
          throw new Error(`Invalid color value: ${color}`);
        }
        acc[shade] = color;
        return acc;
      }, {} as Record<string, string>);
    }

    return processed;
  }

  private processTypography(typography: ThemeTokens['typography']): ThemeTokens['typography'] {
    return {
      fonts: typography.fonts,
      sizes: Object.entries(typography.sizes).reduce((acc, [key, value]) => {
        acc[key] = {
          fontSize: this.normalizeSize(value.fontSize),
          lineHeight: this.normalizeSize(value.lineHeight),
        };
        return acc;
      }, {} as Record<string, { fontSize: string; lineHeight: string }>),
      weights: typography.weights,
    };
  }

  private processSpacing(spacing: ThemeTokens['spacing']): ThemeTokens['spacing'] {
    return Object.entries(spacing).reduce((acc, [key, value]) => {
      acc[key] = this.normalizeSize(value);
      return acc;
    }, {} as Record<string, string>);
  }

  private processBreakpoints(breakpoints: ThemeTokens['breakpoints']): ThemeTokens['breakpoints'] {
    return Object.entries(breakpoints).reduce((acc, [key, value]) => {
      if (typeof value !== 'number' || value < 0) {
        throw new Error(`Invalid breakpoint value: ${value}`);
      }
      acc[key] = value;
      return acc;
    }, {} as Record<string, number>);
  }

  private mergeTokens(base: ThemeTokens, overrides: Partial<ThemeTokens>): ThemeTokens {
    return {
      colors: {
        ...base.colors,
        ...overrides.colors,
      },
      typography: {
        fonts: {
          ...base.typography.fonts,
          ...overrides.typography?.fonts,
        },
        sizes: {
          ...base.typography.sizes,
          ...overrides.typography?.sizes,
        },
        weights: {
          ...base.typography.weights,
          ...overrides.typography?.weights,
        },
      },
      spacing: {
        ...base.spacing,
        ...overrides.spacing,
      },
      breakpoints: {
        ...base.breakpoints,
        ...overrides.breakpoints,
      },
      shadows: {
        ...base.shadows,
        ...overrides.shadows,
      },
      radii: {
        ...base.radii,
        ...overrides.radii,
      },
      transitions: {
        ...base.transitions,
        ...overrides.transitions,
      },
    };
  }

  private isValidColor(color: string): boolean {
    // Basic color validation
    const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
    const hslRegex = /^hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)$/;
    const hslaRegex = /^hsla\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*,\s*[\d.]+\s*\)$/;

    return (
      hexRegex.test(color) ||
      rgbRegex.test(color) ||
      rgbaRegex.test(color) ||
      hslRegex.test(color) ||
      hslaRegex.test(color)
    );
  }

  private normalizeSize(size: string): string {
    // Convert px, rem, em, etc. to consistent format
    const value = parseFloat(size);
    const unit = size.match(/[a-z]+$/)?.[0] || 'px';
    
    if (isNaN(value)) {
      throw new Error(`Invalid size value: ${size}`);
    }

    return `${value}${unit}`;
  }
}

export const styleRegistry = StyleRegistry.getInstance();
