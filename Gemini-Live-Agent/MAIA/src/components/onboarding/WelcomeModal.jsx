import React, { useState } from 'react';
import { appClient } from '@/lib/app-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2 } from 'lucide-react';

export default function WelcomeModal({ open, onComplete }) {
  const [step, setStep] = useState(1);
  const [momName, setMomName] = useState('');
  const [babyName, setBabyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (momName.trim()) setStep(2);
    } else {
      setIsSubmitting(true);
      await appClient.auth.updateMe({
        mom_name: momName.trim(),
        baby_name: babyName.trim() || 'Baby',
        onboarding_completed: true
      });
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-heading">
            {step === 1 ? 'Welcome to MAIA 💜' : 'One More Thing...'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 
              ? "Let's get to know you better so I can provide personalized care"
              : "Tell me about your little one"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {step === 1 ? (
            <div className="space-y-2">
              <Label htmlFor="momName">What's your name?</Label>
              <Input
                id="momName"
                value={momName}
                onChange={(e) => setMomName(e.target.value)}
                placeholder="Enter your name"
                className="text-base"
                autoFocus
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="babyName">What's your baby's name?</Label>
              <Input
                id="babyName"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder="Enter baby's name (or leave blank)"
                className="text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">You can skip this if you haven't chosen a name yet</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base" 
            disabled={isSubmitting || (step === 1 && !momName.trim())}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : step === 1 ? (
              'Continue'
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}