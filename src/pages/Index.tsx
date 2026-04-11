import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, CheckCircle2, Music2, Lightbulb, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Turntable } from '@/components/Turntable';

const features = [
  {
    icon: Music2,
    title: 'Music Selection',
    description:
      'Organize tracks, playlists and library with smart filters for BPM, key, energy and compatibility.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Recommendations',
    description:
      'Get suggestions for the next best track based on mix, style, energy and sound affinity.',
  },
  {
    icon: RefreshCw,
    title: 'Always Updated Library',
    description:
      'Keep control of your selections, discover useful new tracks and prepare more effective sets.',
  },
];

export default function IndexPage() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-[#f7faf8] text-slate-900">
      <main>
        {/* HERO */}
        <section className="border-b border-slate-100 bg-[#f7faf8]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-[#2D6A4F]/15 bg-[#2D6A4F]/5 px-4 py-1.5 text-sm font-semibold text-[#2D6A4F]">
                DJ Selection, done right
              </div>

              <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                Organize Your Music
                <span className="block text-[#2D6A4F]">Like a DJ Pro</span>
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
                Build better playlists, choose the right tracks, find great mix combinations, and keep your library fresh and organized.
              </p>
              <p className="mt-3 max-w-2xl text-xl leading-8 text-[#2D6A4F] italic font-normal">
                Works with VirtualDJ for easy track and playlist Import and Export.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={authenticated ? '/library' : '/auth'}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2D6A4F] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#24563f]"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </div>
            </div>

            {/* Turntable with spinning disc and fixed arm */}
            <div className="flex justify-center lg:justify-end">
              <Turntable />
            </div>
          </div>
        </section>

        {/* 3 CARD subito sotto la hero */}
        <section id="features" className="bg-[#f7faf8] pb-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
                  >
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F]">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-900">{item.title}</h3>
                    <p className="mt-5 text-lg leading-8 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sezione benefits - SENZA disco grande duplicato */}
        <section id="benefits" className="border-y border-slate-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-[#2D6A4F]/15 bg-[#2D6A4F]/5 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#2D6A4F]">
                Portable app
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                Take your music selection everywhere
              </h2>
              <div className="mt-8 space-y-5">
                {[
                  'Quick access to your library',
                  'Playlists and crates always available',
                  'Useful tools to choose the next track',
                  'Clean and optimized experience',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 text-lg text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 flex-none text-[#2D6A4F]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to={authenticated ? '/library' : '/auth'}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2D6A4F] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#24563f]"
                >
                  Start Free
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-[#f7faf8] p-10 text-center shadow-sm">
              <div className="mx-auto max-w-md text-2xl font-semibold text-slate-700">
                Clean, focused and ready for your next set.
              </div>
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="bg-[#f7faf8] py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              Ready to improve your music selection?
            </h2>
            <p className="mt-5 text-xl leading-8 text-slate-600">
              Access your library, organize tracks and build smarter sets.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2D6A4F] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#24563f]"
              >
                Register Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500 lg:px-10">
          © {new Date().getFullYear()} DJSENGINE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
