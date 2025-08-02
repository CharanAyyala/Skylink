import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { UrlForm as UrlFormType } from '@/types/url-shortener';

interface UrlFormProps {
  form: UrlFormType;
  onUpdate: (form: UrlFormType) => void;
  onRemove: () => void;
  canRemove: boolean;
  errors?: {
    longUrl?: string;
    validity?: string;
    customShortcode?: string;
  };
}

export const UrlForm = ({ form, onUpdate, onRemove, canRemove, errors }: UrlFormProps) => {
  const handleChange = (field: keyof UrlFormType, value: string | number) => {
    onUpdate({ ...form, [field]: value });
  };

  return (
    <Card className="bg-gradient-card border border-accent shadow-sky transition-all duration-200 hover:shadow-glow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">URL #{form.id}</h3>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`longUrl-${form.id}`} className="text-sm font-medium text-foreground">
              Long URL *
            </Label>
            <Input
              id={`longUrl-${form.id}`}
              type="url"
              placeholder="https://example.com/very-long-url"
              value={form.longUrl}
              onChange={(e) => handleChange('longUrl', e.target.value)}
              className={`mt-1 ${errors?.longUrl ? 'border-destructive' : ''}`}
            />
            {errors?.longUrl && (
              <p className="text-sm text-destructive mt-1">{errors.longUrl}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`validity-${form.id}`} className="text-sm font-medium text-foreground">
                Validity (minutes)
              </Label>
              <Input
                id={`validity-${form.id}`}
                type="number"
                min="1"
                placeholder="30"
                value={form.validity || ''}
                onChange={(e) => handleChange('validity', parseInt(e.target.value) || 30)}
                className={`mt-1 ${errors?.validity ? 'border-destructive' : ''}`}
              />
              {errors?.validity && (
                <p className="text-sm text-destructive mt-1">{errors.validity}</p>
              )}
            </div>

            <div>
              <Label htmlFor={`shortcode-${form.id}`} className="text-sm font-medium text-foreground">
                Custom Shortcode (optional)
              </Label>
              <Input
                id={`shortcode-${form.id}`}
                type="text"
                placeholder="my-link"
                value={form.customShortcode}
                onChange={(e) => handleChange('customShortcode', e.target.value)}
                className={`mt-1 ${errors?.customShortcode ? 'border-destructive' : ''}`}
              />
              {errors?.customShortcode && (
                <p className="text-sm text-destructive mt-1">{errors.customShortcode}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
