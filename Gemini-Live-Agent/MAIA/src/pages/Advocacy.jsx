import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, Heart, Scale, Users, BookOpen, PhoneCall, FileText, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';

const resources = [
  {
    title: 'Black Maternal Health Caucus',
    desc: 'Congressional caucus working to address the Black maternal health crisis',
    url: 'https://blackmaternalhealthcaucus-underwood.house.gov/',
    icon: Scale,
  },
  {
    title: 'National Birth Equity Collaborative',
    desc: 'Creating solutions for Black maternal and infant health',
    url: 'https://birthequity.org/',
    icon: Users,
  },
  {
    title: 'Postpartum Support International',
    desc: 'Help for postpartum depression and anxiety',
    url: 'https://www.postpartum.net/',
    icon: Heart,
  },
  {
    title: 'La Leche League',
    desc: 'Breastfeeding support and resources',
    url: 'https://www.llli.org/',
    icon: BookOpen,
  },
];

const advocacyPhrases = [
  {
    situation: 'When you feel your pain is being dismissed',
    phrases: [
      "I need you to document my reported symptoms in my chart.",
      "I would like a second opinion on this assessment.",
      "Can you explain why you're choosing not to run that test?",
    ]
  },
  {
    situation: 'When requesting specific care',
    phrases: [
      "I've been researching this condition and would like to discuss treatment options.",
      "Can you walk me through the risks and benefits of this procedure?",
      "I'd like my birth plan preferences to be reviewed and noted.",
    ]
  },
  {
    situation: 'During labor and delivery',
    phrases: [
      "I do not consent to that procedure without further explanation.",
      "I would like my support person present for all examinations.",
      "Please explain what you're doing before and during any procedure.",
    ]
  },
  {
    situation: 'For postpartum concerns',
    phrases: [
      "I've been experiencing these symptoms and need a thorough evaluation.",
      "I would like to be screened for postpartum depression.",
      "These symptoms are not normal for me, and I need them taken seriously.",
    ]
  },
];

const rights = [
  "You have the right to informed consent for all procedures",
  "You have the right to refuse any treatment or procedure",
  "You have the right to have a support person present",
  "You have the right to access your complete medical records",
  "You have the right to a second opinion",
  "You have the right to file a complaint about your care",
  "You have the right to culturally competent care",
  "You have the right to an interpreter if needed",
];

export default function Advocacy() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold">Advocacy</h1>
          <p className="text-xs text-muted-foreground">Know your rights</p>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Disparities Awareness */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-primary/5 border-primary/10">
            <h3 className="font-heading font-bold text-lg mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" /> Why This Matters
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Black women in the US are <span className="font-bold text-primary">3-4x more likely</span> to die from pregnancy-related causes than white women. 
              This disparity exists across all income and education levels. Knowledge is power—being informed and prepared 
              can help you advocate for the care you deserve.
            </p>
          </Card>
        </motion.div>

        {/* Patient Rights */}
        <div>
          <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" /> Your Rights
          </h3>
          <Card className="p-4">
            <div className="space-y-2.5">
              {rights.map((right, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground/85">{right}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Advocacy Phrases */}
        <div>
          <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> What to Say
          </h3>
          <Accordion type="single" collapsible>
            {advocacyPhrases.map((section, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  {section.situation}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {section.phrases.map((phrase, j) => (
                      <Card key={j} className="p-3 bg-muted/50">
                        <p className="text-sm italic text-foreground/80">"{phrase}"</p>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Resources
          </h3>
          <div className="space-y-3">
            {resources.map((resource, i) => (
              <a key={i} href={resource.url} target="_blank" rel="noopener noreferrer">
                <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                    <resource.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{resource.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{resource.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Emergency Hotlines */}
        <Card className="p-5 bg-destructive/5 border-destructive/10">
          <h3 className="font-heading font-bold mb-3 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-destructive" /> Crisis Hotlines
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Emergency</p>
                <p className="text-xs text-muted-foreground">Life-threatening situations</p>
              </div>
              <a href="tel:911">
                <Badge variant="destructive" className="cursor-pointer">Call 911</Badge>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Postpartum Support</p>
                <p className="text-xs text-muted-foreground">PSI Helpline</p>
              </div>
              <a href="tel:18009444773">
                <Badge variant="secondary" className="cursor-pointer">1-800-944-4773</Badge>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Crisis Text Line</p>
                <p className="text-xs text-muted-foreground">Text HOME to 741741</p>
              </div>
              <a href="sms:741741&body=HOME">
                <Badge variant="secondary" className="cursor-pointer">Text Now</Badge>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}