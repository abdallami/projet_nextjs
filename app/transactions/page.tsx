// @ts-nocheck
"use client"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import Wrapper from "../components/Wrapper"
import { createTransaction, getTransactions, deleteTransaction } from "../actions"
import {
  Plus, Trash2, TrendingUp, TrendingDown,
  ArrowUpCircle, ArrowDownCircle, Filter, Search
} from "lucide-react"
import Link from "next/link"

type Transaction = {
  id: string
  type: string
  category: string
  description: string
  amount: number
  date: string
  createdAt: string
}

const CATEGORIES_ENTREE = [
  "Facture payée",
  "Avance client",
  "Remboursement",
  "Autre revenu",
]

const CATEGORIES_SORTIE = [
  "Achat stock",
  "Loyer",
  "Transport",
  "Salaires",
  "Électricité / Eau",
  "Frais bancaires",
  "Autre dépense",
]

const emptyForm = {
  type: "entree",
  category: CATEGORIES_ENTREE[0],
  description: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
}

export default function TransactionsPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchData = async () => {
    if (!email) return
    const data = await getTransactions(email)
    setTransactions(data as Transaction[])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (email) fetchData()
  }, [email])

  // Quand le type change, reset la catégorie
  const handleTypeChange = (type: string) => {
    setForm({
      ...form,
      type,
      category: type === "entree" ? CATEGORIES_ENTREE[0] : CATEGORIES_SORTIE[0],
    })
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.date) return
    await createTransaction(email, {
      ...form,
      amount: Number(form.amount),
    })
    await fetchData()
    setForm(emptyForm)
    ;(document.getElementById("transaction_modal") as HTMLDialogElement).close()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette transaction ?")) return
    setIsDeleting(id)
    await deleteTransaction(id)
    await fetchData()
    setIsDeleting(null)
  }

  // Filtrage
  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "" || t.type === typeFilter
    return matchSearch && matchType
  })

  // Totaux
  const totalEntrees = transactions
    .filter((t) => t.type === "entree")
    .reduce((acc, t) => acc + t.amount, 0)

  const totalSorties = transactions
    .filter((t) => t.type === "sortie")
    .reduce((acc, t) => acc + t.amount, 0)

  const solde = totalEntrees - totalSorties

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Transactions</h1>
            <p className="text-sm text-gray-500">
              Entrées et sorties de votre trésorerie
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/rapport" className="btn btn-sm btn-ghost rounded-lg gap-2 border border-base-300">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Rapport</span>
            </Link>
            <button
              className="btn btn-accent rounded-lg gap-2"
              onClick={() => (document.getElementById("transaction_modal") as HTMLDialogElement).showModal()}
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Cartes résumé */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Total entrées
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              +{totalEntrees.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                Total sorties
              </span>
            </div>
            <p className="text-2xl font-black text-red-500">
              -{totalSorties.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className={`rounded-2xl p-5 border ${
            solde >= 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-error/10 border-error/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${solde >= 0 ? 'text-blue-600' : 'text-error'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                solde >= 0 ? 'text-blue-600' : 'text-error'
              }`}>
                Solde net
              </span>
            </div>
            <p className={`text-2xl font-black ${solde >= 0 ? 'text-blue-600' : 'text-error'}`}>
              {solde >= 0 ? '+' : ''}{solde.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>

        {/* Recherche + filtre */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered w-full pl-9 rounded-lg focus:input-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="select select-bordered pl-9 rounded-lg w-full sm:w-48 focus:select-accent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tout afficher</option>
              <option value="entree">Entrées seulement</option>
              <option value="sortie">Sorties seulement</option>
            </select>
          </div>
        </div>

        {/* Liste transactions */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <TrendingUp className="w-10 h-10 opacity-20" />
            <p className="text-sm">Aucune transaction trouvée</p>
            <button
              className="btn btn-sm btn-accent rounded-lg gap-2"
              onClick={() => (document.getElementById("transaction_modal") as HTMLDialogElement).showModal()}
            >
              <Plus className="w-4 h-4" />
              Ajouter une transaction
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-4 bg-base-200 rounded-xl px-4 py-3 border ${
                  t.type === "entree" ? "border-emerald-100" : "border-red-100"
                }`}
              >
                {/* Icône */}
                <div className={`rounded-xl p-2 shrink-0 ${
                  t.type === "entree"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-500"
                }`}>
                  {t.type === "entree"
                    ? <ArrowUpCircle className="w-4 h-4" />
                    : <ArrowDownCircle className="w-4 h-4" />
                  }
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {t.description || t.category}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{t.category}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{t.date}</span>
                  </div>
                </div>

                {/* Montant */}
                <p className={`font-black text-sm whitespace-nowrap ${
                  t.type === "entree" ? "text-emerald-600" : "text-red-500"
                }`}>
                  {t.type === "entree" ? "+" : "-"}
                  {t.amount.toLocaleString('fr-FR')} FCFA
                </p>

                {/* Supprimer */}
                <button
                  className="btn btn-xs btn-ghost btn-circle text-error hover:bg-error/10 shrink-0"
                  onClick={() => handleDelete(t.id)}
                  disabled={isDeleting === t.id}
                >
                  {isDeleting === t.id
                    ? <span className="loading loading-spinner loading-xs" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal ajout transaction */}
      <dialog id="transaction_modal" className="modal modal-middle">
        <div className="modal-box w-full sm:max-w-md rounded-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">✕</button>
          </form>
          <div className="mb-5">
            <h3 className="font-bold text-xl">Nouvelle transaction</h3>
            <p className="text-sm text-gray-400 mt-1">Enregistrez une entrée ou une sortie</p>
          </div>

          <div className="space-y-4">
            {/* Type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`btn rounded-xl gap-2 ${
                  form.type === "entree" ? "btn-success" : "btn-ghost border border-base-300"
                }`}
                onClick={() => handleTypeChange("entree")}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Entrée
              </button>
              <button
                className={`btn rounded-xl gap-2 ${
                  form.type === "sortie" ? "btn-error" : "btn-ghost border border-base-300"
                }`}
                onClick={() => handleTypeChange("sortie")}
              >
                <ArrowDownCircle className="w-4 h-4" />
                Sortie
              </button>
            </div>

            {/* Catégorie */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Catégorie
              </label>
              <select
                className="select select-bordered w-full rounded-lg focus:select-accent"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {(form.type === "entree" ? CATEGORIES_ENTREE : CATEGORIES_SORTIE).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Description (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Paiement facture Moussa"
                className="input input-bordered w-full rounded-lg focus:input-accent"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Montant + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Montant (FCFA) *
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.amount}
                  min={0}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Date *
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            <button
              className={`btn w-full rounded-lg ${
                form.type === "entree" ? "btn-success" : "btn-error"
              }`}
              disabled={!form.amount || !form.date}
              onClick={handleSubmit}
            >
              {form.type === "entree" ? (
                <><ArrowUpCircle className="w-4 h-4" /> Enregistrer l&apos;entrée</>
              ) : (
                <><ArrowDownCircle className="w-4 h-4" /> Enregistrer la sortie</>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </Wrapper>
  )
}
