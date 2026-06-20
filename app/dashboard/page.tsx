"use client"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import Wrapper from "../components/Wrapper"
import { getInvoicesByEmail } from "../actions"
import { getProducts, getLowStockProducts } from "../actions"
import { AlertTriangle, TrendingUp, FileText, Package } from "lucide-react"
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

export default function DashboardPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])

  useEffect(() => {
    if (!email) return
    const load = async () => {
      const [inv, prod, low] = await Promise.all([
        getInvoicesByEmail(email),
        getProducts(email),
        getLowStockProducts(email),
      ])
      setInvoices((inv as Invoice[]) || [])
      setProducts(prod as Product[])
      setLowStock(low as Product[])
    }
    load()
  }, [email])

  // Calculs
  const totalCA = invoices
    .filter((inv) => inv.status === 3)
    .reduce((acc, inv) => {
      // on recalcule depuis les lignes si dispo
      return acc
    }, 0)

  const facturesPayees = invoices.filter((i) => i.status === 3).length
  const facturesImpayees = invoices.filter((i) => i.status === 5).length
  const facturesEnAttente = invoices.filter((i) => i.status === 2).length

  const statusLabel = (status: number) => {
    const map: Record<number, { label: string; className: string }> = {
      1: { label: "Brouillon", className: "badge-ghost" },
      2: { label: "En attente", className: "badge-warning" },
      3: { label: "Payée", className: "badge-success" },
      4: { label: "Annulée", className: "badge-error" },
      5: { label: "Impayée", className: "badge-error" },
    }
    return map[status] ?? { label: "Inconnu", className: "badge-ghost" }
  }

  return (
    <Wrapper>
      <div className="flex flex-col space-y-8">

        {/* En-tête */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Vue ensemble de votre activité commerciale
          </p>
        </div>

        {/* Cartes stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-base-200 rounded-xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FileText className="w-4 h-4" />
              Total factures
            </div>
            <span className="text-3xl font-bold">{invoices.length}</span>
          </div>

          <div className="bg-base-200 rounded-xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              Payées
            </div>
            <span className="text-3xl font-bold text-success">
              {facturesPayees}
            </span>
          </div>

          <div className="bg-base-200 rounded-xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-warning text-sm">
              <FileText className="w-4 h-4" />
              En attente
            </div>
            <span className="text-3xl font-bold text-warning">
              {facturesEnAttente}
            </span>
          </div>

          <div className="bg-base-200 rounded-xl p-5 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-error text-sm">
              <AlertTriangle className="w-4 h-4" />
              Impayées
            </div>
            <span className="text-3xl font-bold text-error">
              {facturesImpayees}
            </span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Alertes stock faible */}
          <div className="bg-base-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="badge badge-accent">
                <Package className="w-3 h-3 mr-1" />
                Stock faible
              </h2>
              <Link href="/inventory" className="text-xs text-accent hover:underline">
                Voir tout →
              </Link>
            </div>

            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                ✅ Tous les stocks sont suffisants
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {lowStock.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-base-100 rounded-lg px-4 py-2"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.category?.name ?? "Sans catégorie"}
                      </p>
                    </div>
                    <span className="badge badge-error">
                      {p.quantity} restant(s)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dernières factures */}
          <div className="bg-base-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="badge badge-accent">
                <FileText className="w-3 h-3 mr-1" />
                Dernières factures
              </h2>
              <Link href="/" className="text-xs text-accent hover:underline">
                Voir tout →
              </Link>
            </div>

            {invoices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Aucune facture créée
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {invoices.slice(0, 5).map((inv) => {
                  const { label, className } = statusLabel(inv.status)
                  return (
                    <Link
                      key={inv.id}
                      href={`/invoice/${inv.id}`}
                      className="flex items-center justify-between bg-base-100 rounded-lg px-4 py-2 hover:bg-base-300 transition-all"
                    >
                      <div>
                        <p className="font-medium text-sm">{inv.name}</p>
                        <p className="text-xs text-gray-400">{inv.clientName || "—"}</p>
                      </div>
                      <span className={`badge ${className}`}>{label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Résumé inventaire */}
        <div className="bg-base-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="badge badge-accent">
              <Package className="w-3 h-3 mr-1" />
              Résumé inventaire
            </h2>
            <Link href="/inventory" className="text-xs text-accent hover:underline">
              Gérer →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-base-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-xs text-gray-400 mt-1">Produits total</p>
            </div>
            <div className="bg-base-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-error">{lowStock.length}</p>
              <p className="text-xs text-gray-400 mt-1">Stock faible</p>
            </div>
            <div className="bg-base-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">
                {products
                  .reduce((acc, p) => acc + p.price * p.quantity, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Valeur stock (FCFA)</p>
            </div>
          </div>
        </div>

      </div>
    </Wrapper>
  )
}