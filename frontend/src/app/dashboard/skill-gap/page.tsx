'use client';

import { useEffect, useState } from 'react';
import { Brain, Loader2, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resumeAPI } from '@/lib/api';
import { Resume } from '@/types';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst'];

export default function SkillGapPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [loading, setLoading] = useState(false);
  const [skillGap, setSkillGap] = useState<{
    current: string[];
    missing: string[];
    recommended: string[];
    matchPercentage: number;
    skillLevels: { skill: string; level: number }[];
  } | null>(null);

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => {
      setResumes(data.resumes);
      if (data.resumes.length > 0) setSelected(data.resumes[0]._id);
    });
  }, []);

  const analyze = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await resumeAPI.skillGap(selected, targetRole);
      setSkillGap(data.skillGap);
      toast.success('Skill gap analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Skill Gap Analysis</h2>
        <p className="text-muted-foreground">Compare your skills against target job roles</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm flex-1">
              {resumes.map((r) => <option key={r._id} value={r._id}>{r.fileName}</option>)}
            </select>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm flex-1">
              {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <Button onClick={analyze} disabled={loading || !selected}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {skillGap && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">{skillGap.matchPercentage}%</div>
                <p className="text-sm text-muted-foreground">Role Match</p>
                <Progress value={skillGap.matchPercentage} className="mt-4" />
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader><CardTitle>Skill Levels</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={skillGap.skillLevels}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="level" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Current Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillGap.current.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Minus className="w-5 h-5 text-red-400" /> Missing Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillGap.missing.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-indigo-400" /> Recommended</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillGap.recommended.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
