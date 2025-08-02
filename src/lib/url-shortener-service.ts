import { ShortenedUrl, UrlForm, ClickAnalytic } from '@/types/url-shortener';
import { logger } from './logger';

class UrlShortenerService {
  private shortenedUrls: ShortenedUrl[] = [];
  private readonly STORAGE_KEY = 'shortened-urls';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.shortenedUrls = parsed.map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          expiresAt: new Date(url.expiresAt),
          clicks: url.clicks.map((click: any) => ({
            ...click,
            timestamp: new Date(click.timestamp)
          }))
        }));
      }
    } catch (error) {
      logger.error('Failed to load shortened URLs from storage', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.shortenedUrls));
    } catch (error) {
      logger.error('Failed to save shortened URLs to storage', error);
    }
  }

  private generateShortcode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private isShortcodeUnique(shortcode: string): boolean {
    return !this.shortenedUrls.some(url => url.shortcode === shortcode);
  }

  private cleanExpiredUrls() {
    const now = new Date();
    const beforeCount = this.shortenedUrls.length;
    this.shortenedUrls = this.shortenedUrls.filter(url => url.expiresAt > now);
    if (this.shortenedUrls.length !== beforeCount) {
      this.saveToStorage();
      logger.info(`Cleaned ${beforeCount - this.shortenedUrls.length} expired URLs`);
    }
  }

  validateUrl(url: string): boolean {
    try {
      const urlPattern = /^https?:\/\/.+/i;
      return urlPattern.test(url) && Boolean(new URL(url));
    } catch {
      return false;
    }
  }

  validateShortcode(shortcode: string): boolean {
    const alphanumeric = /^[a-zA-Z0-9]+$/;
    return alphanumeric.test(shortcode) && shortcode.length >= 3 && shortcode.length <= 20;
  }

  shortenUrls(forms: UrlForm[]): { success: ShortenedUrl[], errors: string[] } {
    this.cleanExpiredUrls();
    
    const success: ShortenedUrl[] = [];
    const errors: string[] = [];

    for (const form of forms) {
      try {
        // Validate URL
        if (!this.validateUrl(form.longUrl)) {
          errors.push(`Invalid URL format: ${form.longUrl}`);
          continue;
        }

        // Validate validity
        const validity = form.validity || 30;
        if (validity <= 0) {
          errors.push(`Invalid validity period for ${form.longUrl}`);
          continue;
        }

        // Generate or validate shortcode
        let shortcode = form.customShortcode;
        if (shortcode) {
          if (!this.validateShortcode(shortcode)) {
            errors.push(`Invalid shortcode format: ${shortcode}`);
            continue;
          }
          if (!this.isShortcodeUnique(shortcode)) {
            errors.push(`Shortcode already exists: ${shortcode}`);
            continue;
          }
        } else {
          do {
            shortcode = this.generateShortcode();
          } while (!this.isShortcodeUnique(shortcode));
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + validity * 60 * 1000);

        const shortenedUrl: ShortenedUrl = {
          id: form.id,
          longUrl: form.longUrl,
          shortcode,
          createdAt: now,
          expiresAt,
          clicks: []
        };

        this.shortenedUrls.push(shortenedUrl);
        success.push(shortenedUrl);
        
        logger.info(`URL shortened successfully`, {
          longUrl: form.longUrl,
          shortcode,
          expiresAt: expiresAt.toISOString()
        });

      } catch (error) {
        logger.error(`Failed to shorten URL: ${form.longUrl}`, error);
        errors.push(`Failed to process: ${form.longUrl}`);
      }
    }

    if (success.length > 0) {
      this.saveToStorage();
    }

    return { success, errors };
  }

  getUrlByShortcode(shortcode: string): ShortenedUrl | null {
    this.cleanExpiredUrls();
    const url = this.shortenedUrls.find(url => url.shortcode === shortcode);
    
    if (!url) {
      logger.warn(`Shortcode not found: ${shortcode}`);
      return null;
    }

    if (url.expiresAt <= new Date()) {
      logger.warn(`Attempted to access expired URL: ${shortcode}`);
      return null;
    }

    return url;
  }

  recordClick(shortcode: string, referrer: string = 'direct'): boolean {
    const url = this.getUrlByShortcode(shortcode);
    if (!url) return false;

    const click: ClickAnalytic = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      referrer,
      location: 'India / AP' // Mock location as per requirements
    };

    url.clicks.push(click);
    this.saveToStorage();

    logger.info(`Click recorded for shortcode: ${shortcode}`, {
      referrer,
      clickCount: url.clicks.length
    });

    return true;
  }

  getAllUrls(): ShortenedUrl[] {
    this.cleanExpiredUrls();
    return [...this.shortenedUrls].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  clearAllUrls() {
    this.shortenedUrls = [];
    this.saveToStorage();
    logger.info('All URLs cleared');
  }
}

export const urlShortenerService = new UrlShortenerService();