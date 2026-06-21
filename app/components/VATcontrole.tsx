// @ts-nocheck
import { Invoice } from '@/type'
import { Percent } from 'lucide-react'
import React from 'react'

interface Props {
  invoice: Invoice
  setInvoice: (invoice: Invoice) => void
}

const VATcontrole: React.FC<Props> = ({ invoice, setInvoice }) => {
  const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice({
      ...invoice,
      vatActive: e.target.checked,
      vatRate: e.target.checked ? (invoice.vatRate || 18) : 0
    })
  }

  const handleVatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice({
      ...invoice,
      vatRate: parseFloat(e.target.value)
    })
  }

  return (
    <div className='flex items-center gap-2'>

      {/* Label + toggle invoice60169791*/}
      <div className='flex items-center gap-2'>
        <div className='bg-accent/10 text-accent rounded-lg p-1'>
          <Percent className='w-3 h-3' />
        </div>
        <span className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
          TVA
        </span>
        <input
          type="checkbox"
          className='toggle toggle-xs toggle-accent'
          onChange={handleVatChange}
          checked={invoice.vatActive}
        />
      </div>

      {/* Champ taux — visible uniquement si TVA active */}
      {invoice.vatActive && (
        <div className='flex items-center gap-1'>
          <input
            type="number"
            value={invoice.vatRate}
            className='input input-xs input-bordered w-16 rounded-lg text-center focus:input-accent'
            onChange={handleVatRateChange}
            min={0}
            max={100}
          />
          <span className='text-xs text-gray-400 font-medium'>%</span>
        </div>
      )}

    </div>
  )
}

export default VATcontrole