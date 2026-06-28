'use client';

import { Layout, Download, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const templates = [
  { name: 'Modern Professional', category: 'Tech', rating: 4.8, color: 'from-indigo-500 to-violet-600' },
  { name: 'Clean Minimalist', category: 'General', rating: 4.7, color: 'from-emerald-500 to-teal-600' },
  { name: 'Creative Designer', category: 'Design', rating: 4.6, color: 'from-pink-500 to-rose-600' },
  { name: 'Executive Classic', category: 'Management', rating: 4.9, color: 'from-amber-500 to-orange-600' },
  { name: 'Data Scientist', category: 'Data', rating: 4.7, color: 'from-blue-500 to-cyan-600' },
  { name: 'Fresh Graduate', category: 'Entry Level', rating: 4.5, color: 'from-violet-500 to-purple-600' },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resume Templates</h2>
        <p className="text-muted-foreground">Professional ATS-friendly templates for every career stage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.name} className="group hover:border-indigo-500/30 transition-all overflow-hidden">
            <div className={`h-48 bg-gradient-to-br ${template.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
              <Layout className="w-16 h-16 text-white/50" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">{template.category}</p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {template.rating}
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="w-full mt-4"
                onClick={() => toast.success(`${template.name} template selected! Use Resume Analyzer to apply.`)}
              >
                <Download className="w-4 h-4" /> Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
