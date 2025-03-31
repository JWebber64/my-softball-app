export const STATS_LAYOUTS = {
  classic: 'classic',
  modern: 'modern',
  compact: 'compact',
  detailed: 'detailed'
};

export const CARD_STYLE_PRESETS = {
  CLASSIC: {
    name: 'Classic Style',
    borderStyle: {
      type: 'straight',
      effect: 'none',
      color: 'gold'
    },
    backgroundStyle: {
      pattern: 'pinstripe',
      texture: 'clean',
      effect: 'none'
    },
    statsLayout: {
      type: 'classic',
      showDividers: true
    },
    photoStyle: {
      frame: 'standard',
      effect: 'none',
      filter: 'none'
    }
  },
  MODERN: {
    name: 'Modern Style',
    borderStyle: {
      type: 'rounded',
      effect: 'holographic',
      color: 'silver'
    },
    backgroundStyle: {
      pattern: 'gradient',
      texture: 'subtle',
      effect: 'shine'
    },
    statsLayout: {
      type: 'modern',
      showDividers: false
    },
    photoStyle: {
      frame: 'cutout',
      effect: 'spotlight',
      filter: 'none'
    }
  },
  VINTAGE: {
    name: 'Vintage Style',
    borderStyle: {
      type: 'straight',
      effect: 'textured',
      color: 'sepia'
    },
    backgroundStyle: {
      pattern: 'aged',
      texture: 'paper',
      effect: 'none'
    },
    statsLayout: {
      type: 'classic',
      showDividers: true
    },
    photoStyle: {
      frame: 'standard',
      effect: 'none',
      filter: 'sepia'
    }
  }
};

export const STAT_DISPLAY_CONFIG = {
  avg: { label: 'Batting Average', format: 'decimal' },
  hr: { label: 'Home Runs', format: 'number' },
  rbi: { label: 'RBI', format: 'number' },
  runs: { label: 'Runs', format: 'number' },
  sb: { label: 'Stolen Bases', format: 'number' },
  ops: { label: 'On-Base Plus Slugging', format: 'decimal' },
  obp: { label: 'On-Base Percentage', format: 'decimal' },
  slg: { label: 'Slugging Percentage', format: 'decimal' },
  hits: { label: 'Hits', format: 'number' }
};

