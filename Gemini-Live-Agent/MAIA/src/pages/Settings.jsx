import React, { useState, useEffect } from 'react';
import { appClient } from '@/lib/app-client';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft, User, Baby, Mail, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    mom_name: '',
    baby_name: '',
    email: '',
    full_name: ''
  });

  useEffect(() => {
    appClient.auth.me().then(user => {
      setFormData({
        mom_name: user?.mom_name || '',
        baby_name: user?.baby_name || '',
        email: user?.email || '',
        full_name: user?.full_name || ''
      });
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await appClient.auth.updateMe({
      mom_name: formData.mom_name,
      baby_name: formData.baby_name
    });
    toast.success('Settings saved successfully!');
    setIsSaving(false);
  };

  const handleLogout = () => {
    appClient.auth.logout();
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mom_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Name
                </Label>
                <Input
                  id="mom_name"
                  value={formData.mom_name}
                  onChange={(e) => setFormData({ ...formData, mom_name: e.target.value })}
                  placeholder="Enter your name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baby_name" className="flex items-center gap-2">
                  <Baby className="w-4 h-4" />
                  Baby's Name
                </Label>
                <Input
                  id="baby_name"
                  value={formData.baby_name}
                  onChange={(e) => setFormData({ ...formData, baby_name: e.target.value })}
                  placeholder="Enter baby's name"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="h-11 bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customize how MAIA looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Theme</p>
                <p className="text-xs text-muted-foreground">Toggle dark or light mode</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full h-11 gap-2" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}