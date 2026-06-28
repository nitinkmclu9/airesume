'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resumeAPI } from '@/lib/api';
import { Resume, InterviewQuestion } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function InterviewPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<{
    technical: InterviewQuestion[];
    behavioral: InterviewQuestion[];
    hr: InterviewQuestion[];
  } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => {
      setResumes(data.resumes);
      if (data.resumes.length > 0) setSelected(data.resumes[0]._id);
    });
  }, []);

  const generate = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await resumeAPI.interview(selected, difficulty);
      setQuestions(data.questions);
      toast.success('Interview questions generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'technical' as const, label: 'Technical Questions', color: 'text-indigo-400' },
    { key: 'behavioral' as const, label: 'Behavioral Questions', color: 'text-violet-400' },
    { key: 'hr' as const, label: 'HR Questions', color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Interview Preparation</h2>
        <p className="text-muted-foreground">Practice with AI-generated interview questions tailored to your resume</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm flex-1">
              {resumes.map((r) => <option key={r._id} value={r._id}>{r.fileName}</option>)}
            </select>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <Button key={d} variant={difficulty === d ? 'default' : 'secondary'} size="sm" onClick={() => setDifficulty(d)} className="capitalize">{d}</Button>
              ))}
            </div>
            <Button onClick={generate} disabled={loading || !selected}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {questions && categories.map(({ key, label, color }) => (
        <Card key={key}>
          <CardHeader><CardTitle className={color}>{label}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {questions[key]?.map((q, i) => {
              const id = `${key}-${i}`;
              const isOpen = expanded === id;
              return (
                <div key={id} className="rounded-xl border border-white/10 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : id)}
                  >
                    <span className="text-sm font-medium pr-4">Q{i + 1}: {q.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                      <div>
                        <p className="text-xs font-semibold text-emerald-400 mb-1">Suggested Answer</p>
                        <p className="text-sm text-muted-foreground">{q.answer}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-indigo-400 mb-1">Explanation</p>
                        <p className="text-sm text-muted-foreground">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
