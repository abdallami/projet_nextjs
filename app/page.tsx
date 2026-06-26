// @ts-nocheck
import Link from "next/link"
import {
  Layers2, FileText, Package, BarChart3, ShieldCheck,
  Zap, Users, TrendingUp, ArrowRight, CheckCircle2,
  Star, Clock, Globe,
} from "lucide-react"

export const metadata = {
  title: "Invoice Pro — Gestion commerciale pour PME africaines",
  description: "Gérez vos factures, votre stock et vos finances en un seul endroit. Conçu pour les PME tchadiennes et africaines.",
}

const features = [
  { icon: FileText, title: "Facturation intelligente", desc: "Créez, envoyez et suivez vos factures en quelques clics. Relances automatiques pour les impayés.", color: "bg-emerald-50 text-emerald-600" },
  { icon: Package, title: "Gestion de stock", desc: "Suivez votre inventaire en temps réel. Alertes automatiques quand un produit approche du seuil critique.", color: "bg-blue-50 text-blue-600" },
  { icon: BarChart3, title: "Dashboard analytique", desc: "Visualisez votre chiffre d'affaires, vos produits les plus vendus et l'état de vos finances d'un coup d'œil.", color: "bg-purple-50 text-purple-600" },
  { icon: ShieldCheck, title: "Sécurisé & fiable", desc: "Vos données sont protégées et sauvegardées en cloud. Accessible partout, depuis n'importe quel appareil.", color: "bg-amber-50 text-amber-600" },
]

const steps = [
  { number: "01", title: "Créez votre compte", desc: "Inscription gratuite en 30 secondes avec votre email." },
  { number: "02", title: "Ajoutez vos produits", desc: "Importez ou saisissez votre catalogue avec prix et quantités." },
  { number: "03", title: "Émettez vos factures", desc: "Créez une facture, ajoutez vos lignes, définissez la TVA et envoyez." },
  { number: "04", title: "Suivez vos finances", desc: "Votre dashboard se met à jour automatiquement à chaque paiement." },
]

const plans = [
  {
    name: "Starter", price: "Gratuit", sub: "pour toujours", accent: false, cta: "Commencer gratuitement",
    features: ["Jusqu'à 20 factures/mois", "50 produits en stock", "Dashboard basique", "Support par email"],
  },
  {
    name: "Pro", price: "9 900 FCFA", sub: "par mois", accent: true, cta: "Essayer 14 jours gratuit",
    features: ["Factures illimitées", "Stock illimité", "Dashboard avancé + stats", "Export PDF & Excel", "Support prioritaire"],
  },
  {
    name: "Équipe", price: "24 900 FCFA", sub: "par mois", accent: false, cta: "Nous contacter",
    features: ["Tout ce qui est dans Pro", "Jusqu'à 5 utilisateurs", "Accès multi-boutiques", "Tableau de bord partagé", "Formation incluse"],
  },
]

const testimonials = [
  { name: "Mahamat Saleh", role: "Gérant, Épicerie Central — N'Djamena", stars: 5, quote: "Avant, je gérais mes stocks sur papier. Maintenant tout est en temps réel, je vois exactement ce qui se vend." },
  { name: "Fatimé Oumar", role: "Propriétaire, Boutique Mode — Abéché", stars: 5, quote: "La facturation est tellement simple. Mes clients reçoivent leur facture et moi je suis payée plus vite." },
  { name: "Idriss Brahim", role: "Directeur, Import-Export — Moundou", stars: 5, quote: "Le dashboard m'a aidé à voir que 3 produits faisaient 60% de mon CA. J'ai pu me concentrer là-dessus." },
]

