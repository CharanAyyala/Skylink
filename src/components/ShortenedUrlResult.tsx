import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Clock } from 'lucide-react';
import { ShortenedUrl } from '@/types/url-shortener';
import { useToast } from '@/hooks/use-toast';

interface ShortenedUrlResultProps {
  url: ShortenedUrl;
}

export const ShortenedUrlResult = ({ url }: ShortenedUrlResultProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shortUrl = `${window.location.origin}/${url.shortcode}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = url.expiresAt <= new Date();

  return (
    <Card className="bg-gradient-card border border-accent shadow-sky">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                Original: {url.longUrl}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <p className="font-mono text-lg text-primary font-semibold">
                  {shortUrl}
                </p>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Expires: {formatDateTime(url.expiresAt)}</span>
              </div>
              <span>Clicks: {url.clicks.length}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={copied || isExpired}
                className="transition-all duration-200"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              
              {!isExpired && (
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
                >
                  <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};