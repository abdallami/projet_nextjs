"use client"
import { getInvoiceById } from '@/app/actions'
import Invoiceinfo from '@/app/components/Invoiceinfo'
import InvoiceLines from '@/app/components/InvoiceLines'
import VATcontrole from '@/app/components/VATcontrole'
import Wrapper from '@/app/components/Wrapper'
import { Invoice, Totals } from '@/type'
import { Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
const Page = ({params}:{params:Promise<{invoiceId:string}>}) => {
 
 const[invoice ,setInvoice]= useState<Invoice | null>(null)
 const[error ,setError]= useState<string | null>(null)
 
 const[initialinvoice ,setInitialInvoice]= useState<Invoice | null>(null);
 
 const [totals,setTotals]=useState<Totals|null>(null)

 /*useEffect(()=>{
   const fetchInvoice = async () => {
     try {
       const { invoiceId } = await params
       console.log('Fetching invoice with ID:', invoiceId)
       const fetchedInvoice = await getInvoiceById(invoiceId)
       console.log('Fetched invoice:', fetchedInvoice)
       if (fetchedInvoice) {
         setInvoice(fetchedInvoice)
         setInitialInvoice(fetchedInvoice)
         setError(null)
       } else {
         setError('Facture non trouvée')
       }
     } catch (error) {
       console.error('Error fetching invoice:', error)
       setError('Erreur lors du chargement de la facture')
     }
   }
   
   fetchInvoice()
 },[params])
 
 if (error) {
   return (
     <Wrapper>
       <div className='flex justify-center items-center h-screen'>
         <p className='text-lg text-error'>{error}</p>
       </div>
     </Wrapper>
   )
 }

 if (!invoice) {
   return (
     <Wrapper>
       <div className='flex justify-center items-center h-screen'>
         <p className='text-lg'>Chargement de la facture...</p>
       </div>
     </Wrapper>
   )
 }*/
   const fetchInvoice = async () => {
    try {
      const { invoiceId } = await params
      const fetchedInvoice = await getInvoiceById(invoiceId)
      if (fetchedInvoice) {
        setInvoice(fetchedInvoice)
        setInitialInvoice(fetchedInvoice)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoice()
  }, [])
 
  useEffect(() => {
    if(!invoice) return;
    const ht =invoice.lines.reduce((acc,{quantity,unitPrice})=>
      acc+quantity*unitPrice,0
    )
    const vat =invoice.vatActive ? ht*(invoice.vatRate/100):0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotals({totalHT: ht,  totalVAT : vat, totalTTC: ht+vat})
   
  }, [invoice])
   if(!invoice || !totals) return(
    < div className='flex justify-center items-center h-screen w-full'>
      <span className='font-bold'>facture Non trouve</span>
    </div>
  )





   return (
     <Wrapper>
     <div>
          <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4'> 
         <p className='badge badge-ghost badge-lg uppercase'>
             <span>Facture - </span>{invoice?.id}
         </p>
         <div className='flex md:mt-0 mt-4 gap-2'>
         <select name="status" id="status"
         value={invoice?.status || 1}
         className='select select-sm select-bordered w-full'>
             <option value={1}>Brouillon</option>
             <option value={2}>En attente</option>
             <option value={3}>Paye</option>
             <option value={4}>Annulee</option>
             <option value={5}>Impaye</option>
         </select>
           <button className='btn btn-sm btn-accent'>
             Sauvegarder
         </button>
         <button className='btn btn-sm btn-error'>
             <Trash className='w-4'/>
         </button>
 
         </div>
      </div>
      <div className='flex flex-col md:flex-row w-full'>
        <div className='flex w-full md:w-1/3 flex-col'>
         <div className='mb-4 bg-base-200 rouded-xl p-5'>
          <div className='flex  justify-between items-center m-4'>
            <div className='badge badge-accent'>
              Resume des tataux
              <VATcontrole invoice={invoice} setInvoice={setInvoice}/>
            </div>
          </div>
          <div>
            <span>TVA({invoice?.vatRate}%)</span>
            <span></span>
          </div>
           
         </div>
         <Invoiceinfo invoice={invoice} setInvoice={setInvoice}/>
        </div>
        <div className='flex w-full md:w-2/3 flex-col md:ml-4'>
       <InvoiceLines invoice={invoice} setInvoice={setInvoice}/>
        </div>
        <h2 className='text-xl font-bold mb-4'>Détails de la facture</h2>
      </div>
     </div>
     </Wrapper>
   )
}

export default Page