import { Injectable, inject, signal } from '@angular/core';
import { ChromeAiService } from './chrome-ai.service';

export type ImprovementType = 'grammar' | 'polish' | 'elaborate' | 'shorten' | 'hashtags';

export interface TextSuggestion {
  id: string;
  text: string;
  selected: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TextImprovementService {
  private chromeAi = inject(ChromeAiService);
  
  readonly isProcessing = signal<boolean>(false);
  readonly currentOperation = signal<ImprovementType | null>(null);

  private getPrompt(text: string, type: ImprovementType, platform?: string): string {
    const platformContext = this.getPlatformContext(platform);
    
    const prompts: Record<ImprovementType, string> = {
      grammar: `Fix all grammar, spelling, and punctuation errors in the following text${platformContext}. Provide 3 different variations, each separated by "---OPTION---". Format each option as plain text without any markdown formatting or explanations:\n\n${text}`,
      
      polish: `Optimize this text for ${platform || 'social media'}${platformContext}. Create 3 variations optimized for maximum engagement, each separated by "---OPTION---". Use hooks, power words, and proven engagement tactics. Format as plain text without markdown:\n\n${text}`,
      
      elaborate: `Expand this text for ${platform || 'social media'}${platformContext}. Create 3 variations with different detail levels optimized for engagement. Use storytelling, relatable examples, and emotional connection. Separate with "---OPTION---". Plain text only:\n\n${text}`,
      
      shorten: `Make this ultra-concise for ${platform || 'social media'}${platformContext}. Create 3 punchy variations that grab attention immediately. Use power words, remove fluff, keep only what drives engagement. Separate with "---OPTION---". Plain text only:\n\n${text}`,
      
      hashtags: `Generate 5-10 trending, high-engagement hashtags for this ${platform || 'social media'} post. Focus on discoverability and current trends. Return ONLY hashtags separated by spaces:\n\n${text}`
    };

    return prompts[type];
  }

  private getPlatformContext(platform?: string): string {
    const contexts: Record<string, string> = {
      twitter: ' for Twitter/X (keep it punchy, use threads if needed, maximize retweets)',
      bluesky: ' for Bluesky (conversational, authentic, community-focused)',
      linkedin: ' for LinkedIn (professional but human, thought leadership, value-driven)',
      facebook: ' for Facebook (friendly, shareable, conversation-starting)'
    };
    
    return platform && contexts[platform] ? contexts[platform] : '';
  }

  async improveText(text: string, type: ImprovementType, platform?: string): Promise<TextSuggestion[]> {
    if (!text.trim()) {
      throw new Error('Please enter some text first');
    }

    this.isProcessing.set(true);
    this.currentOperation.set(type);

    try {
      const prompt = this.getPrompt(text, type, platform);
      let result = '';

      // Use the existing Chrome AI service
      const stream = this.chromeAi.analyzeText(prompt);

      for await (const chunk of stream) {
        result += chunk;
      }

      // Parse multiple options separated by ---OPTION---
      const options = result.split('---OPTION---')
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0);

      // If no options separator found, treat entire result as single option
      const suggestions: TextSuggestion[] = options.length > 0 
        ? options.map((text, index) => ({
            id: `${type}-${Date.now()}-${index}`,
            text: text.trim(),
            selected: index === 0 // First option selected by default
          }))
        : [{
            id: `${type}-${Date.now()}-0`,
            text: result.trim(),
            selected: true
          }];

      return suggestions;
    } catch (error: any) {
      console.error('Text improvement failed:', error);
      throw new Error(error?.message || 'Failed to improve text. Please try again.');
    } finally {
      this.isProcessing.set(false);
      this.currentOperation.set(null);
    }
  }

  async generateHashtags(text: string, platform?: string): Promise<string[]> {
    const suggestions = await this.improveText(text, 'hashtags', platform);
    // Parse hashtags from all suggestions
    const allTags = suggestions
      .map(s => s.text)
      .join(' ')
      .split(/\s+/)
      .filter((tag: string) => tag.startsWith('#'))
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 1);
    
    // Return unique hashtags
    return [...new Set(allTags)];
  }
}
