"use client";
import { Layers2 } from "lucide-react";
import Wrapper from "./components/Wrapper";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createEmptyInvoice, getInvoicesByEmail } from "./actions";
import confetti from "canvas-confetti";
import { Invoice } from "@/type";
import InvoiceComponents from "./components/InvoiceComponents";
export default function Home() {
  const [invoiceName,setInvoiceName]=useState("");
  const [isNamevalid,setIsNameValid]=useState(true);

  //le nom depasse pas 60
  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNameValid(invoiceName.length <= 60);
    
  },[invoiceName]);
  
  //pour recuperer les informations des utilisateurs 
    const {user}=useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string;
  const handleCreateInvoice=async()=>{
    // Logique pour créer la facture avec le nom invoiceName
    try{
      if(email){
        await  createEmptyInvoice(email,invoiceName);
      }
      //on le champs invoice 
      //pour qu'on actualse pas pour neo
      fetchInvoices();
      setInvoiceName("");
      const modal=document.getElementById('my_modal_3') as HTMLDialogElement;
      if(modal){
        modal.close();
      }
      //on ajoute de conffetis pour indiquer que la facture a été créée avec succès
      confetti({
        particleCount:100,
        spread:70,
        origin:{y:0.6},
        zIndex:9999
        
      })
    } catch(error){
      console.error("Erreur lors de la création de la facture:",error);
    }
  };
  //pour afficher les factures


const [Invoices,setInvoices] = useState<Invoice[]>([]);
const fetchInvoices = async()=>{
    try{
      const data = await getInvoicesByEmail(email)
      if(data){
        setInvoices(data);
      }
    } catch(error){
      console.error("Erreur lors de la récupération des factures:",error);
    }
  } 
  
  useEffect(() => {
    if (email) {
      fetchInvoices()
    }
  }, [email])
 
  


  return (
    <Wrapper> 
      <div className="flex flex-col space-y-4">
        <h1 className="text-lg font-bold">Mes factures</h1>
      
      <div className="grid md:grid-cols-3 gap-4">
       <div className="cursor-pointer border border-accent rounded-xl  flex flex-col  justify-center items-center p-5"
        onClick={()=>(document.getElementById('my_modal_3')as HTMLDialogElement).showModal()}>
        <div className="text-acent font-bold">
          créer une facture
        </div>
          <div className='bg-accent-content text-accent rounded-full p-2 mt-2'>
              <Layers2 className='w-6 h-6'/>
              
              </div>
          </div>
          {/*liste des factures*/
          Invoices.length>0 && (
            Invoices.map((invoice,index)=>(
              <div key={index}>
               
                <InvoiceComponents  invoice={invoice} index={index} />
                
              </div>
            ))
          )}
      </div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Nouvelle facture</h3>
        <input type="text"  value={invoiceName} onChange={(e)=>setInvoiceName(e.target.value)} placeholder="Nom de la facture (max 60 caractères)" 
        className="input input-bordered w-full my-4 hover:borber-none outline-none rounded-2xl border-accent "/>

        {!isNamevalid && (
          <p className="mb-4 text-sm text-red-500">Le nom de la facture dépasse 60 caractères.</p>
        )}
        <button className="btn btn-accent" disabled={ !isNamevalid || invoiceName.length === 0 }
        onClick={handleCreateInvoice}>Créer</button>
       
      
        </div>
      </dialog>

      </div>     
      
     
      

    </Wrapper>
  );
}
