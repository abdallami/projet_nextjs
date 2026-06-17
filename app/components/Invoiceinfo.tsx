import { Invoice } from '@/type'
import React from 'react'
interface Props {
    invoice:Invoice
    setInvoice:(invoice:Invoice)=>void
}
const Invoiceinfo:React.FC<Props> = ({invoice,setInvoice}) => {
    const handleInputchange=(e:React.ChangeEvent<HTMLInputElement| HTMLTextAreaElement>, field:string)=>{        
        setInvoice({...invoice,[field]:e.target.value})

    };

  return (
    <div className='flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0'>
    <div className='space-y-4'>
         <h2 className='badge badge-accent text-center w-full'>Émetteur</h2>
        <input type="text" name="" id="" value={invoice?.issuerName} 
        placeholder="Nom de l'entreprise emettrice"
        className='input input-bordered w-full resize-none required'
        onChange={(e)=>handleInputchange(e,'issuerName')}/>
        <textarea name="" id="" value={invoice?.issuerAddress}  placeholder="Adresse de l'entreprise émettrice"
        className='textarea textarea-bordered w-full resize-none h-40'
         onChange={(e)=>handleInputchange(e,'issuerAddress')}

        ></textarea>
         <h2 className='badge badge-accent text-center w-full'>Client</h2>
        <input type="text" name="" id="" value={invoice?.clientName} 
        placeholder="Nom de l'entreprise cliente"
        className='input input-bordered w-full resize-none required'
         onChange={(e)=>handleInputchange(e,'clientName') }
        />
        <textarea name="" id="" value={invoice?.clientAddress}  placeholder="Adresse de l'entreprise cliente"
        className='textarea textarea-bordered w-full resize-none h-40'
        onChange={(e)=>handleInputchange(e,'clientAddress') }
        ></textarea>
         <h2 className='badge badge-accent text-center w-full'>Date de la facture</h2>
        <input type="date" name="" id="" value={invoice?.invoiceDate} 
        className='input input-bordered w-full resize-none required'
        onChange={(e)=>handleInputchange(e,'invoiceDate') }/>
        
        <h2 className='badge badge-accent text-center w-full'>Date d'échéance</h2>
        <input type="date" name="" id="" value={invoice?.dueDate} 
        className='input input-bordered w-full resize-none required'
        onChange={(e)=>handleInputchange(e,'dueDate') }/>
        

    </div>

    </div>
  )
}

export default Invoiceinfo