'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Brain, Clock, Zap, Shield, ArrowRight, 
  CheckCircle2, ChevronDown, ChevronUp, Play, FileText, 
  Layers, Flame, Trophy, Award, Check
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onEnterGuestMode: () => void;
}

export default function LandingPage({
  onOpenAuth,
  onEnterGuestMode,
}: LandingPageProps) {
  // Interactive demo card state
  const [demoFlipped, setDemoFlipped] = useState(false);
  const [demoRating, setDemoRating] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Is Alwinyah really 100% free to use?',
      a: 'Yes, 100% free! Alwinyah runs on free-tier serverless cloud infrastructure with Google Gemini AI. There are no paywalls, hidden fees, or credit cards required.',
    },
    {
      q: 'How does the AI PDF Scanner work?',
      a: 'Your PDF text is safely extracted directly in your browser and processed by Google Gemini models using our specialized academic filter. It filters out chapter headers, table of contents, and textbook fluff—producing pure, clinical-grade active recall questions.',
    },
    {
      q: 'What is the SM-2 Spaced Repetition Algorithm?',
      a: 'SM-2 (SuperMemo-2) is the gold standard spaced repetition algorithm. It measures how easily you recall each answer and dynamically calculates the ideal interval (e.g. 1 day, 3 days, 7 days) so you review cards right before you would naturally forget them.',
    },
    {
      q: 'How does user account creation and email verification work?',
      a: 'When you sign up, an activation link is automatically sent to your email inbox. Once you click the link, your account is activated and your flashcard decks will automatically sync to the cloud across all your devices.',
    },
    {
      q: 'Can I try Alwinyah without signing up first?',
      a: 'Yes! Click "Try Interactive Demo" to explore our full study hub in Guest Mode. When you are ready to save your decks permanently, you can create a free verified account anytime.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#18202d] text-white selection:bg-amber-400 selection:text-zinc-950 font-poppins">
      
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#18202d]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm border border-white/10">
              <BookOpen className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Alwinyah</span>
              <span className="ml-2 hidden rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/20 sm:inline">
                AI Flashcards
              </span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden items-center gap-7 md:flex text-xs font-semibold text-white/70">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#preview" className="hover:text-white transition">Interactive Demo</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="rounded-full px-4 py-2 text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-950 shadow-md hover:bg-white/90 active:scale-95 transition cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        
        {/* Soft background ambient gradient rings */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-8">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md border border-white/10 shadow-sm mb-6 animate-in fade-in duration-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Spaced Repetition & Browser-Native PDF Parsing</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white max-w-4xl mx-auto leading-[1.15]">
            Turn Lecture Slides and PDFs into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
              Active Recall Flashcards
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Formatting flashcards by hand takes hours. Drop in your course notes, slides, or clinical papers. Alwinyah extracts definitions and mechanisms, then schedules daily reviews so you never forget them.
          </p>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-xl hover:bg-white/90 active:scale-95 transition cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onEnterGuestMode}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/15 backdrop-blur-md border border-white/10 active:scale-95 transition cursor-pointer"
            >
              <Play className="h-4 w-4 text-amber-300 fill-amber-300" />
              <span>Try Interactive Demo</span>
            </button>
          </div>

          {/* Micro value badges */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Works offline & in browser
            </span>
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE PREVIEW SHOWCASE */}
      <section id="preview" className="relative py-12 px-4 sm:px-8 border-t border-white/10 bg-[#161c28]">
        <div className="mx-auto max-w-5xl">
          
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
              Interactive preview
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              How study sessions work
            </h3>
            <p className="mt-1 text-xs text-white/60">
              Flip the card to test recall, then rate difficulty to adjust the SM-2 interval.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: AI Scanner Preview Card */}
            <div className="lg:col-span-5 rounded-3xl bg-[#222c3d] p-6 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-300" />
                  <span className="text-xs font-bold text-white">Input Document</span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  9 Pages Parsed
                </span>
              </div>

              <div className="rounded-2xl bg-black/20 p-4 border border-white/5 space-y-2">
                <p className="text-[11px] font-semibold text-amber-200">
                  Status-Asthmaticus-Module.pdf
                </p>
                <p className="text-xs text-white/60 line-clamp-3">
                  "Status asthmaticus is a severe, life-threatening asthma exacerbation that does not respond to standard initial bronchodilator therapy. Key pathophysiology involves acute airway obstruction, mucous plugging, and air trapping..."
                </p>
              </div>

              <div className="rounded-2xl bg-amber-500/10 p-3.5 border border-amber-400/20 text-xs text-white/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Gemini AI Clean Processing</span>
                </div>
                <p className="text-[11px] text-white/60">
                  Automatically omitted presentation headers and slide numbers, extracting 12 high-yield clinical cards.
                </p>
              </div>
            </div>

            {/* Right: Live Interactive Flip Card */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div 
                onClick={() => setDemoFlipped(!demoFlipped)}
                className="w-full max-w-lg min-h-[260px] cursor-pointer rounded-3xl bg-gradient-to-br from-[#253043] to-[#1e2736] p-7 border border-white/15 shadow-2xl transition-all duration-300 hover:border-amber-400/40 relative flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1 font-bold text-amber-200 border border-white/10">
                    Clinical Medicine • Card 1 of 12
                  </span>
                  <span className="text-[11px] text-white/50 font-medium">
                    {demoFlipped ? 'Click to show question' : 'Click card to flip'}
                  </span>
                </div>

                {/* Card Content */}
                <div className="my-6">
                  {!demoFlipped ? (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80">Question</span>
                      <h4 className="mt-1 text-base sm:text-lg font-bold text-white leading-snug">
                        What is the defining clinical characteristic of Status Asthmaticus?
                      </h4>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-200">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Answer & Explanation</span>
                      <p className="mt-1 text-sm font-semibold text-white/95 leading-relaxed">
                        A severe, acute asthma exacerbation refractory to standard initial bronchodilator (SABA) therapy, requiring immediate escalated intervention.
                      </p>
                      <p className="mt-2 text-xs text-white/60 italic">
                        Tip: Look for pulsus paradoxus and inability to speak in full sentences.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer / SRS Buttons */}
                <div className="pt-3 border-t border-white/10">
                  {demoFlipped ? (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDemoRating('Again'); }}
                        className={`rounded-xl py-1.5 text-[11px] font-bold transition ${
                          demoRating === 'Again' ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        }`}
                      >
                        Again<br /><span className="text-[9px] opacity-75">&lt;10m</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDemoRating('Hard'); }}
                        className={`rounded-xl py-1.5 text-[11px] font-bold transition ${
                          demoRating === 'Hard' ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                        }`}
                      >
                        Hard<br /><span className="text-[9px] opacity-75">1d</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDemoRating('Good'); }}
                        className={`rounded-xl py-1.5 text-[11px] font-bold transition ${
                          demoRating === 'Good' ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                        }`}
                      >
                        Good<br /><span className="text-[9px] opacity-75">3d</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDemoRating('Easy'); }}
                        className={`rounded-xl py-1.5 text-[11px] font-bold transition ${
                          demoRating === 'Easy' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                      >
                        Easy<br /><span className="text-[9px] opacity-75">7d</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-xs font-semibold text-white/50">
                      Tap card or spacebar to reveal answer
                    </div>
                  )}
                </div>
              </div>

              {demoRating && (
                <p className="mt-3 text-xs text-amber-200 animate-in fade-in">
                  ✓ Spaced repetition scheduled next review based on your rating!
                </p>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURES BENTO GRID */}
      <section id="features" className="py-20 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl">
          
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
              Core capabilities
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-white">
              Built for high-volume studying
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-white/60 max-w-lg mx-auto">
              Everything you need to memorize dense technical or medical material without the friction of manual card entry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Feature 1 */}
            <div className="md:col-span-2 rounded-3xl bg-[#222c3d]/70 p-7 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/20 mb-5">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Browser-Native Document Parsing</h4>
              <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
                Upload course syllabi, lecture slides, or dense clinical research papers. Text is extracted directly in your browser and distilled into focused, high-yield flashcard decks without fluff.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-amber-200/90">
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">In-Browser Extraction</span>
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">No File Storage Overhead</span>
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Clean Mechanism Cards</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl bg-[#222c3d]/70 p-7 border border-white/10 backdrop-blur-md hover:border-white/20 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-5">
                <Brain className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">SM-2 Spaced Repetition</h4>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                Reviews are scheduled dynamically based on your ease rating. Hard cards reappear quickly; mastered cards space out over weeks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl bg-[#222c3d]/70 p-7 border border-white/10 backdrop-blur-md hover:border-white/20 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-5">
                <Layers className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Multiple Study Modes</h4>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                Test yourself with traditional flip cards, multiple-choice drills with realistic distractors, and cloze fill-in-the-blank prompts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 rounded-3xl bg-[#222c3d]/70 p-7 border border-white/10 backdrop-blur-md hover:border-white/20 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/20 mb-5">
                <Flame className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Daily Targets & Habit Tracking</h4>
              <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
                Stay consistent with daily card goals, streak tracking, and XP progression. Short daily study intervals build lasting recall far better than cramming.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  <Flame className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                  <span>Streak Tracking</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  <Trophy className="h-3.5 w-3.5 text-amber-200" />
                  <span>Daily Goals</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  <Shield className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Cloud Sync</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-4 sm:px-8 border-t border-white/10 bg-[#161c28]">
        <div className="mx-auto max-w-5xl">
          
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
              Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              From notes to scheduled reviews
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="rounded-3xl bg-[#222c3d]/60 p-6 border border-white/10 relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-bold text-amber-300 mb-4">
                01
              </span>
              <h4 className="text-base font-bold text-white">Input your notes</h4>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Drop in a lecture PDF, paste an article URL, or enter notes manually. Extraction runs entirely in your browser.
              </p>
            </div>

            <div className="rounded-3xl bg-[#222c3d]/60 p-6 border border-white/10 relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-bold text-amber-300 mb-4">
                02
              </span>
              <h4 className="text-base font-bold text-white">Extract active-recall cards</h4>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                The model isolates core definitions, pathophysiological mechanisms, and key criteria, discarding slide noise.
              </p>
            </div>

            <div className="rounded-3xl bg-[#222c3d]/60 p-6 border border-white/10 relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-bold text-amber-300 mb-4">
                03
              </span>
              <h4 className="text-base font-bold text-white">Review with spaced repetition</h4>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Review pending cards each day and rate your recall. The SM-2 algorithm manages optimal review intervals.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
              Frequently asked questions
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Questions and answers
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#222c3d]/60 border border-white/10 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-white cursor-pointer hover:bg-white/5 transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-amber-300 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/40 shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-white/70 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. HIGH-CONVERTING BOTTOM CTA */}
      <section className="py-16 px-4 sm:px-8 border-t border-white/10 bg-gradient-to-b from-[#18202d] to-[#121620]">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[#243044] to-[#1b2331] p-8 sm:p-14 text-center border border-white/15 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Start studying without manual card making
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            Create a free account to sync your study decks across devices, or try out the full platform directly in guest mode.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-xs font-bold text-zinc-950 shadow-xl hover:bg-white/90 active:scale-95 transition cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onEnterGuestMode}
              className="w-full sm:w-auto rounded-full bg-white/10 px-8 py-3.5 text-xs font-bold text-white hover:bg-white/15 backdrop-blur-md border border-white/10 transition cursor-pointer"
            >
              Explore as Guest
            </button>
          </div>

          <p className="mt-4 text-[11px] text-white/50">
            Free forever • Instant setup • No credit card required
          </p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-8 text-center text-xs text-white/50">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-300" />
            <span className="font-bold text-white/80">Alwinyah Study Hub</span>
            <span>— Active Recall & AI Flashcards</span>
          </div>
          <div>
            <span>© 2026 Alwinyah. Designed for high-yield learning.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
