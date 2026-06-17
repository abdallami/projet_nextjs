'use server'
//c'est le metier logique de notre application, c'est ici que nous allons faire les appels à la base de données pour vérifier si l'utilisateur existe déjà ou pas, et s'il n'existe pas, on va le créer.
import { prisma } from "@/lib/prisma";
import { Invoice } from "@/type";
import { error } from "console";
import { randomBytes } from "crypto";
//la fonction qui nous permet de vérifier si l'utilisateur existe déjà ou pas, et s'il n'existe pas, on va le créer.
export async function checkAndAddUser(email: string, name: string) {
    if (!email) return;
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!existingUser && name) {
            await prisma.user.create({
                data: {
                    email,
                    name
                }
            })
        }

    } catch (error) {
        console.error(error)
    }
}
//une  fonction qui generer des id unique pour chaque facture, on utilise la librairie crypto de nodejs pour generer des id unique, et on verifie si l'id existe deja dans la base de données, si c'est le cas, on genere un nouvel id jusqu'a ce qu'on trouve un id unique.
const generateUniqueId= async()=>{
    let uniqueid;
    let isUnique=false;
    while(!isUnique){
        uniqueid= randomBytes(16).toString("hex");
        const existingInvoice= await prisma.invoice.findUnique({
        where:{
            id:uniqueid
                }
            })
        if(!existingInvoice){
                isUnique=true;
            } 
    } 
    return uniqueid;
    }
//pour creer une facture vide
export async function createEmptyInvoice(email:string,name:string){
    try{
        //on recupere email de utilisateur qui cree la facture
        const user = await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        //on cree un id unique pour chaque facture
        const invoiceId = await generateUniqueId() as string;
        //si il trouve un utilisateur avec cet email, on cree une facture vide avec les informations de l'utilisateur qui la cree et les informations de la facture qui sont vides pour le moment
        if(user){
            //on cree une facture vide avec les informations de l'utilisateur qui la cree et les informations de la facture qui sont vides pour le moment
         const newInvoice = await prisma.invoice.create({
            data:{
                id:invoiceId,
                name:name,
                userId:user?.id,
                issuerName:"",
                issuerAddress:"",
                clientName:" ",
                invoiceDate:"",
                dueDate:"",
                vatActive:false,
                vatRate:20

            }
        })
        }
   
        
    } catch(error){
        console.error(error)
    }
}
//cette fonction nous permet de recuperer les factures d'un utilisateur en utilisant son email, on utilise la relation entre les tables user et invoice pour recuperer les factures de l'utilisateur, et on retourne les factures sous forme de tableau.
export async function getInvoicesByEmail(email: string) {
    if (!email) return;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            include: {
                invoices: {
                    include: {
                        lines: true,
                    }
                }
            }
        })
        // Statuts possibles :
        // 1: Brouillon
        // 2: En attente
        // 3: Payée
        // 4: Annulée
        // 5: Impayé
        if (user) {
            const today = new Date()
            const updatedInvoices = await Promise.all(
                user.invoices.map(async (invoice) => {
                    const dueDate = new Date(invoice.dueDate)
                    if (
                        dueDate < today &&
                        invoice.status == 2
                    ) {
                        const updatedInvoice = await prisma.invoice.update({
                            where: { id: invoice.id },
                            data: { status: 5 },
                            include: { lines: true }
                        })
                        return updatedInvoice
                    }
                    return invoice
                })
            )
            return updatedInvoices

        }
    } catch (error) {
        console.error(error)
    }
}
//pour recuperer l'id de chaque facture 
export async function getInvoiceById(invoiceId:string){
    try{
        const invoice = await prisma.invoice.findUnique({
            where:{id:invoiceId},
            include:{
                lines:true
            }
        })
        if(!invoice){
            throw new Error("facture non trouve.");
        }
        return invoice
    }catch(error){
        console.error(error)
        return null
    }
}

//pour modifier  les facture existantes
export async function updateInvoice(invoice:Invoice){
    try{
         const existingInvoice = await prisma.invoice.findUnique({
            where:{id:invoice.id},
            include:{
                lines:true
            }
        })
        if(!existingInvoice){
            throw new Error(`Facture avec l 'ID  ${invoice.id}introuvable`);
        }
        await prisma.invoice.update({
             where:{id:invoice.id},
             data:{
                issuerName:invoice.issuerName,
                issuerAddress:invoice.issuerAddress,
                clientName:invoice.clientName,
                clientAddress:invoice.clientAddress,
                invoiceDate:invoice.invoiceDate,
                dueDate:invoice.dueDate,
                vatActive:invoice.vatActive,
                vatRate:invoice.vatRate,
                status:invoice.status
             },
        })
        const existinglines =existingInvoice.lines
        const receivedlines = invoice.lines
        const linesToDetete=existinglines.filter(
            (existingline)=>!receivedlines.some((line)=>line.id===existingline.id)
        )
       if(linesToDetete.length >0){
        await prisma.invoiceLine.deleteMany({
            where:{
                id:{
                    in:linesToDetete.map((line)=>line.id)
                }
            }
        })
       }
       for(const line of receivedlines){
        const existingline=existinglines.find((l)=>l.id==line.id)
        if(existingline){
            const  hasChanged=
                line.description !== existingline.description ||
                line.quantity!== existingline.quantity ||
                line.unitPrice !== existingline.unitPrice ;
                if( hasChanged){
                    await prisma.invoiceLine.update({
                        where:{id:line.id},
                        data:{
                            description:line.description,
                            quantity:line.quantity,
                            unitPrice:line.unitPrice

                        }
                    })
                } 
        } else{
                    //creer une nouvelle ligne
                    await prisma.invoiceLine.create({
                        data:{
                           description:line.description,
                            quantity:line.quantity,
                            unitPrice:line.unitPrice,
                            invoiceId:invoice.id
                        }
                    })
                }
       }
    }catch(error){
        console.error(error)
    }
}
//pour supprimer
export async function deleteInvoice(invoiceId:string){
 try{
   const deleteInvoice =await prisma.invoice.delete({
        where:{id:invoiceId}
    })
  if(!deleteInvoice){
    throw new Error("Erreur lors de la suppression de la facture")
  }
 }catch(error){
   console.error(error)
 }
}