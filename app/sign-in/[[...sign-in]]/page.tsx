// @ts-nocheck
import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { FileText, Package, Wallet, CheckCircle2, ArrowLeft } from 'lucide-react'

// ── SVG Afrique ─────────────────────────────────────────────
const AfricaLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 4 C28 4 18 10 14 20 C10 30 12 40 10 50 C8 58 4 64 6 72 C8 82 16 88 22 96 C28 104 32 114 42 116 C50 118 56 110 62 104 C70 96 80 92 86 84 C92 76 90 64 88 54 C86 44 82 36 80 26 C78 16 72 8 62 5 C54 3 46 4 38 4Z" fill="currentColor" opacity="0.9"/>
    <ellipse cx="88" cy="78" rx="5" ry="9" fill="currentColor" opacity="0.5" transform="rotate(15 88 78)" />
  </svg>
)

// ── Mini mockup facture ──────────────────────────────────────
const InvoiceMini = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-emerald-300 rounded-2xl transform translate-x-2 translate-y-2 blur-sm opacity-30" />
    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-gray-800">
      {/* Header vert */}
      <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="bg-white/20 rounded-lg p-1">
            <AfricaLogo size={14} />
          </div>
          <span className="text-white font-black text-xs italic">In<span className="text-emerald-200">voice</span> Pro</span>
        </div>
        <span className="text-emerald-100 text-[10px] font-bold bg-white/15 px-1.5 py-0.5 rounded-md">PAYÉE ✓</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {/* Titre */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-base font-black text-gray-900 tracking-tight">FACTURE</p>
            <p className="text-[9px] text-gray-400 font-mono">#A3F8B2C1</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-400">15 Jul. 2026</p>
          </div>
        </div>
        {/* Parties */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Émetteur</p>
            <p className="text-[10px] font-bold text-gray-800">Moussa Commerce</p>
            <p className="text-[9px] text-gray-500">N'Djamena</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2">
            <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Client</p>
            <p className="text-[10px] font-bold text-gray-800">SOGEC SA</p>
            <p className="text-[9px] text-gray-500">Moundou</p>
          </div>
        </div>
        {/* Tableau mini */}
        <div className="rounded-lg overflow-hidden border border-gray-100">
          <div className="bg-gray-800 text-white grid grid-cols-3 px-2 py-1 text-[8px] font-semibold">
            <span className="col-span-1">Produit</span>
            <span className="text-center">Qté</span>
            <span className="text-right">Total</span>
          </div>
          {[
            { n: "Huile moteur 5L", q: 20, t: "170 000" },
            { n: "Filtre à air", q: 15, t: "48 000" },
            { n: "Plaquettes frein", q: 10, t: "120 000" },
          ].map((l, i) => (
            <div key={l.n} className={`grid grid-cols-3 px-2 py-1.5 text-[9px] ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <span className="text-gray-700 truncate col-span-1">{l.n}</span>
              <span className="text-center text-gray-500">{l.q}</span>
              <span className="text-right font-bold text-gray-800">{l.t}</span>
            </div>
          ))}
        </div>
        {/* Total */}
        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-700">Total TTC</span>
          <span className="bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">398 840 FCFA</span>
        </div>
      </div>
    </div>
    {/* Badge PDF */}
    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
      <FileText className="w-2.5 h-2.5" />PDF
    </div>
  </div>
)

const features = [
  { icon: FileText, color: "bg-emerald-100 text-emerald-600", title: "Facturation PDF", desc: "Factures pro en FCFA, exportées en PDF en 1 clic" },
  { icon: Package, color: "bg-blue-100 text-blue-600", title: "Stock intelligent", desc: "Réservation auto, alertes, import Excel" },
  { icon: Wallet, color: "bg-purple-100 text-purple-600", title: "Trésorerie & Rapports", desc: "Entrées/sorties auto + rapports financiers PDF" },
]

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-gray-50">

      {/* ── Panneau gauche — Branding (desktop only) ──────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 flex-col justify-between p-10 relative overflow-hidden">
        {/* Cercles déco */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 w-fit group">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 group-hover:bg-white/30 transition-colors">
            <AfricaLogo size={20} />
          </div>
          <span className="font-black text-xl italic tracking-tight text-white">
            In<span className="text-emerald-200">voice</span>
            <span className="text-xs font-normal not-italic ml-1 text-emerald-300">Pro</span>
          </span>
        </Link>

        {/* Contenu central */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Gérez votre business<br />
              <span className="text-emerald-200">sans paperasse.</span>
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Factures PDF, stock intelligent et trésorerie automatique pour les commerçants d&apos;Afrique centrale.
            </p>
          </div>

          {/* Mockup facture */}
          <InvoiceMini />

          {/* 3 fonctionnalités */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-emerald-200">{desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-300 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-emerald-400">
          © {new Date().getFullYear()} Invoice Pro · Conçu pour l&apos;Afrique centrale
        </p>
      </div>

      {/* ── Panneau droit — Formulaire ────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">

        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-500 rounded-xl p-1.5">
              <AfricaLogo size={16} />
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
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-sm">

            {/* Titre */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-black text-gray-900 mb-1">Bon retour 👋</h1>
              <p className="text-sm text-gray-500">
                Pas encore de compte ?{' '}
                <Link href="/sign-up" className="text-emerald-600 font-semibold hover:underline">
                  S&apos;inscrire gratuitement
                </Link>
              </p>
            </div>

            {/* Clerk */}
            <SignIn
              appearance={{
                layout: { showOptionalFields: false, socialButtonsVariant: 'iconButton' },
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
                  socialButtonsBlockButton: 'border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all rounded-xl h-11 text-sm font-medium text-gray-700',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-400 text-xs',
                  formFieldLabel: 'text-sm font-medium text-gray-700',
                  formFieldInput: 'border border-gray-200 rounded-xl h-11 px-3 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-gray-50 transition-all w-full',
                  formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl h-11 text-sm transition-colors shadow-sm w-full',
                  footerActionLink: 'text-emerald-600 hover:text-emerald-700 font-semibold',
                  formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600',
                  formResendCodeLink: 'text-emerald-600 hover:text-emerald-700 font-semibold',
                },
              }}
            />

            {/* Retour landing */}
            <div className="mt-5 text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-3 h-3" />
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>

        {/* Footer mobile */}
        <div className="lg:hidden px-5 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Invoice Pro · Conçu pour l&apos;Afrique centrale</p>
        </div>
      </div>
    </div>
  )
}
