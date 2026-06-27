// @ts-nocheck
import { SignIn } from '@clerk/nextjs'
import { Layers2, FileText, Package, BarChart3, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const highlights = [
  { icon: FileText, text: 'Facturation rapide en FCFA' },
  { icon: Package, text: 'Gestion de stock en temps réel' },
  { icon: BarChart3, text: 'Dashboard financier complet' },
]

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">

      {/* ── Panneau gauche — Branding ─────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 flex-col justify-between p-10 relative overflow-hidden">

        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/3 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <Layers2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl italic tracking-tight text-white">
            In<span className="text-emerald-200">voice</span>
            <span className="text-xs font-normal not-italic ml-1 text-emerald-300">Pro</span>
          </span>
        </Link>

        {/* Contenu central */}
        <div className="relative">
          <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Gérez votre business<br />
            <span className="text-emerald-200">sans paperasse.</span>
          </h2>
          <p className="text-emerald-100 text-sm mb-8 leading-relaxed">
            Rejoignez les commerçants et entrepreneurs d&apos;Afrique centrale qui gèrent leurs finances avec Invoice Pro.
          </p>

          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-emerald-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Carte mini mockup */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-xs text-emerald-200 font-semibold uppercase tracking-wide mb-3">Dernière activité</p>
          {[
            { label: 'Facture Moussa & Frères', amount: '215 000 FCFA', status: 'Payée', dot: 'bg-emerald-300' },
            { label: 'Livraison SOGEC SA', amount: '480 000 FCFA', status: 'En attente', dot: 'bg-amber-300' },
          ].map(({ label, amount, status, dot }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-xs text-white font-medium">{label}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-white font-bold">{amount}</p>
                <p className="text-[10px] text-emerald-200">{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit — Formulaire ────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between bg-gray-50 min-h-screen md:min-h-0">

        {/* Header mobile only */}
        <div className="md:hidden flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-100 text-emerald-600 rounded-xl p-1.5">
              <Layers2 className="w-4 h-4" />
            </div>
            <span className="font-black text-lg italic tracking-tight">
              In<span className="text-emerald-500">voice</span>
              <span className="text-xs font-normal not-italic ml-1 text-gray-400">Pro</span>
            </span>
          </Link>
          <Link href="/sign-up" className="text-xs font-semibold text-emerald-600 hover:underline">
            Créer un compte →
          </Link>
        </div>

        {/* Formulaire centré */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">

            {/* Titre au-dessus du formulaire */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-black text-gray-900 mb-1">Bon retour 👋</h1>
              <p className="text-sm text-gray-500">
                Pas encore de compte ?{' '}
                <Link href="/sign-up" className="text-emerald-600 font-semibold hover:underline">
                  S&apos;inscrire gratuitement
                </Link>
              </p>
            </div>

            {/* Clerk SignIn avec apparence personnalisée */}
            <SignIn
              appearance={{
                layout: {
                  showOptionalFields: false,
                  socialButtonsVariant: 'iconButton',
                },
                variables: {
                  colorPrimary: '#10b981',
                  colorBackground: '#ffffff',
                  colorText: '#111827',
                  colorTextSecondary: '#6b7280',
                  colorInputBackground: '#f9fafb',
                  colorInputText: '#111827',
                  borderRadius: '0.75rem',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border border-gray-200 rounded-2xl bg-white p-6 w-full',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all rounded-xl h-10 text-sm font-medium text-gray-700',
                  socialButtonsBlockButtonText: 'text-sm font-medium',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-400 text-xs',
                  formFieldLabel: 'text-sm font-medium text-gray-700',
                  formFieldInput: 'border border-gray-200 rounded-xl h-10 px-3 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-gray-50 transition-all w-full',
                  formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl h-10 text-sm transition-colors shadow-sm w-full',
                  footerActionLink: 'text-emerald-600 hover:text-emerald-700 font-semibold',
                  identityPreviewText: 'text-sm text-gray-700',
                  identityPreviewEditButton: 'text-emerald-600 hover:text-emerald-700',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600',
                  alertText: 'text-sm',
                  formResendCodeLink: 'text-emerald-600 hover:text-emerald-700 font-semibold',
                },
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Invoice Pro · Conçu pour l&apos;Afrique centrale
          </p>
        </div>
      </div>

    </div>
  )
}
