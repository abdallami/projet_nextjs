// @ts-nocheck
import { Invoice } from '@/type'
import {
  CheckCircle2, Clock, FileText, XCircle,
  AlertCircle, ArrowUpRight, Calendar, User
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type InvoiceComponentsProps = {
  invoice: Invoice
  index: number
}

const STATUS_CONFIG: Record<number, { label: string; icon: React.ReactNode; pill: string; border: string; dot: string }> = {
  1: {
    label: 'Brouillon',
    icon: <FileText className="w-3 h-3" />,
    pill: 'bg-gray-100 text-gray-500',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  2: {
    label: 'En attente',
    icon: <Clock className="w-3 h-3" />,
    pill: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
  },
  3: {
    label: 'Payé',
    icon: <CheckCircle2 className="w-3 h-3" />,
    pill: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-400',
  },
  4: {
    label: 'Annulé',
    icon: <XCircle className="w-3 h-3" />,
    pill: 'bg-red-100 text-red-600',
    border: 'border-red-200',
    dot: 'bg-red-400',
  },
  5: {
    label: 'Impayé',
    icon: <AlertCircle className="w-3 h-3" />,
    pill: 'bg-red-100 text-red-600',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
}

const InvoiceComponents: React.FC<InvoiceComponentsProps> = ({ invoice }) => {
  const totalHT = invoice?.lines?.reduce(
    (acc, line) => acc + (line.quantity ?? 0) * (line.unitPrice ?? 0),
    0
  ) ?? 0
  const totalTTC = invoice.vatActive
    ? totalHT * (1 + (invoice.vatRate ?? 0) / 100)
    : totalHT

  const cfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG[1]

  // Formatage date courte
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Initiales client
  const initials = invoice.clientName
    ? invoice.clientName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className={`group relative bg-white border ${cfg.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4 overflow-hidden`}>

      {/* Bande colorée en haut */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${cfg.dot} opacity-70`} />

      {/* Ligne 1 — Statut + bouton */}
      <div className="flex items-center justify-between pt-1">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.pill}`}>
          {cfg.icon}
          {cfg.label}
        </span>
        <Link
          href={`/invoice/${invoice.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          Ouvrir
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Ligne 2 — Nom de la facture + ID */}
      <div>
        <p className="font-bold text-gray-900 text-sm leading-tight truncate" title={invoice.name}>
          {invoice.name || 'Sans titre'}
        </p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">
          #{invoice.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Ligne 3 — Client */}
      {invoice.clientName && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">
            {initials}
          </div>
          <span className="text-xs text-gray-600 truncate">{invoice.clientName}</span>
        </div>
      )}

      {/* Séparateur */}
      <div className="border-t border-gray-100" />

      {/* Ligne 4 — Montant + date */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Total TTC</p>
          <p className="text-lg font-black text-gray-900 leading-none">
            {totalTTC.toLocaleString('fr-FR')}
            <span className="text-xs font-semibold text-gray-400 ml-1">FCFA</span>
          </p>
          {invoice.vatActive && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              HT : {totalHT.toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>

        {/* Date échéance */}
        {invoice.dueDate && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(invoice.dueDate)}</span>
          </div>
        )}
      </div>

    </div>
  )
}

export default InvoiceComponents
