// @ts-nocheck
"use client"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import Wrapper from "../components/Wrapper"
import {
  getInvoicesByEmail, getProductSalesStats,
  getProducts, getLowStockProducts, getTransactions
} from "../actions"
import {
  AlertTriangle, TrendingUp, FileText, Package,
  Clock, XCircle, Banknote, BarChart3, ShoppingBag,
  ArrowUpCircle, ArrowDownCircle, Wallet, Target,
  ChevronRight, Activity
} from "lucide-react"
import Link from "next/link"
import { Invoice } from "@/type"

type Product = {
  id: string; name: string; quantity: number; alertQty: number
  purchasePrice: number; price: number; category: { name: string } | null
}
type SaleStat = { name: string; totalSold: number; revenue: number }
type Transaction = {
  id: string; type: string; category: string
  description: string; amount: number; date: string
}

const calcTotal = (inv: Invoice) => {
  const ht = inv.lines?.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0) ?? 0
  const vat = inv.vatActive ? ht * ((inv.vatRate ?? 0) / 100) : 0
  return ht + vat
}

const statusLabel = (status: number) => {
  const map: Record<number, { label: string; className: string }> = {
    1: { label: "Brouillon", className: "badge-ghost" },
    2: { label: "En attente", className: "badge-warning" },
    3: { label: "Payée", className: "badge-success" },
    4: { label: "Annulée", className: "badge-neutral" },
    5: { label: "Impayée", className: "badge-error" },
  }
  return map[status] ?? { label: "Inconnu", className: "badge-ghost" }
}

// Mini barre de progression
const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="w-full bg-base-300 rounded-full h-1.5 mt-1">
    <div
      className={`h-1.5 rounded-full transition-all ${color}`}
      style={{ width: `${Math.min((value / Math.max(max, 1)) * 100, 100)}%` }}
    />
  </div>
)

export default function DashboardPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [salesStats, setSalesStats] = useState<SaleStat[]>([])
  const [txStats, setTxStats] = useState({ totalEntrees: 0, totalSorties: 0 })
  const [recentTx, setRecentTx] = useState<Transaction[]>([])

  useEffect(() => {
    if (!email) return
    const load = async () => {
      const [inv, prod, low, stats, tx, txAll] = await Promise.all([
        getInvoicesByEmail(email),
        getProducts(email),
        getLowStockProducts(email),
        getProductSalesStats(email),
        getTransactionStats(email),
        getTransactions(email),
      ])
      setInvoices((inv as Invoice[]) || [])
      setProducts(prod as Product[])
      setLowStock(low as Product[])
      setSalesStats(stats as SaleStat[])
      setTxStats(tx as { totalEntrees: number; totalSorties: number })
      setRecentTx((txAll as Transaction[]).slice(0, 5))
    }
    load()
  }, [email])

  // ── Calculs factures ────────────────────────────────────────
  const facturesPayees = invoices.filter((i) => i.status === 3)
  const facturesImpayees = invoices.filter((i) => i.status === 5)
  const facturesEnAttente = invoices.filter((i) => i.status === 2)
  const totalImpaye = facturesImpayees.reduce((acc, inv) => acc + calcTotal(inv), 0)
  const totalEnAttente = facturesEnAttente.reduce((acc, inv) => acc + calcTotal(inv), 0)

  // ── CA depuis transactions (résiste à la suppression) ──────
  const totalCA = txStats.totalEntrees
  const soldeNet = txStats.totalEntrees - txStats.totalSorties

  // ── Stock ───────────────────────────────────────────────────
  const valeurStockVente = products.reduce((acc, p) => acc + p.price * p.quantity, 0)
  const valeurStockAchat = products.reduce((acc, p) =>
    acc + (p.purchasePrice > 0 ? p.purchasePrice : p.price) * p.quantity, 0)
  const beneficeStockPotentiel = products.reduce((acc, p) => {
    if (!p.purchasePrice || p.purchasePrice === 0) return acc
    return acc + (p.price - p.purchasePrice) * p.quantity
  }, 0)

  // ── Bénéfice réel ───────────────────────────────────────────
  const beneficeReelFactures = facturesPayees.reduce((acc, inv) => {
    return acc + (inv.lines?.reduce((la, line) => {
      const product = products.find((p) => p.id === line.productId)
      if (product && product.purchasePrice > 0) {
        return la + (line.unitPrice - product.purchasePrice) * line.quantity
      }
      return la
    }, 0) ?? 0)
  }, 0)

  // ── Taux de recouvrement ────────────────────────────────────
  const totalFacture = totalCA + totalImpaye + totalEnAttente
  const tauxRecouvrement = totalFacture > 0
    ? Math.round((totalCA / totalFacture) * 100) : 0

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">

        {/* ── En-tête ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Bonjour {user?.firstName} 👋 — vue d&apos;ensemble de votre activité
            </p>
          </div>
          <Link href="/report" className="btn btn-sm btn-ghost rounded-xl gap-2 border border-base-300">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Rapport</span>
          </Link>
        </div>

        {/* ── Alerte impayés ──────────────────────────────────── */}
        {totalImpaye > 0 && (
          <div className="flex items-center gap-3 bg-error/10 border border-error/20 rounded-2xl px-5 py-4">
            <div className="bg-error/20 rounded-xl p-2 shrink-0">
              <AlertTriangle className="w-4 h-4 text-error" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-error">
                {facturesImpayees.length} facture{facturesImpayees.length > 1 ? 's' : ''} impayée{facturesImpayees.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-error/70 mt-0.5">
                Montant dû : <strong>{totalImpaye.toLocaleString('fr-FR')} FCFA</strong>
              </p>
            </div>
            <Link href="/invoices?status=5" className="btn btn-xs btn-error rounded-lg gap-1">
              Voir <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* ── 4 cartes principales ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* CA réel (depuis transactions) */}
          <div className="bg-base-200 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-all col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">CA Réel</span>
              <div className="bg-success/10 text-success rounded-lg p-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-success">{totalCA.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-gray-400">FCFA encaissés</p>
            <ProgressBar value={totalCA} max={totalFacture} color="bg-success" />
          </div>

          {/* Impayés */}
          <div className="bg-base-200 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Impayés</span>
              <div className="bg-error/10 text-error rounded-lg p-1.5">
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-error">{totalImpaye.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-gray-400">{facturesImpayees.length} facture(s)</p>
            <ProgressBar value={totalImpaye} max={totalFacture} color="bg-error" />
          </div>

          {/* En attente */}
          <div className="bg-base-200 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">En attente</span>
              <div className="bg-warning/10 text-warning rounded-lg p-1.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-warning">{totalEnAttente.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-gray-400">{facturesEnAttente.length} facture(s)</p>
            <ProgressBar value={totalEnAttente} max={totalFacture} color="bg-warning" />
          </div>

          {/* Valeur stock */}
          <div className="bg-base-200 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock</span>
              <div className="bg-accent/10 text-accent rounded-lg p-1.5">
                <Banknote className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-lg font-black text-accent">{valeurStockVente.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-gray-400">{products.length} produit(s)</p>
            <ProgressBar value={products.length} max={products.length} color="bg-accent" />
          </div>
        </div>

        {/* ── Trésorerie + Taux recouvrement ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Solde trésorerie */}
          <div className={`rounded-2xl p-5 border-2 ${
            soldeNet >= 0
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-error/5 border-error/20'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className={`w-4 h-4 ${soldeNet >= 0 ? 'text-emerald-600' : 'text-error'}`} />
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Solde trésorerie
              </span>
            </div>
            <p className={`text-3xl font-black mb-1 ${soldeNet >= 0 ? 'text-emerald-600' : 'text-error'}`}>
              {soldeNet >= 0 ? '+' : ''}{soldeNet.toLocaleString('fr-FR')}
              <span className="text-sm font-normal ml-1">FCFA</span>
            </p>
            <div className="flex gap-4 mt-3">
              <div>
                <p className="text-[10px] text-gray-400">Entrées</p>
                <p className="text-xs font-bold text-emerald-600">
                  +{txStats.totalEntrees.toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Sorties</p>
                <p className="text-xs font-bold text-red-500">
                  -{txStats.totalSorties.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            <Link href="/transactions" className="text-xs text-gray-400 hover:text-accent mt-2 block">
              Voir les transactions →
            </Link>
          </div>

          {/* Taux de recouvrement */}
          <div className="bg-base-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Taux recouvrement
              </span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <p className="text-3xl font-black text-blue-600">{tauxRecouvrement}%</p>
              <p className="text-xs text-gray-400 mb-1">des factures payées</p>
            </div>
            {/* Cercle progress */}
            <div className="relative w-20 h-20 mx-auto">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={tauxRecouvrement >= 80 ? '#10b981' : tauxRecouvrement >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${tauxRecouvrement} ${100 - tauxRecouvrement}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-700">
                {tauxRecouvrement}%
              </span>
            </div>
          </div>

          {/* Bénéfice réel */}
          <div className="bg-base-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Bénéfice réel
              </span>
            </div>
            <p className="text-3xl font-black text-emerald-600 mb-1">
              {beneficeReelFactures.toLocaleString('fr-FR')}
              <span className="text-sm font-normal ml-1">FCFA</span>
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Sur {facturesPayees.length} facture(s) payée(s)
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">CA encaissé</span>
                <span className="font-bold text-success">+{totalCA.toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Coût produits</span>
                <span className="font-bold text-error">-{(totalCA - beneficeReelFactures).toLocaleString('fr-FR')}</span>
              </div>
              <div className="h-px bg-base-300" />
              <div className="flex justify-between text-xs">
                <span className="font-semibold">Bénéfice</span>
                <span className={`font-black ${beneficeReelFactures >= 0 ? 'text-emerald-600' : 'text-error'}`}>
                  {beneficeReelFactures >= 0 ? '+' : ''}{beneficeReelFactures.toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Transactions récentes + Dernières factures ───────── */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Transactions récentes */}
          <div className="bg-base-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-accent/10 text-accent rounded-lg p-1.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Transactions récentes
                </span>
              </div>
              <Link href="/transactions" className="text-xs text-accent hover:underline">Voir tout →</Link>
            </div>
            {recentTx.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                <Activity className="w-8 h-8 opacity-20" />
                <p className="text-sm">Aucune transaction</p>
                <Link href="/transactions" className="btn btn-xs btn-accent rounded-lg">
                  Ajouter
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentTx.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 bg-base-100 rounded-xl px-3 py-2.5">
                    <div className={`rounded-lg p-1.5 shrink-0 ${
                      t.type === 'entree' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {t.type === 'entree'
                        ? <ArrowUpCircle className="w-3.5 h-3.5" />
                        : <ArrowDownCircle className="w-3.5 h-3.5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{t.description || t.category}</p>
                      <p className="text-[10px] text-gray-400">{t.date}</p>
                    </div>
                    <span className={`text-xs font-black shrink-0 ${
                      t.type === 'entree' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {t.type === 'entree' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dernières factures */}
          <div className="bg-base-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-accent/10 text-accent rounded-lg p-1.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Dernières factures
                </span>
              </div>
              <Link href="/invoices" className="text-xs text-accent hover:underline">Voir tout →</Link>
            </div>
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                <FileText className="w-8 h-8 opacity-20" />
                <p className="text-sm">Aucune facture créée</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {invoices.slice(0, 5).map((inv) => {
                  const { label, className } = statusLabel(inv.status)
                  return (
                    <Link key={inv.id} href={`/invoice/${inv.id}`}
                      className="flex items-center justify-between bg-base-100 rounded-xl px-3 py-2.5 hover:bg-base-300 transition-all group">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate group-hover:text-accent transition-colors">
                          {inv.name}
                        </p>
                        <p className="text-[10px] text-gray-400">{inv.clientName || "—"}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`badge badge-xs ${className}`}>{label}</span>
                        <p className="text-xs font-bold mt-0.5">
                          {calcTotal(inv).toLocaleString('fr-FR')} F
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Stock faible + Bénéfice potentiel ───────────────── */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Stock faible */}
          <div className="bg-base-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-warning/10 text-warning rounded-lg p-1.5">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Stock faible
                </span>
                {lowStock.length > 0 && (
                  <span className="badge badge-error badge-sm">{lowStock.length}</span>
                )}
              </div>
              <Link href="/inventory" className="text-xs text-accent hover:underline">Gérer →</Link>
            </div>
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                <Package className="w-8 h-8 opacity-20" />
                <p className="text-sm">Tous les stocks sont suffisants ✅</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-base-100 rounded-xl px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <div className="w-full bg-base-300 rounded-full h-1 mt-1">
                        <div
                          className="h-1 rounded-full bg-error transition-all"
                          style={{ width: `${Math.min((p.quantity / Math.max(p.alertQty, 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="badge badge-error badge-sm ml-3 shrink-0">
                      {p.quantity}/{p.alertQty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bénéfice potentiel stock */}
          <div className="bg-base-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 text-blue-600 rounded-lg p-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Bénéfice potentiel stock
              </span>
            </div>
            <p className="text-3xl font-black text-blue-600 mb-1">
              +{beneficeStockPotentiel.toLocaleString('fr-FR')}
              <span className="text-sm font-normal ml-1">FCFA</span>
            </p>
            <p className="text-xs text-gray-400 mb-4">Si vous vendez tout votre stock</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Valeur achat</span>
                <span className="font-bold text-error">{valeurStockAchat.toLocaleString('fr-FR')} F</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Valeur vente</span>
                <span className="font-bold text-success">{valeurStockVente.toLocaleString('fr-FR')} F</span>
              </div>
              <div className="h-px bg-base-300" />
              <div className="flex justify-between text-xs">
                <span className="font-semibold">Bénéfice potentiel</span>
                <span className="font-black text-blue-600">+{beneficeStockPotentiel.toLocaleString('fr-FR')} F</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Résumé inventaire ────────────────────────────────── */}
        <div className="bg-base-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-accent/10 text-accent rounded-lg p-1.5">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Résumé inventaire
              </span>
            </div>
            <Link href="/inventory" className="text-xs text-accent hover:underline">Gérer →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: products.length, label: "Produits", color: "text-base-content", bg: "bg-base-100" },
              { value: lowStock.length, label: "Stock faible", color: "text-error", bg: "bg-error/5" },
              { value: products.reduce((acc, p) => acc + p.quantity, 0), label: "Unités total", color: "text-accent", bg: "bg-accent/5" },
              { value: `${valeurStockVente.toLocaleString('fr-FR')} F`, label: "Valeur stock", color: "text-success", bg: "bg-success/5" },
            ].map(({ value, label, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                <p className={`text-lg font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top produits vendus ──────────────────────────────── */}
        {salesStats.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-base-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-success/10 text-success rounded-lg p-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Top 5 produits vendus
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {salesStats.slice(0, 5).map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 bg-base-100 rounded-xl px-3 py-2.5">
                    <span className="text-sm w-5 text-center shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <div className="w-full bg-base-300 rounded-full h-1 mt-1">
                        <div
                          className="h-1 rounded-full bg-success"
                          style={{ width: `${Math.min((p.totalSold / Math.max(salesStats[0].totalSold, 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="badge badge-success badge-xs shrink-0">{p.totalSold} vendus</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-base-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-warning/10 text-warning rounded-lg p-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Moins vendus
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {salesStats.slice(-5).reverse().map((p) => (
                  <div key={p.name} className="flex items-center gap-3 bg-base-100 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.revenue.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <span className="badge badge-warning badge-xs shrink-0">{p.totalSold} vendus</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-base-200 rounded-2xl p-8 text-center text-gray-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Passez des factures au statut Payé pour voir les statistiques</p>
          </div>
        )}

      </div>
    </Wrapper>
  )
}
