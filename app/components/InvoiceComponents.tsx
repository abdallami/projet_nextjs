
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
         className="w-4 "/>
        </Link>
       </div>
      
    </div>
  )
}

export default InvoiceComponents