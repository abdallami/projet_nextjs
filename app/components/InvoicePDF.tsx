
import { Invoice, Totals } from '@/type'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { ArrowDownFromLine, Layers2 } from 'lucide-react'
import React, { useRef } from 'react'

interface FacturePDFprops{
    invoice:Invoice 
    totals:Totals

}
//format date  

const InvoicePDF:React.FC<FacturePDFprops> =({invoice,totals}) => {
//pour le telechagement de la facture 
const factureRef = useRef<HTMLDivElement>(null)

const handleDownloadPDF = async()=>{
 const element =factureRef.current
 if(element){
    try {
        
        const canvas = await html2canvas(element,{scale:3,useCORS:true})
        const imgData = canvas.toDataURL('image/png')
        const pdf =new jsPDF({
             orientation:"portrait",
                format:"A4",
                unit:"mm"
         }    
        )
        const pdfWidth=pdf.internal.pageSize.getWidth()
        const pdfheight= (canvas.height*pdfWidth)/canvas.width
        pdf.addImage(imgData,'PNG',0, 0,pdfWidth,pdfheight)
        pdf.save(`Facture-${invoice.name}`)

         //on ajoute de conffetis pour indiquer que la facture a été créée avec succès
              confetti({
                particleCount:100,
                spread:70,
                origin:{y:0.6},
                zIndex:9999
                
              })


    } catch (error) {
        console.error('erreur lors de la generation du pdf',error);
    }
 }

}



  return (
    <div className='mt-4 hidden lg:block'>
       <div className='border-base-300 border-2 border-dashed  rounded-xl p-5  '>
         <div>
            <button 
            onClick={handleDownloadPDF}
            className='btn btn-sm btn-accent mb-4 flex justify-center items-center'>
                <ArrowDownFromLine className='w-4'/>
                Facture PDF
            </button>
         </div>
         <div className='p-8' ref={factureRef}>

            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-4'>
                <div className='flex flex-col'>

                   <div>
                        <div className='flex items-center'>
                            
                            <div className='bg-accent-content text-accent rounded-full p-2 '>
                            <Layers2 className='w-6 h-6'/>
                                                
                            </div>
                             <span className='ml-3 font-bold text-2xl italic'> In<span className='text-accent'>voice</span></span>
                        </div>
                 
                   </div>
                   <h1 className='text-7xl font-bold uppercase '>Facture</h1>
                </div>

                <div className='text-right uppercase'>
                    <p className='badge badge-ghost font-bold'>Facture n°{invoice.id}</p>
                    <p className='my-2 '>
                        <strong>Date : </strong>{invoice.invoiceDate}
                    </p>
                     <p >
                        <strong>Échéance : </strong>{invoice.dueDate}
                    </p>

                </div>
            
                

            </div>

                <div className='my-6 grid grid-cols-2 gap-4'>
                   <div>
                    <p className='badge badge-ghost mb-2'>Émetteur</p>
                    <p className='text-sm font-bold italic'>{invoice.issuerName}</p>
                     <p className='text-sm text-gray-500 break-word'>{invoice.issuerAddress}</p>
                   </div>
                    <div className='text-right'>
                    <p className='badge badge-ghost mb-2'>Client</p>
                    <p className='text-sm font-bold italic'>{invoice.clientName}</p>
                     <p className='text-sm text-gray-500 break-word'>{invoice.clientAddress}</p>
                   </div>

            </div>

            <div className='overflow-x-auto'>
                <table className='table table-zebra'>
                    <thead>
                        <tr>
                            <th></th>
                             <th>Description</th>
                              <th>Quantite</th>
                               <th>prix Unitaire</th>
                                <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.lines.map((ligne,index)=>(
                            <tr key={index+1}>
                                <td>{index+1}</td>
                                  <td>{ligne.description}</td>
                                 <td>{ligne.quantity}</td>
                                   <td>{ligne.unitPrice.toFixed(2)} Frc</td>
                                     <td className='font-bold'>{(ligne.quantity*ligne.unitPrice).toFixed(2)} Frc</td>


                            </tr>
                        ))}
                    </tbody>

                </table>

            </div>
             <div className='mt-6 space-y-2 text-md border-t pt-4'>
                <div className='flex justify-between'>
                    <div className='font-bold'>
                        Total Hors Taxes
                    </div>
                    <div className='font-bold'>
                        {totals.totalHT.toFixed(2)} Frc
                    </div>

                </div>
                {invoice.vatActive &&(
                    <div className='flex justify-between'>
                    <div className='font-bold'>
                        TVA {invoice.vatRate} %
                    </div>
                    <div>
                        {totals.totalVAT.toFixed(2)} Frc
                    </div>

                </div>
                )}
                <div className='flex justify-between'>
                    <div className='font-bold'>
                        Total toutes Taxes Comprises
                    </div>
                    <div className='badge badge-accent'>
                        {totals.totalTTC.toFixed(2)} Frc
                    </div>

                </div>

             </div>

         </div>

        </div> 
    </div>
  )
}

export default InvoicePDF