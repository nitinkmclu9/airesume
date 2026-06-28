'use client';

import { useEffect, useState } from 'react';
import { PenLine, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resumeAPI } from '@/lib/api';
import { Resume } from '@/types';
import { toast } from 'sonner';

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => {
      setResumes(data.resumes);
      if (data.resumes.length > 0) setSelected(data.resumes[0]._id);
    });
  }, []);

  const generate = async () => {
    if (!selected || !jobTitle || !company) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await resumeAPI.coverLetter(selected, jobTitle, company);
      setCoverLetter(data.coverLetter);
      toast.success('Cover letter generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Cover Letter Generator</h2>
        <p className="text-muted-foreground">Generate tailored cover letters based on your resume</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm">
            {resumes.map((r) => <option key={r._id} value={r._id}>{r.fileName}</option>)}
          </select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Job Title (e.g. Software Engineer)" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Input placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
            Generate Cover Letter
          </Button>
        </CardContent>
      </Card>

      {coverLetter && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Cover Letter</CardTitle>
            <Button size="sm" variant="secondary" onClick={copy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-xl bg-white/5 whitespace-pre-wrap text-sm leading-relaxed">{coverLetter}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
