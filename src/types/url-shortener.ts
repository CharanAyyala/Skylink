export interface UrlForm {
  id: string;
  longUrl: string;
  validity: number; // in minutes
  customShortcode: string;
}

export interface ShortenedUrl {
  id: string;
  longUrl: string;
  shortcode: string;
  createdAt: Date;
  expiresAt: Date;
  clicks: ClickAnalytic[];
}

export interface ClickAnalytic {
  id: string;
  timestamp: Date;
  referrer: string;
  location: string;
}

export interface FormErrors {
  [key: string]: {
    longUrl?: string;
    validity?: string;
    customShortcode?: string;
  };
}