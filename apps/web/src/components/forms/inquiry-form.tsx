'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { inquirySchema, type InquiryFormData } from '@/lib/schemas/inquiry';
import { submitInquiry } from '@/lib/api/inquiries';
import type { Car } from '@/lib/types/car';

interface InquiryFormProps {
  car?: Car;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  compact?: boolean; // For smaller layouts
}

export function InquiryForm({ car, onSuccess, onCancel, className, compact = false }: InquiryFormProps) {
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
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: car 
        ? `I'm interested in the ${car.year} ${car.make} ${car.model}. Please contact me with more details about pricing, availability, and financing options.`
        : 'I would like to inquire about your vehicles. Please contact me with more information.',
      carId: car?.id,
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    if (!car?.id) {
      setSubmitStatus({
        type: 'error',
        message: 'Car information is missing. Please try again.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });
    
    try {
      await submitInquiry({
        carId: car.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      });

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.'
      });
      
      reset();
      
      // Call onSuccess callback after showing success message
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit inquiry. Please try again.';
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
      console.error('Inquiry submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full ${compact ? 'max-w-md' : 'max-w-lg'} ${className}`}>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className={compact ? 'text-lg' : undefined}>
            {compact ? 'Quick Inquiry' : 'Inquire About This Vehicle'}
          </CardTitle>
        </div>
        {car && (
          <CardDescription>
            {car.year} {car.make} {car.model} - ${car.price.toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={compact ? 'pt-3' : undefined}>
        {submitStatus.type && (
          <Alert className={`mb-4 ${submitStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {submitStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {submitStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-${compact ? '3' : '4'}`}>
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register('name')}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
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
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
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
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you'd like to know about this vehicle..."
              rows={compact ? 3 : 4}
              {...register('message')}
              disabled={isSubmitting}
              className="mt-1 resize-none"
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className={`flex gap-3 ${compact ? 'pt-2' : 'pt-4'}`}>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>

          {!compact && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              We'll get back to you within 24 hours. Your information is kept confidential.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}