
import { Invoice } from '@/type';
import { CheckCircle, Clock, FileText, SquareArrowOutUpRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
// les arguments que notre composant peut redevoir 
type InvoiceComponentsProps = {
  invoice:Invoice;
  index:number;

}
const getstatusBage=(status: number)=>{
  switch (status) {
    case 1:
      return(
        <div className='badge badge-lg flex  items-center gap-2'>
         <FileText className='w-4'/>
          brouillon
        </div>
      )
    case 2:
      return(
        <div className='badge badge-warning flex  items-center gap-2'>
         <Clock className='w-4'/>
          En attente
        </div>
      )
      case 3:
      return(
        <div className='badge badge-success flex  items-center gap-2'>
         <CheckCircle className='w-4'/>
          Payé
        </div>
      )
      case 4:
      return(
        <div className='badge badge-info flex  items-center gap-2'>
         <XCircle className='w-4'/>
          Annulé
        </div>
      )
      case 5:
      return(
        <div className='badge badge-info flex  items-center gap-2'>
         <XCircle className='w-4'/>
         impayé
        </div>
      )
      default:
        return(
          <div className='badge badge-lg'>
         <XCircle className='w-4'/>
         indefinis
        </div>
        )
      
  }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const InvoiceComponents: React.FC<InvoiceComponentsProps> = ({ invoice,index}) => {
//calculer la totale 
  const calculetotal = () => {
    const totalHT=invoice?.lines?.reduce((acc,lines)=>{
      const quantity =lines.quantity??0;
      const unitprice= lines.unitPrice??0;
      return acc+quantity*unitprice

       },0)
    const TotalVAT= totalHT*(invoice.vatRate/100);
    return totalHT+TotalVAT

    

  }





  return (
    <div className='bg-base-200/90 rouded-xl p-5 space-y-3 shadow '>
       <div className='flex justify-between items-center w-full'>
        <div>
          {getstatusBage(invoice.status)}
        </div>
        <Link 
        className='btn btn-accent btn-sm'
        href={`/invoice/${invoice.id}`}>
        View 
         <SquareArrowOutUpRight
         className='w-4 '/>
        </Link>
       </div>
       <div className='w-full'>
        <div className="">
          <div   className='stat-title'>
            <div className='upercase text-sm '>
              FAct-{invoice.id}
            </div>
          </div>
          <div>
           <div className='stat-value'>
            {calculetotal().toFixed(2)} Fr
           </div>
          </div>
          <div className='stat-desc'>
            {invoice.name}

          </div>
        </div>
       </div>
      
    </div>
  )
}

export default InvoiceComponents