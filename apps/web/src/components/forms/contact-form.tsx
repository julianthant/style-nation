'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitContact } from '@/lib/api/inquiries';
import { contactSchema, type ContactFormData } from '@/lib/schemas/contact';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ContactFormProps {
  onSuccess?: () => void;
  className?: string;
  title?: string;
  description?: string;
}

export function ContactForm({
  onSuccess,
  className,
  title = 'Send us a Message',
  description = "We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.",
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      website: '', // Honeypot field
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Check honeypot field (should be empty)
    if (data.website) {
      console.log('Spam detected via honeypot');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Remove honeypot field before sending to API
      const { website, ...contactData } = data;

      await submitContact(contactData);

      setSubmitStatus({
        type: 'success',
        message: "Thank you for your message! We'll get back to you within 24 hours.",
      });

      reset();

      // Call onSuccess callback after showing success message
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });
      console.error('Contact form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </CardHeader>

      <CardContent>
        {submitStatus.type && (
          <Alert
            className={`mb-6 ${submitStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            {submitStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription
              className={submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}
            >
              {submitStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Honeypot field - hidden from users but visible to bots */}
          <input
            type="text"
            {...register('website')}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="Your first name"
                {...register('firstName')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.firstName && (
                <p className="mt-1 text-destructive text-sm">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Your last name"
                {...register('lastName')}
                disabled={isSubmitting}
                className="mt-1"
              />
              {errors.lastName && (
                <p className="mt-1 text-destructive text-sm">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register('email')}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.phone && (
              <p className="mt-1 text-destructive text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="How can we help you?"
              {...register('subject')}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.subject && (
              <p className="mt-1 text-destructive text-sm">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Tell us more about what you're looking for..."
              rows={6}
              {...register('message')}
              disabled={isSubmitting}
              className="mt-1 resize-none"
            />
            {errors.message && (
              <p className="mt-1 text-destructive text-sm">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Sending Message...
              </>
            ) : (
              <>
                <Send className="mr-2 w-4 h-4" />
                Send Message
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-xs text-center">
            We respect your privacy and will never share your information with third parties.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
