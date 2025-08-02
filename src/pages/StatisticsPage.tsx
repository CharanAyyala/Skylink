import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart3, ExternalLink, ChevronDown, ChevronRight, Clock, MousePointer, MapPin, Calendar } from 'lucide-react';
import { ShortenedUrl } from '@/types/url-shortener';
import { urlShortenerService } from '@/lib/url-shortener-service';

const StatisticsPage = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadUrls = () => {
      setUrls(urlShortenerService.getAllUrls());
    };
    
    loadUrls();
    // Refresh every 30 seconds to show updated click counts
    const interval = setInterval(loadUrls, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleExpanded = (urlId: string) => {
    const newExpanded = new Set(expandedUrls);
    if (newExpanded.has(urlId)) {
      newExpanded.delete(urlId);
    } else {
      newExpanded.add(urlId);
    }
    setExpandedUrls(newExpanded);
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

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + url.clicks.length, 0);
  };

  const getActiveUrls = () => {
    const now = new Date();
    return urls.filter(url => url.expiresAt > now);
  };

  const getExpiredUrls = () => {
    const now = new Date();
    return urls.filter(url => url.expiresAt <= now);
  };

  if (urls.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-gradient-primary p-3 rounded-full shadow-glow w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Statistics</h1>
            <p className="text-xl text-muted-foreground mb-8">
              No shortened URLs found. Create some URLs to see analytics here.
            </p>
            <Button
              asChild
              className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
            >
              <a href="/">Create Your First Short URL</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-primary p-3 rounded-full shadow-glow">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Track performance and insights for all your shortened URLs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border border-accent shadow-sky">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total URLs</p>
                  <p className="text-2xl font-bold text-foreground">{urls.length}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-accent shadow-sky">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold text-foreground">{getTotalClicks()}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <MousePointer className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-accent shadow-sky">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active URLs</p>
                  <p className="text-2xl font-bold text-primary">{getActiveUrls().length}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-accent shadow-sky">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired URLs</p>
                  <p className="text-2xl font-bold text-destructive">{getExpiredUrls().length}</p>
                </div>
                <div className="bg-destructive/10 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* URL List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">All Shortened URLs</h2>
          
          {urls.map((url) => {
            const isExpanded = expandedUrls.has(url.id);
            const isExpired = url.expiresAt <= new Date();
            const shortUrl = `${window.location.origin}/${url.shortcode}`;

            return (
              <Card key={url.id} className="bg-gradient-card border border-accent shadow-sky">
                <Collapsible>
                  <CollapsibleTrigger
                    className="w-full"
                    onClick={() => toggleExpanded(url.id)}
                  >
                    <CardHeader className="hover:bg-accent/50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-left">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-mono font-semibold text-primary">
                                {shortUrl}
                              </p>
                              {isExpired ? (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {url.longUrl}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{url.clicks.length}</p>
                            <p>Clicks</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-foreground">
                              {formatDateTime(url.createdAt)}
                            </p>
                            <p>Created</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-6">
                      <div className="border-t border-border pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* URL Details */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">URL Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Original URL:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-auto p-1 text-primary hover:text-primary"
                                >
                                  <a href={url.longUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Short URL:</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-auto p-1 text-primary hover:text-primary"
                                  disabled={isExpired}
                                >
                                  <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span className="text-foreground">{formatDateTime(url.createdAt)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Expires:</span>
                                <span className={isExpired ? "text-destructive" : "text-foreground"}>
                                  {formatDateTime(url.expiresAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Click Analytics */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">
                              Click Analytics ({url.clicks.length} total)
                            </h4>
                            {url.clicks.length === 0 ? (
                              <p className="text-muted-foreground text-sm">No clicks recorded yet.</p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {url.clicks.map((click) => (
                                  <div
                                    key={click.id}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-foreground">
                                        {formatDateTime(click.timestamp)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-muted-foreground">
                                      <span>{click.referrer}</span>
                                      <MapPin className="w-3 h-3" />
                                      <span>{click.location}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;