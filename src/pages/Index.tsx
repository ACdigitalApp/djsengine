import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Disc3, LogIn, Music2, Lightbulb, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

function SmallSpinningDisc({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const dim = size === 'sm' ? 'h-28 w-28 md:h-32 md:w-32' : 'h-28 w-28 md:h-32 md:w-32';
  return (
    <div className={`relative flex ${dim} items-center justify-center`}>
      <div className="absolute inset-0 rounded-full animate-[spin_18s_linear_infinite] bg-[radial-gradient(circle_at_center,_#0b0b0b_0%,_#111827_40%,_#0b0b0b_68%,_#000_100%)] shadow-2xl" />
      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-4 ring-slate-200" />
    </div>
  );
}

function BigLogo() {
  return (
    <div className="mx-auto flex w-full max-w-[620px] items-center justify-center">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-emerald-300" />
          <div className="relative flex h-44 w-44 items-center justify-center rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-100 via-white to-slate-100 shadow-xl md:h-52 md:w-52">
            <div className="absolute inset-4 rounded-[22px] bg-gradient-to-br from-emerald-500 via-emerald-300 to-slate-200 opacity-20" />
            <SmallSpinningDisc />
            <div className="absolute left-2 top-8 h-20 w-7 rounded-full border border-slate-500 bg-gradient-to-b from-slate-100 to-slate-600 shadow-md" />
            <div className="absolute right-2 top-8 h-20 w-7 rounded-full border border-slate-500 bg-gradient-to-b from-slate-100 to-slate-600 shadow-md" />
            <div className="absolute left-5 top-2 h-5 w-20 rounded-t-full border border-slate-600 bg-gradient-to-b from-slate-800 to-slate-950 md:left-7 md:w-24" />
          </div>
        </div>

        <div className="text-center md:text-left">
          <div className="text-4xl font-black tracking-tight text-[#204E3A] md:text-6xl">
            DJ&apos;S ENGINE
          </div>
          <div className="mt-2 text-sm text-slate-500 md:text-base">
            Gestione Playlist e Selezione Musicale
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-[#2D6A4F]">
        {icon}
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-4 text-lg leading-8 text-slate-600">{text}</p>
    </div>
  );
}

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
    <div className="flex-1 overflow-auto bg-[#F7F8F7] text-slate-900">
      <main>
        {/* HERO */}
        <section className="px-6 pb-12 pt-16 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Organize your music <span className="text-[#2D6A4F]">like a pro DJ</span>
              </h1>
              <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-600 lg:text-2xl">
                Manage playlists, select the best tracks, find the most compatible mixes and keep your library always up to date.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to={authenticated ? '/library' : '/auth'}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2D6A4F] px-7 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-[#24563f]"
                >
                  Start Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-lg font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Link>
              </div>
            </div>

            {/* DISCO GRANDE SOTTO IL BLOCCO HERO */}
            <div className="mt-16 flex justify-center">
              <BigLogo />
            </div>
          </div>
        </section>

        {/* 3 CARD ALLINEATE SOTTO LA HERO */}
        <section id="features" className="px-6 pb-16 lg:px-8 lg:pb-24">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Music2 className="h-7 w-7" />}
              title="Music Selection"
              text="Organize tracks, playlists and library with smart filters for BPM, key, energy and compatibility."
            />
            <FeatureCard
              icon={<Lightbulb className="h-7 w-7" />}
              title="Smart Recommendations"
              text="Get suggestions for the next best track based on mix, style, energy and sound affinity."
            />
            <FeatureCard
              icon={<RefreshCw className="h-7 w-7" />}
              title="Always Updated Library"
              text="Keep control of your selections, discover useful new tracks and prepare more effective sets."
            />
          </div>
        </section>

        {/* SEZIONE INFORMATIVA */}
        <section id="benefits" className="px-6 pb-20 lg:px-8 lg:pb-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 rounded-[36px] bg-white px-8 py-12 shadow-sm lg:grid-cols-2 lg:px-14 lg:py-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#2D6A4F]">
                <Disc3 className="h-4 w-4" />
                Portable App
              </div>
              <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
                Take your music selection everywhere
              </h2>
              <ul className="mt-8 space-y-5">
                {[
                  'Quick access to your library',
                  'Playlists and crates always available',
                  'Useful tools to choose the next track',
                  'Clean and optimized experience',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-lg text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#2D6A4F]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to={authenticated ? '/library' : '/auth'}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#2D6A4F] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#24563f]"
                >
                  Start Free
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="scale-90 md:scale-100">
                <BigLogo />
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINALE */}
        <section className="px-6 pb-24 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[36px] bg-gradient-to-br from-white to-emerald-50 px-8 py-14 text-center shadow-sm lg:px-12 lg:py-16">
            <h2 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
              Ready to improve your music selection?
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-xl leading-8 text-slate-600">
              Access your library, organize your tracks and build smarter sets.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2D6A4F] px-7 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-[#24563f]"
              >
                Register Free
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-lg font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} DJSENGINE. All rights reserved.
      </footer>
    </div>
  );
}
