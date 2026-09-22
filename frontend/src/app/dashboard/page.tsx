'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Heart,
  Brain,
  MessageSquare,
  TrendingUp,
  UploadCloud,
  ArrowRight,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resumeAPI } from '@/lib/api';
import { DashboardStats } from '@/types';
import { cn, getScoreColor, getScoreBg } from '@/lib/utils';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

import AIChat from '@/components/AIChat';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeAPI
      .dashboardStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scoreCards = [
    {
      label: 'ATS Score',
      value: stats?.atsScore || 0,
      icon: BadgeCheck,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Resume Health',
      value: stats?.healthScore || 0,
      icon: Heart,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Interview Ready',
      value: stats?.interviewReadiness || 0,
      icon: MessageSquare,
      color: 'from-violet-500 to-purple-500',
    },
    {
      label: 'Missing Skills',
      value: stats?.missingSkills || 0,
      icon: Brain,
      color: 'from-amber-500 to-orange-500',
      isCount: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s your resume performance overview
            </p>
          </div>

          <Link href="/dashboard/analyzer">
            <Button>
              <UploadCloud className="h-4 w-4" />
              Upload Resume
            </Button>
          </Link>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scoreCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={cn(
                  'border',
                  !card.isCount && getScoreBg(card.value)
                )}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}
                    >
                      <card.icon className="h-5 w-5 text-white" />
                    </div>

                    {!card.isCount && (
                      <span
                        className={cn(
                          'text-2xl font-bold',
                          getScoreColor(card.value)
                        )}
                      >
                        {card.value}%
                      </span>
                    )}

                    {card.isCount && (
                      <span className="text-2xl font-bold text-amber-400">
                        {card.value}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {card.label}
                  </p>

                  {!card.isCount && (
                    <Progress value={card.value} className="mt-3" />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Skill Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400" />
                Skill Analytics
              </CardTitle>
            </CardHeader>

            <CardContent>
              {stats?.skillAnalytics &&
              stats.skillAnalytics.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={stats.skillAnalytics}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />

                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{
                        fill: '#9ca3af',
                        fontSize: 11,
                      }}
                    />

                    <Radar
                      dataKey="level"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  Upload and analyze a resume to see skill analytics
                </div>
              )}
            </CardContent>
          </Card>

          {/* ATS Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                ATS Progress
              </CardTitle>
            </CardHeader>

            <CardContent>
              {stats?.atsProgress &&
              stats.atsProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.atsProgress}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: '#9ca3af',
                        fontSize: 11,
                      }}
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString()
                      }
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fill: '#9ca3af',
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: '#1e1b4b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  Analyze resumes to track ATS progress over time
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Improvements & Recent */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recommended Improvements */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Improvements</CardTitle>
            </CardHeader>

            <CardContent>
              {stats?.improvements &&
              stats.improvements.length > 0 ? (
                <ul className="space-y-3">
                  {stats.improvements.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10">
                        <span className="text-xs text-indigo-400">
                          {i + 1}
                        </span>
                      </div>

                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Upload a resume to get AI-powered improvement
                  suggestions.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Resumes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Resumes</CardTitle>
            </CardHeader>

            <CardContent>
              {stats?.recentResumes &&
              stats.recentResumes.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between rounded-xl bg-white/5 p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {resume.fileName}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {new Date(
                            resume.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      {resume.atsScore !== undefined && (
                        <span
                          className={cn(
                            'text-sm font-bold',
                            getScoreColor(resume.atsScore)
                          )}
                        >
                          {resume.atsScore}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    No resumes uploaded yet
                  </p>

                  <Link href="/dashboard/analyzer">
                    <Button size="sm" variant="secondary">
                      Upload Your First Resume
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Career Assistant */}
      <AIChat />
    </>
  );
}