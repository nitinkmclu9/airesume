'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, DollarSign, Activity, BarChart3, Trash2, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'logs'>('overview');

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') router.push('/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      adminAPI.stats().then(({ data }) => setStats(data.stats)).catch(() => {});
      adminAPI.users().then(({ data }) => setUsers(data.users)).catch(() => {});
      adminAPI.logs().then(({ data }) => setLogs(data.logs)).catch(() => {});
    }
  }, [user]);

  const updateUser = async (id: string, plan: string) => {
    try {
      await adminAPI.updateUser(id, { plan });
      toast.success('User updated');
      const { data } = await adminAPI.users();
      setUsers(data.users);
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      setUsers(users.filter((u) => u._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  if (authLoading || user?.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-indigo-500 to-violet-500' },
    { label: 'Resumes Analyzed', value: stats?.totalResumes || 0, icon: FileText, color: 'from-emerald-500 to-teal-500' },
    { label: 'Pro Subscribers', value: stats?.proUsers || 0, icon: Shield, color: 'from-violet-500 to-purple-500' },
    { label: 'Revenue', value: `$${stats?.revenue || 0}`, icon: DollarSign, color: 'from-amber-500 to-orange-500' },
  ];

  const planData = [
    { name: 'Free', value: (stats?.freeUsers as number) || 0 },
    { name: 'Pro', value: (stats?.proUsers as number) || 0 },
  ];

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="w-8 h-8 text-indigo-400" /> Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, analytics, and platform settings</p>
        </div>

        <div className="flex gap-2">
          {(['overview', 'users', 'logs'] as const).map((t) => (
            <Button key={t} variant={tab === t ? 'default' : 'secondary'} size="sm" onClick={() => setTab(t)} className="capitalize">{t}</Button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-6">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold">{s.value as string | number}</div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Plan Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {planData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {((stats?.recentActivity as Array<Record<string, unknown>>) || []).slice(0, 8).map((log, i) => (
                      <div key={i} className="flex justify-between text-sm p-2 rounded-lg bg-white/5">
                        <span>{log.action as string}</span>
                        <span className="text-muted-foreground text-xs">{formatDate(log.createdAt as string)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {tab === 'users' && (
          <Card>
            <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Plan</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id as string} className="border-b border-white/5">
                        <td className="p-3">{u.name as string}</td>
                        <td className="p-3 text-muted-foreground">{u.email as string}</td>
                        <td className="p-3">
                          <select
                            value={u.plan as string}
                            onChange={(e) => updateUser(u._id as string, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                          </select>
                        </td>
                        <td className="p-3 capitalize">{u.role as string}</td>
                        <td className="p-3">
                          <Button size="sm" variant="ghost" onClick={() => deleteUser(u._id as string)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'logs' && (
          <Card>
            <CardHeader><CardTitle>Activity Logs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-sm">
                    <div>
                      <span className="font-medium">{(log.userId as Record<string, string>)?.name || 'Unknown'}</span>
                      <span className="text-muted-foreground ml-2">{log.action as string}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt as string)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
