export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headings: {
      fontFamily: string;
      weight: number;
    };
    body: {
      fontFamily: string;
      weight: number;
    };
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface Layout {
  header: {
    style: 'standard' | 'minimal' | 'full';
    height: number;
    sticky: boolean;
    components: string[];
  };
  footer: {
    style: 'standard' | 'simple' | 'full';
    sections: string[];
    components: string[];
  };
  navigation: {
    style: 'standard' | 'mega' | 'sidebar';
    depth: number;
    mobile: 'drawer' | 'dropdown';
  };
}

export interface Block {
  blockType: string;
  [key: string]: any;
}

export interface PageLayout {
  blocks: Block[];
}
