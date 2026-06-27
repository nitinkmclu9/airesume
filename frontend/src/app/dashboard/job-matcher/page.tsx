'use client';

import { useEffect, useState } from 'react';
import { Briefcase, Loader2, DollarSign, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resumeAPI } from '@/lib/api';
import { Resume, JobMatch } from '@/types';
import { toast } from 'sonner';
import { cn, getScoreColor } from '@/lib/utils';

export default function JobMatcherPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => {
      setResumes(data.resumes);
      if (data.resumes.length > 0) setSelected(data.resumes[0]._id);
    });
  }, []);

  const match = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await resumeAPI.jobMatch(selected);
      setJobs(data.jobs);
      toast.success('Job matches found!');
    } catch {
      toast.error('Job matching failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Job Matcher</h2>
          <p className="text-muted-foreground">Find roles that match your skills and experience</p>
        </div>
        <div className="flex gap-3">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm">
            {resumes.map((r) => <option key={r._id} value={r._id}>{r.fileName}</option>)}
          </select>
          <Button onClick={match} disabled={loading || !selected}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
            Find Matches
          </Button>
        </div>
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <Card key={i} className="hover:border-indigo-500/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                  </div>
                  <div className={cn('text-2xl font-bold', getScoreColor(job.matchPercentage))}>
                    {job.matchPercentage}%
                  </div>
                </div>
                <Progress value={job.matchPercentage} className="mb-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <DollarSign className="w-4 h-4" />
                  {job.salaryRange}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Target className="w-3 h-3" /> Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Upload a resume and click Find Matches to discover suitable roles</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
