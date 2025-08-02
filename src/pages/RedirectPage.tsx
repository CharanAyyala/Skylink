import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Home, Clock } from 'lucide-react';
import { urlShortenerService } from '@/lib/url-shortener-service';
import { logger } from '@/lib/logger';

const RedirectPage = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'expired' | 'not-found'>('loading');
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    if (!shortcode) {
      setStatus('not-found');
      return;
    }

    const handleRedirect = async () => {
      try {
        const url = urlShortenerService.getUrlByShortcode(shortcode);
        
        if (!url) {
          setStatus('not-found');
          logger.warn(`Shortcode not found: ${shortcode}`);
          return;
        }

        if (url.expiresAt <= new Date()) {
          setStatus('expired');
          logger.warn(`Attempted to access expired URL: ${shortcode}`);
          return;
        }

        // Record the click
        const referrer = document.referrer || 'direct';
        urlShortenerService.recordClick(shortcode, referrer);

        setTargetUrl(url.longUrl);
        setStatus('redirecting');

        // Add a small delay to show the redirecting message
        setTimeout(() => {
          window.location.href = url.longUrl;
        }, 1500);

      } catch (error) {
        logger.error('Error during redirect', { shortcode, error });
        setStatus('not-found');
      }
    };

    handleRedirect();
  }, [shortcode]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Loading...</h1>
            <p className="text-muted-foreground">Verifying your short link</p>
          </div>
        );

      case 'redirecting':
        return (
          <div className="text-center">
            <div className="bg-gradient-primary p-4 rounded-full shadow-glow w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Redirecting...</h1>
            <p className="text-muted-foreground mb-4">Taking you to your destination</p>
            <p className="text-sm text-primary font-mono break-all bg-muted/50 p-2 rounded">
              {targetUrl}
            </p>
            <div className="mt-6">
              <Button
                asChild
                className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
              >
                <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                  Visit Link Manually
                </a>
              </Button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Link Expired</h1>
            <p className="text-muted-foreground mb-6">
              This short link has expired and is no longer valid.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
              >
                <a href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Create a New Short Link
                </a>
              </Button>
            </div>
          </div>
        );

      case 'not-found':
      default:
        return (
          <div className="text-center">
            <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Link Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The short link you're looking for doesn't exist or may have been removed.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
              >
                <a href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </a>
              </Button>
              <div>
                <Button variant="outline" asChild>
                  <a href="/stats">View Statistics</a>
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border border-accent shadow-sky">
        <CardContent className="p-8">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectPage;