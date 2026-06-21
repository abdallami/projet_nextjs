"use client"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import Wrapper from "../components/Wrapper"
import { getInvoicesByEmail, getProductSalesStats } from "../actions"
import { getProducts, getLowStockProducts } from "../actions"
import {
  AlertTriangle, TrendingUp, FileText,
  Package, Clock, XCircle, Banknote, BarChart3
} from "lucide-react"
import Link from "next/link"
import { Invoice } from "@/type"

type Product = {
  id: string
  name: string
  quantity: number
  alertQty: number
  price: number
  category: { name: string } | null
}

type SaleStat = {
  name: string
  totalSold: number
  revenue: number
}

const calcTotal = (inv: Invoice) => {
  const ht = inv.lines?.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0) ?? 0
  const vat = inv.vatActive ? ht * (inv.vatRate / 100) : 0
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

export default function DashboardPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [salesStats, setSalesStats] = useState<SaleStat[]>([])

  useEffect(() => {
    if (!email) return
    const load = async () => {
      const [inv, prod, low, stats] = await Promise.all([
        getInvoicesByEmail(email),
        getProducts(email),
        getLowStockProducts(email),
        getProductSalesStats(email),
      ])
      setInvoices((inv as Invoice[]) || [])
      setProducts(prod as Product[])
      setLowStock(low as Product[])
      setSalesStats(stats as SaleStat[])
    }
    load()
  }, [email])

  // Calculs financiers
  const facturesPayees = invoices.filter((i) => i.status === 3)
  const facturesImpayees = invoices.filter((i) => i.status === 5)
  const facturesEnAttente = invoices.filter((i) => i.status === 2)

  const totalCA = facturesPayees.reduce((acc, inv) => acc + calcTotal(inv), 0)
  const totalImpaye = facturesImpayees.reduce((acc, inv) => acc + calcTotal(inv), 0)
  const totalEnAttente = facturesEnAttente.reduce((acc, inv) => acc + calcTotal(inv), 0)
  const valeurStock = products.reduce((acc, p) => acc + p.price * p.quantity, 0)

  const stats = [
    {
      label: "Chiffre d'affaires",
      value: `${totalCA.toLocaleString()} FCFA`,
      sub: `${facturesPayees.length} facture(s) payée(s)`,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Montant impayé",
      value: `${totalImpaye.toLocaleString()} FCFA`,
      sub: `${facturesImpayees.length} facture(s) impayée(s)`,
      icon: XCircle,
      color: "text-error",
      bg: "bg-error/10",
    },
    {
      label: "En attente",
      value: `${totalEnAttente.toLocaleString()} FCFA`,
      sub: `${facturesEnAttente.length} facture(s) en attente`,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Valeur du stock",
      value: `${valeurStock.toLocaleString()} FCFA`,
      sub: `${products.length} produit(s) en stock`,
      icon: Banknote,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ]

  return (
    <Wrapper>
      <div className="flex flex-col space-y-8">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500">
              {"Vue d'ensemble de votre activité commerciale"}
            </p>
          </div>
          <div className="bg-accent/10 text-accent rounded-xl p-2.5">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* Alerte impayés */}
        {totalImpaye > 0 && (
          <div className="flex items-center gap-3 bg-error/10 border border-error/20 rounded-xl px-5 py-4">
            <AlertTriangle className="w-5 h-5 text-error shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-error">
                Attention — Montant impayé élevé
              </p>
              <p className="text-xs text-error/70 mt-0.5">
                {facturesImpayees.length} client(s) vous doivent{" "}
                <strong>{totalImpaye.toLocaleString()} FCFA</strong>
              </p>
            </div>
            <Link
              href="/"
              className="btn btn-xs btn-error btn-outline rounded-lg"
            >
              Voir
            </Link>
          </div>
        )}

        {/* Cartes stats financières */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-base-200 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {label}
                </span>
                <div className={`${bg} ${color} rounded-lg p-1.5`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stock faible + Dernières factures */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Stock faible */}
          <div className="bg-base-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-accent/10 text-accent rounded-lg p-1.5">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Stock faible
                </span>
                {lowStock.length > 0 && (
                  <span className="badge badge-error badge-sm">{lowStock.length}</span>
                )}
              </div>
              <Link href="/inventory" className="text-xs text-accent hover:underline">
                Gérer →
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                <Package className="w-8 h-8 opacity-20" />
                <p className="text-sm">Tous les stocks sont suffisants ✅</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {lowStock.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-base-100 rounded-xl px-4 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.category?.name ?? "Sans catégorie"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-error badge-sm">
                        {p.quantity} restant(s)
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        seuil : {p.alertQty}
                      </p>
                    </div>
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
              <Link href="/" className="text-xs text-accent hover:underline">
                Voir tout →
              </Link>
            </div>
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                <FileText className="w-8 h-8 opacity-20" />
                <p className="text-sm">Aucune facture créée</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {invoices.slice(0, 6).map((inv) => {
                  const { label, className } = statusLabel(inv.status)
                  const total = calcTotal(inv)
                  return (
                    <Link
                      key={inv.id}
                      href={`/invoice/${inv.id}`}
                      className="flex items-center justify-between bg-base-100 rounded-xl px-4 py-2.5 hover:bg-base-300 transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                          {inv.name}
                        </p>
                        <p className="text-xs text-gray-400">{inv.clientName || "—"}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`badge badge-sm ${className}`}>{label}</span>
                        <p className="text-xs font-semibold mt-0.5">
                          {total.toLocaleString()} FCFA
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Résumé inventaire */}
        <div className="bg-base-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="bg-accent/10 text-accent rounded-lg p-1.5">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Résumé inventaire
              </span>
            </div>
            <Link href="/inventory" className="text-xs text-accent hover:underline">
              Gérer →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: products.length, label: "Produits total", color: "text-base-content" },
              { value: lowStock.length, label: "Stock faible", color: "text-error" },
              { value: products.reduce((acc, p) => acc + p.quantity, 0), label: "Unités en stock", color: "text-accent" },
              { value: `${valeurStock.toLocaleString()} F`, label: "Valeur totale", color: "text-success" },
            ].map(({ value, label, color }) => (
              <div key={label} className="bg-base-100 rounded-xl p-4 text-center">
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Produits les plus et moins vendus */}
        {salesStats.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Plus vendus */}
            <div className="bg-base-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-success/10 text-success rounded-lg p-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Produits les plus vendus
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {salesStats.slice(0, 5).map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 bg-base-100 rounded-xl px-4 py-2.5"
                  >
                    <span className={`text-sm font-black w-5 text-center shrink-0 ${
                      i === 0 ? 'text-yellow-500' :
                      i === 1 ? 'text-gray-400' :
                      i === 2 ? 'text-amber-600' : 'text-gray-300'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.revenue.toLocaleString()} FCFA de revenus
                      </p>
                    </div>
                    <span className="badge badge-success badge-sm shrink-0">
                      {p.totalSold} vendus
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Moins vendus */}
            <div className="bg-base-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-warning/10 text-warning rounded-lg p-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Produits les moins vendus
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {salesStats.slice(-5).reverse().map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 bg-base-100 rounded-xl px-4 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.revenue.toLocaleString()} FCFA de revenus
                      </p>
                    </div>
                    <span className="badge badge-warning badge-sm shrink-0">
                      {p.totalSold} vendus
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-base-200 rounded-2xl p-8 text-center text-gray-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">
              Aucune vente enregistrée — passez des factures au statut Payé pour voir les stats
            </p>
          </div>
        )}

      </div>
    </Wrapper>
  )
}