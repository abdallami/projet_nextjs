"use client"
import { deleteInvoice, getInvoiceById, updateInvoice } from '@/app/actions'
import Invoiceinfo from '@/app/components/Invoiceinfo'
import InvoiceLines from '@/app/components/InvoiceLines'
import InvoicePDF from '@/app/components/InvoicePDF'
import VATcontrole from '@/app/components/VATcontrole'
import Wrapper from '@/app/components/Wrapper'
import { Invoice, Totals } from '@/type'
import { Save, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
const Page = ({params}:{params:Promise<{invoiceId:string}>}) => {
 
 const[invoice ,setInvoice]= useState<Invoice | null>(null)
 const router =useRouter();
 
 const[initialinvoice ,setInitialInvoice]= useState<Invoice | null>(null);
 
 const [totals,setTotals]=useState<Totals|null>(null)
 
 const[isSaveDisabled,setIsSaveDisabled]=useState(true)
 const [isLoading,setIsLoding]=useState(false)

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
  //fonction  pour changer les status
  const handleStatuschange=(e:React.ChangeEvent<HTMLSelectElement>)=>{
    const newStatus =parseInt(e.target.value)
    if(invoice){
      const upadatedInvoice = {...invoice , status:newStatus}
      setInvoice(upadatedInvoice )
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
   setIsSaveDisabled(
    JSON.stringify(invoice)===JSON.stringify(initialinvoice)
   )
  }, [invoice,initialinvoice])

  //pour souvergrder les changements
  const handlesave = async()=>{
    if(!invoice) return;
    setIsLoding(true)
    try{
       await updateInvoice(invoice)
       const updatedInvoice= getInvoiceById(invoice.id)
       if(!updatedInvoice){
        setInvoice(updatedInvoice)
        setInitialInvoice(updatedInvoice)
       }
       setIsLoding(false)
    }catch(error){
      console.error("Erreur lors de la souvegarde de la facture:",error)
    }
  }
//pour supprimer la facture 
  const handleDelete =async()=>{
    const confirmed= window.confirm("etes sur de vouloir supprimer cette facture ?")
    if(confirmed){
      try{
        await  deleteInvoice(invoice?.id as string)
        router.push("/")
      }catch(error){
      console.error("Erreur lors de la suppression de la facture .",error);
      
      }
    }
  }
  
   if(!invoice || !totals) return(
    < div className='flex justify-center items-center h-screen w-full'>
      <span className='font-bold'>facture Non trouve</span>
    </div>
  )





   return (
     <Wrapper>
     <div>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'> 
         <p className='badge badge-ghost badge-lg uppercase text-center'>
             <span>Facture n° {invoice?.id}</span>
         </p>
         <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
         <select name="status" id="status"
         onChange={handleStatuschange}
         value={invoice?.status || 1}
         className='select select-sm select-bordered w-full'>
             <option value={1}>Brouillon</option>
             <option value={2}>En attente</option>
             <option value={3}>Payé</option>
             <option value={4}>Annulée</option>
             <option value={5}>Impayé</option>
         </select>
 
           <button className='btn btn-sm btn-accent flex justify-center items-center w-full sm:w-auto' disabled={isSaveDisabled ||isLoading}
           onClick={handlesave}>
            {isLoading?(
                <span className="loading loading-spinner loading-sm"></span>
            ):(
              <>
               <Save className="w-4"/>
               <span className="ml-2">Sauvegarder</span>
               </>
            )}

         </button>
         <button 
         onClick={ handleDelete }
         className='btn btn-sm btn-error flex justify-center items-center w-full sm:w-auto'>
             <Trash className='w-4'/>
             <span className="ml-2">Supprimer</span>
         </button>
 
         </div>
      </div>
      <div className='flex flex-col lg:flex-row w-full gap-4'>
        <div className='flex w-full lg:w-1/3 flex-col'>
         <div className='mb-4 bg-base-200 rounded-xl p-5'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
              <span className='badge badge-accent'>Résumé des totaux</span>
              <span><VATcontrole invoice={invoice} setInvoice={setInvoice}/></span>
          </div>
          <div className='flex justify-between gap-2'>
            <span className='flex-1'>Total Hors Taxes</span>
            <span className='font-bold text-right'>{totals.totalHT.toFixed(2)} Frc</span>
          </div>
          <div className='flex justify-between gap-2 mt-2'>
            <span className='flex-1'>TVA ({invoice?.vatActive ? `${invoice?.vatRate}` : '0'} %)</span>
            <span className='font-bold text-right'>{totals.totalVAT.toFixed(2)} Frc</span>
          </div>
          <div className='flex justify-between gap-2 font-bold mt-3 text-lg border-t pt-2'>
             <span className='flex-1'>Total TTC</span>
            <span className='text-right'>{totals.totalTTC.toFixed(2)} Frc</span>
          </div>
           
         </div>
         <Invoiceinfo invoice={invoice} setInvoice={setInvoice}/>
        </div>
        <div className='flex w-full lg:w-2/3 flex-col'>
        <InvoiceLines invoice={invoice} setInvoice={setInvoice}/>
        <InvoicePDF invoice={invoice} totals={totals}/>
        </div>
      </div>
     </div>
     </Wrapper>
   )
}

export default Page