import { Invoice } from '@/type'
import { Plus } from 'lucide-react'
import React from 'react'

interface Props {
    invoice:Invoice
    setInvoice:(invoice:Invoice)=>void
}
const InvoiceLines :React.FC<Props> = ({invoice,setInvoice}) => {
  return (
    <div className='h-fit bg-base-200 rounded-xl w-full p-5'>
        <div className='flex justify-between items-center mb-4'>
            <h2 className='bage bage-accent '>produits /services</h2>
            <button  className='btn btn-sm btn-accent'>
                <Plus className='w-4'/>
            </button>
            <div className='scrollable'>
            </div>

        </div>
    </div>
  )
}

export default InvoiceLines