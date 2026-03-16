import React from 'react';
import { AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmergencyBanner() {
  return (
    <div className="mx-5 mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive">Emergency?</p>
          <p className="text-xs text-destructive/80">If you or your baby are in danger, call 911 immediately</p>
        </div>
        <a href="tel:911">
          <Button size="sm" variant="destructive" className="rounded-xl gap-1.5 flex-shrink-0">
            <Phone className="w-3.5 h-3.5" />
            911
          </Button>
        </a>
      </div>
    </div>
  );
}