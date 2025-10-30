export type ImprovementType = 'grammar' | 'polish' | 'elaborate' | 'shorten' | 'hashtags';

export type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'bluesky';

export interface TextSuggestion {
  readonly id: string;
  readonly text: string;
  readonly selected: boolean;
}

export interface PlatformConfig {
  readonly name: string;
  readonly charLimit: number;
  readonly icon: string;
  readonly tone: string;
}

export interface TextHistory {
  readonly id?: number;
  readonly text: string;
  readonly platform: string;
  readonly timestamp: number;
  readonly characterCount: number;
}

export interface EnhancementOption {
  readonly type: ImprovementType;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}

export const PLATFORMS: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    name: 'Twitter/X',
    charLimit: 280,
    icon: '𝕏',
    tone: 'Concise and engaging',
  },
  bluesky: {
    name: 'Bluesky',
    charLimit: 300,
    icon: '🦋',
    tone: 'Conversational',
  },
  linkedin: {
    name: 'LinkedIn',
    charLimit: 3000,
    icon: '💼',
    tone: 'Professional',
  },
  facebook: {
    name: 'Facebook',
    charLimit: 63206,
    icon: '👥',
    tone: 'Friendly and social',
  },
};

export const ENHANCEMENT_OPTIONS: readonly EnhancementOption[] = [
  {
    type: 'grammar',
    label: 'Grammar Check',
    icon: '✓',
    description: 'Fix grammar, spelling, and punctuation',
  },
  {
    type: 'polish',
    label: 'Polish',
    icon: '✨',
    description: 'Make it more professional and engaging',
  },
  {
    type: 'elaborate',
    label: 'Elaborate',
    icon: '📝',
    description: 'Add more detail and context',
  },
  {
    type: 'shorten',
    label: 'Shorten',
    icon: '✂️',
    description: 'Make it more concise',
  },
] as const;
