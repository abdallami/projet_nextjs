// @ts-nocheck
"use client";
import { Layers2, Plus, Trash2, Search, Filter } from "lucide-react";
import Wrapper from "../components/Wrapper";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createEmptyInvoice, getInvoicesByEmail, deleteInvoice } from "../actions";
import confetti from "canvas-confetti";
import { Invoice } from "@/type";
import InvoiceComponents from "../components/InvoiceComponents";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "1", label: "Brouillon" },
  { value: "2", label: "En attente" },
  { value: "3", label: "Payé" },
  { value: "4", label: "Annulée" },
  { value: "5", label: "Impayé" },
]

export default function Home() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoiceName, setInvoiceName] = useState("")
  const [isNameValid, setIsNameValid] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Validation nom
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNameValid(invoiceName.length <= 60)
  }, [invoiceName])

  // Chargement factures
  const fetchInvoices = async () => {
    try {
      const data = await getInvoicesByEmail(email)
      if (data) setInvoices(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (email) fetchInvoices()
  }, [email])

  // Création facture
  const handleCreateInvoice = async () => {
    try {
      if (email) await createEmptyInvoice(email, invoiceName)
      fetchInvoices()
      setInvoiceName("")
      ;(document.getElementById('my_modal_3') as HTMLDialogElement).close()
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 })
    } catch (error) {
      console.error(error)
    }
  }

  // Filtrage
  // Tri : plus récentes en premier (sécurité côté client)
 const sorted = [...invoices].sort((a, b) => b.id.localeCompare(a.id))

  const filtered = sorted.filter((inv) => {
    const matchSearch = inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "" || inv.status === parseInt(statusFilter)
    return matchSearch && matchStatus
  })

  // Sélection
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map((inv) => inv.id))
    }
  }

  // Suppression multiple
  const handleDeleteSelected = async () => {
    if (!confirm(`Supprimer ${selected.length} facture(s) ?`)) return
    setIsDeleting(true)
    try {
      await Promise.all(selected.map((id) => deleteInvoice(id)))
      setSelected([])
      fetchInvoices()
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Mes factures</h1>
            <p className="text-sm text-gray-500">
              {invoices.length} facture{invoices.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            className="btn btn-accent rounded-lg gap-2"
            onClick={() => (document.getElementById('my_modal_3') as HTMLDialogElement).showModal()}
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </button>
        </div>

        {/* Barre de recherche + filtres */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou client..."
              className="input input-bordered w-full pl-9 rounded-lg focus:input-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtre statut */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="select select-bordered pl-9 rounded-lg focus:select-accent w-full sm:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Barre d'actions sélection */}
        {selected.length > 0 && (
          <div className="flex items-center justify-between bg-error/10 border border-error/20 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-error">
              {selected.length} facture{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setSelected([])}
              >
                Annuler
              </button>
              <button
                className="btn btn-sm btn-error gap-1.5"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                {isDeleting
                  ? <span className="loading loading-spinner loading-xs" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Résultats */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Search className="w-10 h-10 opacity-20" />
            <p className="text-sm">Aucune facture trouvée</p>
            {(search || statusFilter) && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => { setSearch(""); setStatusFilter("") }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Sélectionner tout */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-accent"
                checked={selected.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
              />
              <span className="text-xs text-gray-400">
                {selected.length === filtered.length && filtered.length > 0
                  ? "Tout désélectionner"
                  : "Tout sélectionner"
                }
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Grille factures */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className={`relative rounded-xl transition-all ${
                    selected.includes(invoice.id)
                      ? 'ring-2 ring-accent ring-offset-2'
                      : ''
                  }`}
                >
                  {/* Checkbox sélection */}
                  <div className="absolute top-1 left-1 z-10">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-accent"
                      checked={selected.includes(invoice.id)}
                      onChange={() => toggleSelect(invoice.id)}
                    />
                  </div>
                  <InvoiceComponents invoice={invoice} index={index} />
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Modal nouvelle facture */}
      <dialog id="my_modal_3" className="modal modal-middle">
        <div className="modal-box w-full sm:max-w-md rounded-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">✕</button>
          </form>
          <div className="mb-5">
            <h3 className="font-bold text-xl">Nouvelle facture</h3>
            <p className="text-sm text-gray-400 mt-1">
              Donnez un nom à votre facture pour la retrouver facilement
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={invoiceName}
                onChange={(e) => setInvoiceName(e.target.value)}
                placeholder="Ex: Facture client Moussa - Juin 2026"
                className="input input-bordered w-full rounded-lg focus:input-accent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isNameValid && invoiceName.length > 0) {
                    handleCreateInvoice()
                  }
                }}
              />
              <div className="flex justify-between mt-1.5">
                {!isNameValid
                  ? <p className="text-xs text-error">Maximum 60 caractères</p>
                  : <span />
                }
                <p className={`text-xs ml-auto ${invoiceName.length > 50 ? 'text-warning' : 'text-gray-400'}`}>
                  {invoiceName.length}/60
                </p>
              </div>
            </div>
            <button
              className="btn btn-accent w-full rounded-lg"
              disabled={!isNameValid || invoiceName.length === 0}
              onClick={handleCreateInvoice}
            >
              <Plus className="w-4 h-4" />
              Créer la facture
            </button>
          </div>
        </div>
      </dialog>

    </Wrapper>
  )
}