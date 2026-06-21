// @ts-nocheck
import { Invoice } from '@/type'
import { Building2, CalendarDays, User } from 'lucide-react'
import React from 'react'

interface Props {
  invoice: Invoice
  setInvoice: (invoice: Invoice) => void
}

const Invoiceinfo: React.FC<Props> = ({ invoice, setInvoice }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setInvoice({ ...invoice, [field]: e.target.value })
  }

  return (
    <div className='bg-base-200 rounded-2xl p-5 space-y-5'>

      {/* Émetteur */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <div className='bg-accent/10 text-accent rounded-lg p-1.5'>
            <Building2 className='w-3.5 h-3.5' />
          </div>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
            Émetteur
          </span>
        </div>
        <input
          type="text"
          value={invoice?.issuerName}
          placeholder="Nom de l'entreprise émettrice"
          className='input input-sm input-bordered w-full rounded-lg focus:input-accent'
          onChange={(e) => handleInputChange(e, 'issuerName')}
        />
        <textarea
          value={invoice?.issuerAddress}
          placeholder="Adresse complète"
          className='textarea textarea-bordered textarea-sm w-full rounded-lg resize-none h-24 focus:textarea-accent'
          onChange={(e) => handleInputChange(e, 'issuerAddress')}
        />
      </div>

      <div className='h-px bg-base-300' />

      {/* Client */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <div className='bg-accent/10 text-accent rounded-lg p-1.5'>
            <User className='w-3.5 h-3.5' />
          </div>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
            Client
          </span>
        </div>
        <input
          type="text"
          value={invoice?.clientName}
          placeholder="Nom du client"
          className='input input-sm input-bordered w-full rounded-lg focus:input-accent'
          onChange={(e) => handleInputChange(e, 'clientName')}
        />
        <textarea
          value={invoice?.clientAddress}
          placeholder="Adresse complète"
          className='textarea textarea-bordered textarea-sm w-full rounded-lg resize-none h-24 focus:textarea-accent'
          onChange={(e) => handleInputChange(e, 'clientAddress')}
        />
      </div>

      <div className='h-px bg-base-300' />

      {/* Dates */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <div className='bg-accent/10 text-accent rounded-lg p-1.5'>
            <CalendarDays className='w-3.5 h-3.5' />
          </div>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
            Dates
          </span>
        </div>
        <div className='space-y-2'>
          <label className='text-xs text-gray-400'>Date de la facture</label>
          <input
            type="date"
            value={invoice?.invoiceDate}
            className='input input-sm input-bordered w-full rounded-lg focus:input-accent'
            onChange={(e) => handleInputChange(e, 'invoiceDate')}
          />
        </div>
        <div className='space-y-2'>
          <label className='text-xs text-gray-400'>{"Date d'échéance"}</label>
          <input
            type="date"
            value={invoice?.dueDate}
            className='input input-sm input-bordered w-full rounded-lg focus:input-accent'
            onChange={(e) => handleInputChange(e, 'dueDate')}
          />
        </div>
      </div>

    </div>
  )
}

export default Invoiceinfo