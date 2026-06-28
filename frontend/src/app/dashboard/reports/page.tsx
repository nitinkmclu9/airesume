'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resumeAPI, reportAPI } from '@/lib/api';
import { Resume, Report } from '@/types';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState('');
  const [reportType, setReportType] = useState('full');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => {
      setResumes(data.resumes);
      if (data.resumes.length > 0) setSelected(data.resumes[0]._id);
    });
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await reportAPI.getAll();
      setReports(data.reports);
    } catch { /* empty */ }
  };

  const generate = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      await reportAPI.generate(selected, reportType);
      toast.success('Report generated!');
      fetchReports();
    } catch {
      toast.error('Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const download = async (id: string, format: 'pdf' | 'excel') => {
    try {
      const api = format === 'pdf' ? reportAPI.exportPDF : reportAPI.exportExcel;
      const { data } = await api(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-muted-foreground">Generate and download detailed analysis reports</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Generate New Report</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm flex-1">
              {resumes.map((r) => <option key={r._id} value={r._id}>{r.fileName}</option>)}
            </select>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm">
              <option value="full">Full Report</option>
              <option value="ats">ATS Report</option>
              <option value="skill">Skill Report</option>
            </select>
            <Button onClick={generate} disabled={generating || !selected}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Reports</CardTitle></CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No reports generated yet</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-sm font-medium">{report.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {report.resumeId?.fileName} • {formatDate(report.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => download(report._id, 'pdf')}>
                      <Download className="w-4 h-4" /> PDF
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => download(report._id, 'excel')}>
                      <FileSpreadsheet className="w-4 h-4" /> Excel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
