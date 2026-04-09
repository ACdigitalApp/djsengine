import { Link } from 'react-router-dom';
import { ArrowRight, Download, Music, Lightbulb, RefreshCw, Disc3, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import vinylLogo from '@/assets/vinyl-logo.avif';
import djEngineLogo from '@/assets/dj-engine-logo-clean.png';

export default function IndexPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <img src={vinylLogo} alt="DJSENGINE" className="h-9 w-9 rounded-full animate-spin-slow" />
          <span className="font-heading font-bold text-foreground text-lg tracking-tight">DJ'S ENGINE</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">{t('home.features')}</a>
          <a href="#benefits" className="hover:text-foreground transition-colors">{t('home.benefits')}</a>
          <Link to="/auth" className="hover:text-foreground transition-colors">{t('home.signIn')}</Link>
          <Link
            to="/auth"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('home.startFree')}
          </Link>
        </nav>
        <Link to="/auth" className="md:hidden px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          {t('home.startFree')}
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight">
          {t('home.heroTitle1')}{' '}
          <span className="text-primary">{t('home.heroTitleHighlight')}</span>{' '}
          {t('home.heroTitle2')}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('home.heroSubtitle')}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {t('home.startFree')} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors"
          >
            <Download className="h-4 w-4" /> {t('home.signIn')}
          </Link>
        </div>
      </section>

      {/* Hero Logo */}
      <section className="px-6 md:px-12 pb-12 max-w-4xl mx-auto flex justify-center">
        <img src={djEngineLogo} alt="DJ'S ENGINE" className="w-full max-w-2xl h-auto object-contain" />
      </section>

      {/* 3 Cards */}
      <section id="features" className="px-6 md:px-12 pb-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Music, title: t('home.card1Title'), desc: t('home.card1Desc') },
            { icon: Lightbulb, title: t('home.card2Title'), desc: t('home.card2Desc') },
            { icon: RefreshCw, title: t('home.card3Title'), desc: t('home.card3Desc') },
          ].map((card, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info section */}
      <section id="benefits" className="bg-secondary/50 px-6 md:px-12 py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-5">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Disc3 className="h-4 w-4" /> {t('home.infoTag')}
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              {t('home.infoTitle')}
            </h2>
            {[t('home.infoBullet1'), t('home.infoBullet2'), t('home.infoBullet3'), t('home.infoBullet4')].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">{b}</span>
              </div>
            ))}
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors mt-2"
            >
              <Download className="h-4 w-4" /> {t('home.startFree')}
            </Link>
          </div>
          <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80">
            <img src={vinylLogo} alt="DJ'S ENGINE Vinyl" className="w-full h-full rounded-full animate-spin-slow object-cover" />
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="px-6 md:px-12 py-16 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
          {t('home.ctaTitle')}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {t('home.ctaSubtitle')}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {t('home.registerFree')} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-colors"
          >
            {t('home.signIn')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DJSENGINE. All rights reserved.
      </footer>
    </div>
  );
}
