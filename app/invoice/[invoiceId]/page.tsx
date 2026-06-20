"use client"
import { deleteInvoice, getInvoiceById, updateInvoice } from '@/app/actions'
import Invoiceinfo from '@/app/components/Invoiceinfo'
import InvoiceLines from '@/app/components/InvoiceLines'
import InvoicePDF from '@/app/components/InvoicePDF'
import VATcontrole from '@/app/components/VATcontrole'
import Wrapper from '@/app/components/Wrapper'
import { Invoice, Totals } from '@/type'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const statusConfig: Record<number, { label: string; className: string }> = {
  1: { label: "Brouillon", className: "badge-ghost" },
  2: { label: "En attente", className: "badge-warning" },
  3: { label: "Payé", className: "badge-success" },
  4: { label: "Annulée", className: "badge-error" },
  5: { label: "Impayé", className: "badge-error" },
}

const Page = ({ params }: { params: Promise<{ invoiceId: string }> }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null)
  const [totals, setTotals] = useState<Totals | null>(null)
  const [isSaveDisabled, setIsSaveDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const { invoiceId } = await params
        const fetched = await getInvoiceById(invoiceId)
        if (fetched) {
          setInvoice(fetched)
          setInitialInvoice(fetched)
        }
      } catch (error) {
        console.error(error)
      }
    }
    load()
  }, [params])

  useEffect(() => {
    if (!invoice) return
    const ht = invoice.lines.reduce(
      (acc, { quantity, unitPrice }) => acc + quantity * unitPrice, 0
    )
    const vat = invoice.vatActive ? ht * (invoice.vatRate / 100) : 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotals({ totalHT: ht, totalVAT: vat, totalTTC: ht + vat })
  }, [invoice])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSaveDisabled(
      JSON.stringify(invoice) === JSON.stringify(initialInvoice)
    )
  }, [invoice, initialInvoice])

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = parseInt(e.target.value)
    if (invoice) setInvoice({ ...invoice, status: newStatus })
  }

  const handleSave = async () => {
    if (!invoice) return
    setIsLoading(true)
    try {
      await updateInvoice(invoice)
      const updated = await getInvoiceById(invoice.id)
      if (updated) {
        setInvoice(updated)
        setInitialInvoice(updated)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")
    if (confirmed) {
      try {
        await deleteInvoice(invoice?.id as string)
        router.push("/")
      } catch (error) {
        console.error("Erreur lors de la suppression :", error)
      }
    }
  }

  if (!invoice || !totals) return (
    <div className='flex flex-col justify-center items-center h-screen w-full gap-4'>
      <span className='loading loading-spinner loading-lg text-accent'></span>
      <p className='text-sm text-gray-400'>Chargement de la facture...</p>
    </div>
  )

  const currentStatus = statusConfig[invoice.status] ?? statusConfig[1]

  return (
    <Wrapper>
      <div className='space-y-6'>

        {/* En-tête */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          
          {/* Gauche : retour + titre */}
          <div className='flex items-center gap-3'>
            <Link href="/" className='btn btn-sm btn-ghost btn-circle'>
              <ArrowLeft className='w-4 h-4' />
            </Link>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold'>Facture</h1>
                <span className={`badge ${currentStatus.className}`}>
                  {currentStatus.label}
                </span>
              </div>
              <p className='text-xs text-gray-400 font-mono mt-0.5'>
                #{invoice.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Droite : actions */}
          <div className='flex flex-wrap items-center gap-2'>
            {/* Sélecteur de statut */}
            <select
              onChange={handleStatusChange}
              value={invoice.status || 1}
              className='select select-sm select-bordered rounded-lg font-medium'
            >
              <option value={1}>Brouillon</option>
              <option value={2}>En attente</option>
              <option value={3}>Payé</option>
              <option value={4}>Annulée</option>
              <option value={5}>Impayé</option>
            </select>

            {/* Bouton Sauvegarder */}
            <button
              className='btn btn-sm btn-accent rounded-lg gap-2'
              disabled={isSaveDisabled || isLoading}
              onClick={handleSave}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Sauvegarder
            </button>

            {/* Bouton Supprimer */}
            <button
              onClick={handleDelete}
              className='btn btn-sm btn-outline btn-error rounded-lg gap-2'
            >
              <Trash2 className='w-3.5 h-3.5' />
              Supprimer
            </button>
          </div>
        </div>

        {/* Corps principal */}
        <div className='flex flex-col lg:flex-row gap-5'>

          {/* Colonne gauche */}
          <div className='flex flex-col gap-4 w-full lg:w-[340px] shrink-0'>

            {/* Carte totaux */}
            <div className='bg-base-200 rounded-2xl p-5 space-y-3'>
              <div className='flex items-center justify-between'>
                <h2 className='font-semibold text-sm uppercase tracking-wide text-gray-500'>
                  Résumé
                </h2>
                <VATcontrole invoice={invoice} setInvoice={setInvoice} />
              </div>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-500'>Total HT</span>
                  <span className='font-semibold'>
                    {totals.totalHT.toLocaleString()} FCFA
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-500'>
                    TVA {invoice.vatActive ? `${invoice.vatRate}%` : '0%'}
                  </span>
                  <span className='font-semibold'>
                    {totals.totalVAT.toLocaleString()} FCFA
                  </span>
                </div>
                <div className='h-px bg-base-300 my-1' />
                <div className='flex justify-between items-center'>
                  <span className='font-bold text-base'>Total TTC</span>
                  <span className='font-bold text-lg text-accent'>
                    {totals.totalTTC.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Infos facture */}
            <Invoiceinfo invoice={invoice} setInvoice={setInvoice} />
          </div>

          {/* Colonne droite */}
          <div className='flex flex-col gap-4 flex-1 min-w-0'>
            <InvoiceLines invoice={invoice} setInvoice={setInvoice} />
            <InvoicePDF invoice={invoice} totals={totals} />
          </div>
        </div>

      </div>
    </Wrapper>
  )
}

export default Page