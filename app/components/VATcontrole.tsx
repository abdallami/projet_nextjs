import { Invoice } from '@/type'
import React from 'react'


interface Props {
    invoice:Invoice
    setInvoice:(invoice:Invoice)=>void
}
 
const VATcontrole :React.FC<Props> = ({invoice,setInvoice}) =>{
  const handalVatchange=(e:React.ChangeEvent<HTMLInputElement>)=>{
      setInvoice({
        ...invoice,
        vatActive:e.target.checked,
        vatRate:e.target.checked?invoice.vatRate:0
      })
    }

     const handalVatRatechange=(e:React.ChangeEvent<HTMLInputElement>)=>{
      setInvoice({
        ...invoice,
        vatRate:parseFloat(e.target.value)
      })
    }
  return (
   
    <div className='flex items-center '>
      <label className='block text-sm font-bold'>TV(%)</label>
      <input type="checkbox" name="" id=""
      onChange={handalVatchange} className='toggle toggle-sm ml-2
      'checked={invoice.vatActive}/>
      {invoice.vatActive &&(
        <input type="number" name="" id="" value={invoice.vatRate}
        className='input input-sm input-bordered w-16 ml-2'
        onChange={handalVatRatechange}
        min={0}/>
      )

      }

    </div>
  )
  
}

export default VATcontrole

