// @ts-nocheck
import Link from "next/link"
import {
  FileText, Package, BarChart3, ShieldCheck,
  Zap, Users, TrendingUp, ArrowRight, CheckCircle2,
  Star, Clock, Globe, Wallet, ArrowUpCircle,
  Trash2, Search, Receipt, PieChart
} from "lucide-react"

export const metadata = {
  title: "Invoice Pro — Gestion commerciale pour PME africaines",
  description: "Gérez vos factures, votre stock et vos finances en un seul endroit. Conçu pour les PME tchadiennes et africaines.",
}

// ── Logo SVG Afrique ────────────────────────────────────────
const AfricaLogo = ({ size = 28, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M38 4 C28 4 18 10 14 20 C10 30 12 40 10 50 C8 58 4 64 6 72 C8 82 16 88 22 96 C28 104 32 114 42 116 C50 118 56 110 62 104 C70 96 80 92 86 84 C92 76 90 64 88 54 C86 44 82 36 80 26 C78 16 72 8 62 5 C54 3 46 4 38 4Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M62 5 C68 7 74 12 78 20 C72 18 66 16 60 18 C64 14 64 9 62 5Z"
      fill="currentColor"
      opacity="0.6"
    />
    {/* Madagascar */}
    <ellipse cx="88" cy="78" rx="5" ry="9" fill="currentColor" opacity="0.5" transform="rotate(15 88 78)" />
  </svg>
)

// ── Mockup Facture PDF ───────────────────────────────────────
const InvoiceMockup = () => (
  <div className="relative mx-auto" style={{ maxWidth: 340 }}>
    {/* Ombre/profondeur */}
    <div className="absolute inset-0 bg-emerald-200 rounded-2xl transform translate-x-3 translate-y-3 blur-sm opacity-40" />
    <div className="absolute inset-0 bg-gray-200 rounded-2xl transform translate-x-1.5 translate-y-1.5 opacity-60" />

    {/* Facture */}
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Bande verte en haut */}
      <div className="bg-emerald-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-lg p-1.5">
            <AfricaLogo size={18} className="text-white" />
          </div>
          <span className="text-white font-black text-sm italic">
            In<span className="text-emerald-200">voice</span> Pro
          </span>
        </div>
        <span className="text-emerald-100 text-xs font-semibold bg-white/15 px-2 py-1 rounded-lg">PAYÉE ✓</span>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Titre + ID */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">FACTURE</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">#A3F8B2C1</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-xs font-semibold text-gray-700">15 Juil. 2026</p>
            <p className="text-xs text-gray-400 mt-1">Échéance</p>
            <p className="text-xs font-semibold text-gray-700">30 Juil. 2026</p>
          </div>
        </div>

        {/* Émetteur / Client */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] font-bold uppercase text-gray-400 mb-1">Émetteur</p>
            <p className="text-xs font-bold text-gray-800">Moussa Commerce</p>
            <p className="text-[10px] text-gray-500">N'Djamena, Tchad</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-[9px] font-bold uppercase text-gray-400 mb-1">Client</p>
            <p className="text-xs font-bold text-gray-800">SOGEC SA</p>
            <p className="text-[10px] text-gray-500">Moundou, Tchad</p>
          </div>
        </div>

        {/* Tableau lignes */}
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-800 text-white grid grid-cols-12 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide">
            <span className="col-span-5">Description</span>
            <span className="col-span-2 text-center">Qté</span>
            <span className="col-span-2 text-right">P.U</span>
            <span className="col-span-3 text-right">Total</span>
          </div>
          {[
            { desc: "Huile moteur 5L", qty: 20, pu: "8 500", total: "170 000" },
            { desc: "Filtre à air", qty: 15, pu: "3 200", total: "48 000" },
            { desc: "Plaquettes frein", qty: 10, pu: "12 000", total: "120 000" },
          ].map((l, i) => (
            <div key={l.desc} className={`grid grid-cols-12 px-3 py-2 text-[10px] ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <span className="col-span-5 text-gray-700 font-medium truncate">{l.desc}</span>
              <span className="col-span-2 text-center text-gray-500">{l.qty}</span>
              <span className="col-span-2 text-right text-gray-500">{l.pu}</span>
              <span className="col-span-3 text-right font-bold text-gray-800">{l.total}</span>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total HT</span>
            <span className="font-semibold text-gray-700">338 000 FCFA</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>TVA 18%</span>
            <span className="font-semibold text-gray-700">60 840 FCFA</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">Total TTC</span>
            <span className="bg-emerald-500 text-white text-sm font-black px-3 py-1 rounded-lg">398 840 FCFA</span>
          </div>
        </div>

        {/* Footer facture */}
        <div className="border-t border-gray-100 pt-3 text-center">
          <p className="text-[9px] text-gray-400">
            Merci pour votre confiance —{" "}
            <span className="font-semibold text-gray-500 italic">
              In<span className="text-emerald-500">voice</span> Pro
            </span>
          </p>
        </div>
      </div>
    </div>

    {/* Badge PDF */}
    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-black px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
      <FileText className="w-3 h-3" />
      PDF
    </div>
  </div>
)

const features = [
  { icon: FileText, title: "Facturation complète", desc: "Factures professionnelles en FCFA. Statuts automatiques, corbeille avec restauration sous 30 jours, export PDF depuis n'importe quel appareil.", color: "bg-emerald-50 text-emerald-600" },
  { icon: Package, title: "Stock intelligent", desc: "Réservation automatique à la facturation. Alertes seuil bas, import/export Excel, prix d'achat et calcul de marge en temps réel.", color: "bg-blue-50 text-blue-600" },
  { icon: Wallet, title: "Trésorerie & Transactions", desc: "Entrées/sorties automatiques à chaque paiement. Solde net toujours à jour même après suppression de factures.", color: "bg-purple-50 text-purple-600" },
  { icon: PieChart, title: "Rapports financiers", desc: "Rapports par semaine, mois ou période personnalisée. Bénéfice réel vs potentiel, taux de recouvrement. Export PDF.", color: "bg-amber-50 text-amber-600" },
  { icon: BarChart3, title: "Dashboard analytique", desc: "CA réel, taux de recouvrement visuel, top produits vendus, bénéfice potentiel du stock. Vue complète de votre activité.", color: "bg-rose-50 text-rose-600" },
  { icon: ShieldCheck, title: "Sécurisé & fiable", desc: "Données protégées en cloud. Accessible depuis PC, tablette ou téléphone. Aucune donnée perdue même après suppression.", color: "bg-teal-50 text-teal-600" },
]

const steps = [
  { number: "01", title: "Créez votre compte", desc: "Inscription gratuite en 30 secondes." },
  { number: "02", title: "Ajoutez vos produits", desc: "Saisie manuelle ou import Excel avec prix d'achat et de vente." },
  { number: "03", title: "Émettez vos factures", desc: "Recherchez vos produits, le stock se gère automatiquement." },
  { number: "04", title: "Suivez vos finances", desc: "Dashboard, rapports et trésorerie mis à jour à chaque paiement." },
]

const plans = [
  {
    name: "Starter", price: "Gratuit", sub: "pour toujours", accent: false, cta: "Commencer gratuitement",
    features: ["20 factures/mois", "50 produits", "Transactions basiques", "Rapport mensuel", "Support email"],
  },
  {
    name: "Pro", price: "9 900 FCFA", sub: "par mois", accent: true, cta: "Essayer 14 jours gratuit",
    features: ["Factures illimitées", "Stock illimité + import Excel", "Trésorerie complète", "Rapports PDF illimités", "Dashboard avancé", "Support prioritaire"],
  },
  {
    name: "Équipe", price: "24 900 FCFA", sub: "par mois", accent: false, cta: "Nous contacter",
    features: ["Tout ce qui est dans Pro", "5 utilisateurs", "Multi-boutiques", "Dashboard partagé", "Formation incluse"],
  },
]

const testimonials = [
  { name: "Mahamat Saleh", role: "Gérant, Épicerie Central — N'Djamena", stars: 5, quote: "Avant je gérais mes stocks sur papier. Maintenant je vois exactement ce qui se vend et ce que je gagne vraiment." },
  { name: "Fatimé Oumar", role: "Propriétaire, Boutique Mode — Abéché", stars: 5, quote: "La facturation est tellement simple. Je vois mes marges sur chaque produit et mes rapports mensuels en un clic." },
  { name: "Idriss Brahim", role: "Directeur, Import-Export — Moundou", stars: 5, quote: "Le dashboard m'a aidé à voir que 3 produits faisaient 60% de mon CA. Et ma trésorerie est toujours à jour." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-emerald-500 rounded-xl p-2 flex items-center justify-center">
              <AfricaLogo size={20} className="text-white" />
            </div>
            <span className="font-black text-xl italic tracking-tight">
              In<span className="text-emerald-500">voice</span>
              <span className="text-xs font-normal not-italic ml-1 text-gray-400">Pro</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#fonctionnalites" className="hover:text-emerald-600 transition-colors">Fonctionnalités</a>
            <a href="#apercu" className="hover:text-emerald-600 transition-colors">Aperçu</a>
            <a href="#tarifs" className="hover:text-emerald-600 transition-colors">Tarifs</a>
            <a href="#avis" className="hover:text-emerald-600 transition-colors">Avis</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
              Connexion
            </Link>
            <Link href="/sign-up" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 pt-16 pb-24">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full opacity-40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100 rounded-full opacity-40 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Texte gauche */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap className="w-3 h-3" />
                Conçu pour les PME d&apos;Afrique centrale
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6">
                Factures, stock<br />et finances<br />
                <span className="text-emerald-500">en un seul endroit.</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Invoice Pro automatise votre gestion commerciale — de la facturation à la trésorerie.
                Pensé pour les commerçants et entrepreneurs tchadiens.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/sign-up" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200 text-base">
                  Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/sign-in" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 hover:border-emerald-300 text-gray-700 font-semibold rounded-xl transition-all text-base shadow-sm">
                  J&apos;ai déjà un compte
                </Link>
              </div>
              <p className="text-xs text-gray-400">Gratuit • Aucune carte bancaire • En ligne en 2 minutes</p>
            </div>

            {/* Mockup facture droite */}
            <div className="hidden md:block">
              <InvoiceMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Stats percutantes */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "📄", value: "PDF Pro", label: "Factures professionnelles générées en 1 clic" },
              { icon: "💰", value: "FCFA", label: "Devise locale native — aucune conversion" },
              { icon: "🌍", value: "100% cloud", label: "Accessible partout en Afrique centrale" },
              { icon: "📊", value: "0 papier", label: "Zéro document perdu, tout dans le cloud" },
            ].map(({ icon, value, label }) => (
              <div key={value} className="text-center">
                <p className="text-3xl mb-1">{icon}</p>
                <p className="text-xl font-black text-emerald-500 mb-1">{value}</p>
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aperçu facture mobile */}
      <section className="py-16 bg-emerald-500 md:hidden">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest mb-2">Vos factures</p>
            <h2 className="text-2xl font-black text-white">Des factures professionnelles</h2>
          </div>
          <InvoiceMockup />
        </div>
      </section>

      {/* Aperçu dashboard */}
      <section id="apercu" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">L&apos;application</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Un dashboard complet et clair</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Toutes vos données financières en un coup d&apos;œil, sur PC comme sur mobile.</p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                invoicepro.app/dashboard
              </div>
            </div>

            <div className="p-5 md:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Dashboard</h3>
                  <p className="text-xs text-gray-400">Vue d&apos;ensemble de votre activité</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-3 h-3" /> Mis à jour maintenant
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "CA Réel", value: "1 240 000", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Impayés", value: "185 000", color: "text-red-500", bg: "bg-red-50" },
                  { label: "En attente", value: "320 000", color: "text-amber-500", bg: "bg-amber-50" },
                  { label: "Stock", value: "4 800 000", color: "text-blue-600", bg: "bg-blue-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-xl p-3 ${bg}`}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`font-black text-sm ${color}`}>{value} FCFA</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
                    Transactions récentes
                  </div>
                  {[
                    { type: "entree", label: "Facture Moussa & Frères", amount: "+215 000", date: "Aujourd'hui" },
                    { type: "sortie", label: "Achat stock — Huile moteur", amount: "-45 000", date: "Hier" },
                    { type: "entree", label: "Facture SOGEC SA", amount: "+480 000", date: "12 Jul" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'entree' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <div>
                          <p className="text-xs font-medium">{t.label}</p>
                          <p className="text-[10px] text-gray-400">{t.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${t.type === 'entree' ? 'text-emerald-600' : 'text-red-500'}`}>{t.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Receipt className="w-3 h-3 text-blue-500" />
                    Dernières factures
                  </div>
                  {[
                    { name: "Facture Moussa", client: "Moussa Abakar", status: "Payée", sc: "bg-emerald-100 text-emerald-700", amount: "215 000" },
                    { name: "Livraison Mai", client: "SOGEC SA", status: "En attente", sc: "bg-amber-100 text-amber-700", amount: "480 000" },
                    { name: "Facture #0042", client: "Ali Commerce", status: "Impayée", sc: "bg-red-100 text-red-700", amount: "95 000" },
                  ].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
                      <div>
                        <p className="text-xs font-medium">{inv.name}</p>
                        <p className="text-[10px] text-gray-400">{inv.client}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${inv.sc}`}>{inv.status}</span>
                        <p className="text-xs font-bold mt-0.5">{inv.amount} F</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Fonctionnalités</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Plus besoin de jongler entre Excel, WhatsApp et vos cahiers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière nouveautés */}
      <section className="py-12 bg-emerald-500">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest mb-2">Fonctionnalités récentes</p>
              <h3 className="text-2xl font-black text-white mb-1">Trésorerie & Rapports PDF</h3>
              <p className="text-emerald-100 text-sm">Suivez entrées/sorties, générez rapports par semaine ou mois, exportez PDF depuis n&apos;importe quel appareil.</p>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
              {[
                { icon: Wallet, label: "Trésorerie auto" },
                { icon: PieChart, label: "Rapports PDF" },
                { icon: Trash2, label: "Corbeille 30j" },
                { icon: Search, label: "Recherche produits" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-xs font-semibold">
                  <Icon className="w-3.5 h-3.5 text-emerald-200" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Prise en main</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Prêt en moins de 5 minutes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(({ number, title, desc }, i) => (
              <div key={number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%-12px)] w-full h-px bg-gray-200 z-0" />
                )}
                <div className="relative z-10 bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black text-sm mb-4">{number}</div>
                  <h3 className="font-bold mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Tarifs</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Des prix adaptés au marché local</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, sub, features: f, cta, accent }) => (
              <div key={name} className={`rounded-2xl p-8 border transition-all ${accent ? "bg-emerald-500 border-emerald-400 text-white shadow-2xl shadow-emerald-200 md:-mt-4" : "bg-white border-gray-200 hover:border-emerald-200 hover:shadow-lg"}`}>
                {accent && (
                  <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-4">
                    <Star className="w-3 h-3" /> Populaire
                  </div>
                )}
                <h3 className={`font-black text-lg mb-1 ${accent ? "text-white" : ""}`}>{name}</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${accent ? "text-white" : "text-gray-900"}`}>{price}</span>
                  <span className={`text-sm ml-1 ${accent ? "text-emerald-100" : "text-gray-400"}`}>/{sub}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {f.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${accent ? "text-emerald-200" : "text-emerald-500"}`} />
                      <span className={accent ? "text-emerald-50" : "text-gray-600"}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${accent ? "bg-white text-emerald-600 hover:bg-emerald-50" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="avis" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Témoignages</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ils font confiance à Invoice Pro</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, quote, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm">{name[0]}</div>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AfricaLogo size={28} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            Votre business mérite<br />un outil moderne.
          </h2>
          <p className="text-gray-400 text-lg mb-10">Rejoignez les entrepreneurs qui ont arrêté les cahiers et les fichiers Excel.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="flex items-center justify-center gap-2 px-7 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-emerald-900/30 w-full sm:w-auto">
              Commencer gratuitement <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sign-in" className="flex items-center justify-center gap-2 px-7 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-all text-base w-full sm:w-auto">
              <Users className="w-4 h-4" /> Déjà inscrit ? Connexion
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 rounded-xl p-1.5">
                <AfricaLogo size={16} className="text-white" />
              </div>
              <span className="font-black text-lg italic text-white tracking-tight">In<span className="text-emerald-400">voice</span> Pro</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Globe className="w-3 h-3" /> Conçu avec ❤️ pour l&apos;Afrique 
            </div>
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Invoice Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
