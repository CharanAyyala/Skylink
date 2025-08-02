import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Link2, Zap } from 'lucide-react';
import { UrlForm } from '@/components/UrlForm';
import { ShortenedUrlResult } from '@/components/ShortenedUrlResult';
import { UrlForm as UrlFormType, FormErrors, ShortenedUrl } from '@/types/url-shortener';
import { urlShortenerService } from '@/lib/url-shortener-service';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/Skylink_logo.png';


const UrlShortenerPage = () => {
  const [forms, setForms] = useState<UrlFormType[]>([
    { id: '1', longUrl: '', validity: 30, customShortcode: '' }
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addForm = () => {
    if (forms.length < 5) {
      const newId = (Math.max(...forms.map(f => parseInt(f.id))) + 1).toString();
      setForms([...forms, { id: newId, longUrl: '', validity: 30, customShortcode: '' }]);
    }
  };

  const removeForm = (id: string) => {
    setForms(forms.filter(f => f.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const updateForm = (updatedForm: UrlFormType) => {
    setForms(forms.map(f => f.id === updatedForm.id ? updatedForm : f));
    if (errors[updatedForm.id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[updatedForm.id];
        return newErrors;
      });
    }
  };

  const validateForms = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    forms.forEach(form => {
      const formErrors: any = {};

      if (!form.longUrl.trim()) {
        formErrors.longUrl = 'URL is required';
        hasErrors = true;
      } else if (!urlShortenerService.validateUrl(form.longUrl)) {
        formErrors.longUrl = 'Please enter a valid URL starting with http:// or https://';
        hasErrors = true;
      }

      if (form.validity && form.validity <= 0) {
        formErrors.validity = 'Validity must be a positive number';
        hasErrors = true;
      }

      if (form.customShortcode && !urlShortenerService.validateShortcode(form.customShortcode)) {
        formErrors.customShortcode = 'Shortcode must be 3-20 alphanumeric characters';
        hasErrors = true;
      }

      if (Object.keys(formErrors).length > 0) {
        newErrors[form.id] = formErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateForms()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const filledForms = forms.filter(f => f.longUrl.trim());
      const result = urlShortenerService.shortenUrls(filledForms);

      if (result.errors.length > 0) {
        toast({
          title: "Some URLs failed to shorten",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }

      if (result.success.length > 0) {
        setResults(result.success);
        toast({
          title: "Success!",
          description: `Successfully shortened ${result.success.length} URL(s)`,
        });

        // Reset forms
        setForms([{ id: '1', longUrl: '', validity: 30, customShortcode: '' }]);
        setErrors({});
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shorten URLs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasValidForms = forms.some(f => f.longUrl.trim());

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {/* Hero Section */}
<div className="text-center mb-8">
  <div className="flex items-center justify-center mb-4">
  <img
  src={logo}
  alt="SkyLink Logo"
  className="h-16 w-17 rounded-full"
/>

  </div>
  <h1
  className="text-4xl font-semibold italic text-[#020202] mb-2"
  style={{
    fontFamily: "'Open Sans', sans-serif",
    letterSpacing: '5px'
  }}
>
  SkyLink
</h1>
  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
    Transform your long URLs into beautiful, shareable short links with powerful analytics and customization options.
  </p>
</div>

        {/* Main Form Section */}
        <Card className="mb-8 bg-gradient-card border border-accent shadow-sky">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-foreground">
              <Zap className="w-6 h-6 mr-2 text-primary" />
              Shorten Your URLs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {forms.map((form, index) => (
              <UrlForm
                key={form.id}
                form={form}
                onUpdate={updateForm}
                onRemove={() => removeForm(form.id)}
                canRemove={forms.length > 1}
                errors={errors[form.id]}
              />
            ))}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={addForm}
                disabled={forms.length >= 5}
                className="transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add URL {forms.length < 5 && `(${5 - forms.length} remaining)`}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!hasValidForms || isLoading}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-200 min-w-32"
              >
                {isLoading ? 'Processing...' : 'Shorten URLs'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Your Shortened URLs</h2>
            {results.map(url => (
              <ShortenedUrlResult key={url.id} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlShortenerPage;
