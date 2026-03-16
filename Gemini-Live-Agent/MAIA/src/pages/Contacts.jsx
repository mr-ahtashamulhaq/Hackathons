import React, { useState } from 'react';
import { appClient } from '@/lib/app-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Phone, Plus, Star, Trash2, UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';

const relationshipLabels = {
  partner: 'Partner', family: 'Family', friend: 'Friend', doula: 'Doula',
  midwife: 'Midwife', doctor: 'Doctor', hospital: 'Hospital', other: 'Other'
};

export default function Contacts() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relationship: 'family', is_emergency: false, notes: '' });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => appClient.entities.Contact.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setOpen(false);
      setForm({ name: '', phone: '', relationship: 'family', is_emergency: false, notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appClient.entities.Contact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const emergencyContacts = contacts.filter(c => c.is_emergency);
  const otherContacts = contacts.filter(c => !c.is_emergency);

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold">Contacts</h1>
            <p className="text-xs text-muted-foreground">Support network</p>
          </div>
        </div>
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Add Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" type="tel" className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Relationship</Label>
                  <Select value={form.relationship} onValueChange={v => setForm({...form, relationship: v})}>
                    <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(relationshipLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Emergency Contact</Label>
                  <Switch checked={form.is_emergency} onCheckedChange={v => setForm({...form, is_emergency: v})} />
                </div>
                <Button 
                  onClick={() => createMutation.mutate(form)} 
                  disabled={!form.name || !form.phone}
                  className="w-full rounded-xl"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Save Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Emergency Contacts */}
        {emergencyContacts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Emergency Contacts
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {emergencyContacts.map(c => (
                  <ContactCard key={c.id} contact={c} onDelete={() => deleteMutation.mutate(c.id)} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Other Contacts */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Contacts</h3>
          <div className="space-y-2">
            {contacts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No contacts yet. Add your support network!</p>
            )}
            <AnimatePresence>
              {otherContacts.map(c => (
                <ContactCard key={c.id} contact={c} onDelete={() => deleteMutation.mutate(c.id)} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ contact, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
      <Card className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">{contact.name?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{contact.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{contact.phone}</span>
            <Badge variant="secondary" className="text-[10px] rounded-md capitalize">{contact.relationship}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a href={`tel:${contact.phone}`}>
            <Button size="icon" variant="ghost" className="rounded-xl h-9 w-9 text-primary hover:bg-primary/10">
              <Phone className="w-4 h-4" />
            </Button>
          </a>
          <Button size="icon" variant="ghost" className="rounded-xl h-9 w-9 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}