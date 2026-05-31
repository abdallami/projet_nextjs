'use server'
//c'est le metier logique de notre application, c'est ici que nous allons faire les appels à la base de données pour vérifier si l'utilisateur existe déjà ou pas, et s'il n'existe pas, on va le créer.
import { prisma } from "@/lib/prisma";
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