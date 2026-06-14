import { Invoice } from '@/type'
import { InvoiceLine } from '@prisma/client'
import { Plus, Trash } from 'lucide-react'
import React from 'react'

interface Props {
    invoice:Invoice
    setInvoice:(invoice:Invoice)=>void
}
const InvoiceLines :React.FC<Props> = ({invoice,setInvoice}) => {
    const handleAddline=()=>{
        const newline:InvoiceLine={
            id: Date.now().toString(),
            description:"",
            quantity:1,
            unitPrice:0,
            invoiceId:invoice.id
        }
        setInvoice({
            ...invoice,
            lines:[...invoice.lines , newline]
        })

    }
    const handlequantitychange=(index:number,value:string)=>{
        const updatedlines=[...invoice.lines]
        updatedlines[index].quantity=value===""?0:parseInt(value)
        setInvoice({...invoice,lines:updatedlines})
    }

     const handledescriptionchange=(index:number,value:string)=>{
        const updatedlines=[...invoice.lines]
        updatedlines[index].description=value
        setInvoice({...invoice,lines:updatedlines})
    }
     const handleunitprixchange=(index:number,value:string)=>{
        const updatedlines=[...invoice.lines]
        updatedlines[index].unitPrice=value===""?0:parseInt(value)
        setInvoice({...invoice,lines:updatedlines})
    }
    const handleREmoveline=(index:number)=>{
        const updatedlines =invoice.lines.filter(( _, i) =>i !==index)
          setInvoice({...invoice,lines:updatedlines})

    }
  return (
    <div className='h-fit bg-base-200 rounded-xl w-full p-5'>
        <div className='flex justify-between items-center mb-4'>
            <h2 className='bage bage-accent '>produits /services</h2>
            <button  className='btn btn-sm btn-accent'
            onClick={handleAddline}>
                <Plus className='w-4'/>
            </button>
             </div>
            <div className='scrollable'>
                <table className='table w-full'>
                    <thead className='uppercase'>
                        <tr>
                            <th>Quantite</th>
                            <th>Description</th>
                            <th>prix unitaire(HT)</th>
                            <th>Montant(HT)</th>
                            <th></th>
                        </tr>
                        
                    </thead>
                    <tbody>
                        {invoice.lines.map((line,index)=>(
                            <tr key={line.id}>
                               <td>
                                 <input type="number" name="" id="" value={line.quantity}
                                className='input input-sm input-bordered w-full'
                                min={0}
                                onChange={(e)=>handlequantitychange(index,e.target.value)}/>
                                </td>
                                <td>
                                 <input type="text" name="" id="" value={line.description}
                                className='input input-sm input-bordered w-full'
                                min={0}
                                onChange={(e)=>handledescriptionchange(index,e.target.value)}/>
                               </td>
                                 <td>
                                 <input type="number" name="" id="" value={line.unitPrice}
                                className='input input-sm input-bordered w-full'
                                min={0}
                                step={0.01}
                                  onChange={(e)=> handleunitprixchange(index,e.target.value)}
                                />
                               </td>
                               <td className='font-bold'>
                                 {(line.quantity*line.unitPrice).toFixed(2)}frc
                                 
                               </td>
                               <td>
                                <button className='btn btn-sm btn-circle btn-accent'>
                                    <Trash className='w-4'
                                    onClick={()=>handleREmoveline(index)}/>
                                </button>
                               </td>
                               
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

       
    </div>
  )
}

export default InvoiceLines