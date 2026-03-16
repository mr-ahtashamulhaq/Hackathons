import React, { useState } from 'react';
import { Wind, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import BreathingCircle from '@/components/breathing/BreathingCircle';

const tips = [
  "Focus on your breathing to reduce cortisol levels during labor",
  "Slow breathing can help manage pain between contractions",
  "Practice daily to build muscle memory for labor day",
  "Breathe through your nose when inhaling, mouth when exhaling",
];

export default function Breathing() {
  const [technique, setTechnique] = useState('calm');
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold">Breathe</h1>
          <p className="text-xs text-muted-foreground">Guided exercises</p>
        </div>
      </div>

      <div className="px-5 space-y-6">
        <Tabs value={technique} onValueChange={setTechnique}>
          <TabsList className="w-full grid grid-cols-3 h-11 rounded-xl">
            <TabsTrigger value="calm" className="rounded-lg text-xs">Calming</TabsTrigger>
            <TabsTrigger value="labor" className="rounded-lg text-xs">Labor</TabsTrigger>
            <TabsTrigger value="quick" className="rounded-lg text-xs">Box</TabsTrigger>
          </TabsList>
        </Tabs>

        <BreathingCircle technique={technique} />

        <Card className="p-4 bg-primary/5 border-primary/10">
          <h4 className="font-heading font-semibold text-sm mb-2">💡 Tip</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tips[Math.floor(Math.random() * tips.length)]}
          </p>
        </Card>
      </div>
    </div>
  );
}