const stats = [
  { value: "2 min", label: "Pour créer votre première facture" },
  { value: "FCFA", label: "Devise locale native" },
  { value: "100%", label: "Cloud — accessible partout" },
  { value: "0 papier", label: "Zéro document perdu" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-100 text-emerald-600 rounded-xl p-2">
              <Layers2 className="w-5 h-5" />
            </div>
            <span className="font-black text-xl italic tracking-tight">
              In<span className="text-emerald-500">voice</span>
              <span className="text-xs font-normal not-italic ml-1 text-gray-400">Pro</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#fonctionnalites" className="hover:text-emerald-600 transition-colors">Fonctionnalités</a>
            <a href="#comment" className="hover:text-emerald-600 transition-colors">Comment ça marche</a>
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
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 pt-20 pb-28">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full opacity-40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100 rounded-full opacity-40 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            Conçu pour les PME africaines
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            Gérez votre business<br />
            <span className="text-emerald-500">sans paperasse.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 mb-10">
            Factures, inventaire et finances dans une seule application simple et rapide.
            Invoice Pro est pensé pour les commerçants et entrepreneurs d&apos;Afrique centrale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200 text-base">
              Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sign-in" className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 hover:border-emerald-300 text-gray-700 font-semibold rounded-xl transition-all text-base shadow-sm">
              J&apos;ai déjà un compte
            </Link>
          </div>
          <p className="mt-5 text-xs text-gray-400">Gratuit • Aucune carte bancaire requise • En ligne en 2 minutes</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-emerald-500 mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aperçu dashboard */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">L&apos;application</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Une interface claire et efficace, sans complexité inutile.</p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200 bg-white">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 text-center">invoicepro.app/dashboard</div>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg">Dashboard</h3>
                  <p className="text-xs text-gray-400">Vue d&apos;ensemble de votre activité</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-3 h-3" /> Mis à jour maintenant
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Chiffre d'affaires", value: "1 240 000 FCFA", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Montant impayé", value: "185 000 FCFA", color: "text-red-500", bg: "bg-red-50" },
                  { label: "En attente", value: "320 000 FCFA", color: "text-amber-500", bg: "bg-amber-50" },
                  { label: "Valeur du stock", value: "4 800 000 FCFA", color: "text-blue-600", bg: "bg-blue-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-xl p-4 ${bg}`}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`font-black text-sm ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dernières factures</div>
                {[
                  { name: "Facture Moussa & Frères", client: "Moussa Abakar", status: "Payée", statusColor: "bg-emerald-100 text-emerald-700", amount: "215 000 FCFA" },
                  { name: "Livraison Mai 2025", client: "SOGEC SA", status: "En attente", statusColor: "bg-amber-100 text-amber-700", amount: "480 000 FCFA" },
                  { name: "Facture #0042", client: "Ali Commerce", status: "Impayée", statusColor: "bg-red-100 text-red-700", amount: "95 000 FCFA" },
                ].map((inv) => (
                  <div key={inv.name} className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{inv.name}</p>
                      <p className="text-xs text-gray-400">{inv.client}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inv.statusColor}`}>{inv.status}</span>
                      <span className="text-sm font-semibold">{inv.amount}</span>
                    </div>
                  </div>
                ))}
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
            <h2 className="text-3xl md:text-4xl font-black mb-4">Votre bureau de gestion complet</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Plus besoin de jongler entre Excel, WhatsApp et vos cahiers. Tout est centralisé.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Comment ça marche */}
      <section id="comment" className="py-20 bg-emerald-500">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest mb-3">Prise en main</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt en moins de 5 minutes</h2>
            <p className="text-emerald-100 max-w-xl mx-auto">Aucune formation requise. Vous êtes opérationnel dès votre inscription.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(({ number, title, desc }, i) => (
              <div key={number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%-12px)] w-full h-px bg-emerald-400 z-0" />
                )}
                <div className="relative z-10 bg-white/10 rounded-2xl p-6 text-white backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center font-black text-sm mb-4">{number}</div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm text-emerald-100">{desc}</p>
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
            <p className="text-gray-500 max-w-xl mx-auto">Commencez gratuitement, évoluez selon vos besoins.</p>
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
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
            Votre business mérite<br />un outil moderne.
          </h2>
          <p className="text-gray-400 text-lg mb-10">Rejoignez les entrepreneurs qui ont arrêté les cahiers et les fichiers Excel.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="flex items-center gap-2 px-7 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-emerald-900/30">
              Commencer gratuitement <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sign-in" className="flex items-center gap-2 px-7 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-all text-base">
              <Users className="w-4 h-4" /> Déjà inscrit ? Connexion
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 text-emerald-600 rounded-xl p-1.5">
                <Layers2 className="w-4 h-4" />
              </div>
              <span className="font-black text-lg italic text-white tracking-tight">In<span className="text-emerald-400">voice</span> Pro</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Globe className="w-3 h-3" /> Conçu avec ❤️ pour l&apos;Afrique centrale
            </div>
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Invoice Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
