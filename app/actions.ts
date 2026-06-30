// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use server'
//c'est le metier logique de notre application, c'est ici que nous allons faire les appels à la base de données pour vérifier si l'utilisateur existe déjà ou pas, et s'il n'existe pas, on va le créer.
import { prisma } from "@/lib/prisma";
import { Invoice } from "@/type";
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

            },
             include: { lines: true }  // ← ajout
        })
         return newInvoice  // ← ajout
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
            where: { email },
            include: {
                invoices: {
                    include: { lines: true },
                    orderBy: { id: 'desc' } 
                }
            }
        })

        if (!user) return []

        type InvoiceWithLines = {
            id: string
            dueDate: string
            status: number
            lines: unknown[]
            [key: string]: unknown
        }

        const today = new Date()
        const updatedInvoices = await Promise.all(
            (user.invoices as InvoiceWithLines[]).map(async (invoice) => {
                const dueDate = new Date(invoice.dueDate)
                if (dueDate < today && invoice.status === 2) {
                    return await prisma.invoice.update({
                        where: { id: invoice.id },
                        data: { status: 5 },
                        include: { lines: true }
                    })
                }
                return invoice
            })
        )
        return updatedInvoices

    } catch (error) {
        console.error(error)
        return []
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
export async function updateInvoice(invoice: Invoice) {
  try {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { lines: true }
    })

    if (!existingInvoice) {
      throw new Error(`Facture avec l'ID ${invoice.id} introuvable`)
    }

    // Mettre à jour la facture
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        issuerName: invoice.issuerName,
        issuerAddress: invoice.issuerAddress,
        clientName: invoice.clientName,
        clientAddress: invoice.clientAddress,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        vatActive: invoice.vatActive,
        vatRate: invoice.vatRate,
        status: invoice.status
      },
    })

    // Gérer les lignes
    const existingLines = existingInvoice.lines
    const receivedLines = invoice.lines

    // Supprimer les lignes retirées
    const linesToDelete = existingLines.filter(
      (existingLine) => !receivedLines.some((line) => line.id === existingLine.id)
    )
    if (linesToDelete.length > 0) {
      await prisma.invoiceLine.deleteMany({
        where: { id: { in: linesToDelete.map((line) => line.id) } }
      })
    }

    // Mettre à jour ou créer les lignes
    for (const line of receivedLines) {
      const existingLine = existingLines.find((l) => l.id === line.id)
      if (existingLine) {
        const hasChanged =
          line.description !== existingLine.description ||
          line.quantity !== existingLine.quantity ||
          line.unitPrice !== existingLine.unitPrice ||
          line.productId !== existingLine.productId
        if (hasChanged) {
          await prisma.invoiceLine.update({
            where: { id: line.id },
            data: {
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              productId: line.productId ?? null,
            }
          })
        }
      } else {
        await prisma.invoiceLine.create({
          data: {
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            invoiceId: invoice.id,
            productId: line.productId ?? null,
          }
        })
      }
    }

    // ✅ Décrémenter le stock si la facture passe à "Payé" (status = 3)
    const wasAlreadyPaid = existingInvoice.status === 3
    const isNowPaid = invoice.status === 3

    if (isNowPaid && !wasAlreadyPaid) {
      for (const line of receivedLines) {
        if (line.productId) {
          const product = await prisma.product.findUnique({
            where: { id: line.productId }
          })
          if (product) {
            const newQty = product.quantity - line.quantity
            await prisma.product.update({
              where: { id: line.productId },
              data: { quantity: newQty < 0 ? 0 : newQty }
            })
          }
        }
      }
    }

  } catch (error) {
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

// pour les categorie et produits 
// ============================================
// CATÉGORIES
// ============================================

export async function getCategories(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return [];
    return await prisma.category.findMany({
      where: { userId: user.id },
      include: { products: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createCategory(
  email: string,
  name: string,
  description: string
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Utilisateur introuvable");
    return await prisma.category.create({
      data: { name, description, userId: user.id },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateCategory(
  id: string,
  name: string,
  description: string
) {
  try {
    return await prisma.category.update({
      where: { id },
      data: { name, description },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteCategory(id: string) {
  try {
    // Détache les produits liés avant de supprimer
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    return await prisma.category.delete({ where: { id } });
  } catch (error) {
    console.error(error);
  }
}

// ============================================
// PRODUITS
// ============================================

export async function getProducts(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return [];
    return await prisma.product.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createProduct(
  email: string,
  data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    alertQty: number;
    categoryId?: string;
  }
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Utilisateur introuvable");
    return await prisma.product.create({
      data: { ...data, userId: user.id },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    alertQty: number;
    categoryId?: string | null;
  }
) {
  try {
    return await prisma.product.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteProduct(id: string) {
  try {
    return await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error(error);
  }
}

// ============================================
// STOCK — décrémente quand une facture est validée
// ============================================

export async function decrementStock(
  productId: string,
  quantity: number
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Produit introuvable");

    const newQty = product.quantity - quantity;
    return await prisma.product.update({
      where: { id: productId },
      data: { quantity: newQty < 0 ? 0 : newQty },
    });
  } catch (error) {
    console.error(error);
  }
}

// Produits avec stock faible (en dessous du seuil alertQty)
export async function getLowStockProducts(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return [];
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      include: { category: true },
    });
    return products.filter((p) => p.quantity <= p.alertQty);
  } catch (error) {
    console.error(error);
    return [];
  }
}

//pour gerez le produits le plus vendus et le moins
export async function getProductSalesStats(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return []

    // On récupère toutes les lignes des factures PAYÉES (status=3)
    const lines = await prisma.invoiceLine.findMany({
      where: {
        productId: { not: null },
        invoice: {
          userId: user.id,
          status: 3
        }
      },
      include: {
        product: true
      }
    })

    // On regroupe par produit et on somme les quantités vendues
    const statsMap: Record<string, { name: string; totalSold: number; revenue: number }> = {}

    for (const line of lines) {
      if (!line.productId || !line.product) continue
      if (!statsMap[line.productId]) {
        statsMap[line.productId] = {
          name: line.product.name,
          totalSold: 0,
          revenue: 0,
        }
      }
      statsMap[line.productId].totalSold += line.quantity
      statsMap[line.productId].revenue += line.quantity * line.unitPrice
    }

    return Object.values(statsMap).sort((a, b) => b.totalSold - a.totalSold)
  } catch (error) {
    console.error(error)
    return []
  }
}

// Vérifie si la quantité demandée est disponible en stock
export async function checkStockAvailability(
  productId: string,
  requestedQty: number
): Promise<{ available: boolean; stock: number; productName: string }> {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return { available: false, stock: 0, productName: "" }
    return {
      available: product.quantity >= requestedQty,
      stock: product.quantity,
      productName: product.name,
    }
  } catch (error) {
    console.error(error)
    return { available: false, stock: 0, productName: "" }
  }
}