'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, BadgeCheck, Brain, FileText, MessageSquare, Briefcase,
  TrendingUp, ArrowRight, UploadCloud, Zap, Shield, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const features = [
  { icon: BadgeCheck, title: 'ATS Resume Analysis', desc: 'Get your ATS compatibility score and detailed feedback.' },
  { icon: Brain, title: 'Skill Gap Detection', desc: 'Identify missing skills for your target role.' },
  { icon: FileText, title: 'Resume Optimization', desc: 'AI-powered suggestions to improve your resume.' },
  { icon: MessageSquare, title: 'Interview Preparation', desc: 'Practice with AI-generated interview questions.' },
  { icon: Briefcase, title: 'Job Matching', desc: 'Find roles that match your skills and experience.' },
  { icon: TrendingUp, title: 'AI Career Suggestions', desc: 'Personalized career path recommendations.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer', text: 'ResumeIQ helped me improve my ATS score from 45 to 89. Got 3 interview calls in a week!', rating: 5 },
  { name: 'Rahul Verma', role: 'Data Analyst', text: 'The skill gap analysis was spot on. I knew exactly what to learn before applying.', rating: 5 },
  { name: 'Ananya Patel', role: 'Frontend Developer', text: 'Interview prep module is a game changer. Felt confident in every interview.', rating: 5 },
];

const faqs = [
  { q: 'How does ATS scoring work?', a: 'Our AI analyzes your resume against industry standards and ATS systems, checking formatting, keywords, and structure.' },
  { q: 'Is my resume data secure?', a: 'Yes. We use enterprise-grade encryption and never share your data with third parties.' },
  { q: 'Can I use it for free?', a: 'Yes! Our free plan includes basic ATS analysis. Pro unlocks all features.' },
  { q: 'What file formats are supported?', a: 'We support PDF, DOCX, and TXT file uploads up to 10MB.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="hero-glow fixed inset-0 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ResumeIQ <span className="text-indigo-400">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link href="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>AI-Powered Resume Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Analyze, Optimize, and<br />
              <span className="gradient-text">Get Hired Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Upload your resume and let AI analyze ATS compatibility, detect skill gaps,
              prepare you for interviews, and match you with perfect job opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  <UploadCloud className="w-5 h-5" />
                  Analyze My Resume
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="glass rounded-3xl p-8 max-w-4xl mx-auto animate-float">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'ATS Score', value: '87', color: 'text-emerald-400' },
                  { label: 'Health Score', value: '82', color: 'text-indigo-400' },
                  { label: 'Interview Ready', value: '91', color: 'text-violet-400' },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[87%] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { value: '12,500+', label: 'Resumes Analyzed' },
            { value: '78%', label: 'ATS Improvement Rate' },
            { value: '65%', label: 'Interview Success Rate' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <div className="text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-muted-foreground mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to land your dream job</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Loved by Job Seekers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground text-center mb-16">Start free, upgrade when you need more</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: 'Free',
                price: '$0',
                features: ['3 Resume Analyses/month', 'Basic ATS Score', 'Skill Gap Overview', '5 Interview Questions'],
              },
              {
                name: 'Pro',
                price: '$19',
                popular: true,
                features: ['Unlimited Analyses', 'Full ATS Report', 'Resume Optimization', 'Job Matching', 'PDF Reports', 'Cover Letter Generator', 'Priority Support'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`glass rounded-2xl p-8 relative ${plan.popular ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button variant={plan.popular ? 'default' : 'secondary'} className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of job seekers who improved their resumes with AI.</p>
          <Link href="/register">
            <Button size="lg">
              <Sparkles className="w-5 h-5" />
              Start Free Analysis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold">ResumeIQ AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ResumeIQ AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
