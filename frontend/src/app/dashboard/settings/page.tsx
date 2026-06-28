'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ name });
      await refreshUser();
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-indigo-400" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input value={user?.email || ''} disabled />
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-400" /> Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <div className="font-semibold capitalize">{user?.plan} Plan</div>
              <div className="text-sm text-muted-foreground">
                {user?.plan === 'free' ? '3 analyses per month' : 'Unlimited access to all features'}
              </div>
            </div>
            {user?.plan === 'free' && (
              <Button size="sm">Upgrade to Pro</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-indigo-400" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Email notifications', 'Analysis complete alerts', 'Weekly progress reports'].map((item) => (
            <label key={item} className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
              <span className="text-sm">{item}</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500" />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-400" /> Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Account verified: {user?.isVerified ? 'Yes' : 'No — check your email'}
          </p>
          <Button variant="secondary" size="sm">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
