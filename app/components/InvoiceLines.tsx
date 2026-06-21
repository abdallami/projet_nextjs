// @ts-nocheck
"use client"
import { Invoice } from '@/type'
import { Package, Plus, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getProducts } from '@/app/actions'
import { useUser } from '@clerk/nextjs'

type ProductOption = {
  id: string
  name: string
  price: number
  quantity: number
}

interface Props {
  invoice: Invoice
  setInvoice: (invoice: Invoice) => void
}

const InvoiceLines: React.FC<Props> = ({ invoice, setInvoice }) => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<ProductOption[]>([])

  useEffect(() => {
    if (!email) return
    const load = async () => {
      const data = await getProducts(email)
      setProducts(data as ProductOption[])
    }
    load()
  }, [email])

  const handleAddLine = () => {
    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      invoiceId: invoice.id,
      productId: null,
    }
    setInvoice({ ...invoice, lines: [...invoice.lines, newLine] })
  }

  const handleProductSelect = (index: number, productId: string) => {
    const updatedLines = [...invoice.lines]
    if (productId === "") {
      updatedLines[index] = {
        ...updatedLines[index],
        productId: null,
        description: "",
        unitPrice: 0,
      }
    } else {
      const product = products.find((p) => p.id === productId)
      if (product) {
        updatedLines[index] = {
          ...updatedLines[index],
          productId: product.id,
          description: product.name,
          unitPrice: product.price,
        }
      }
    }
    setInvoice({ ...invoice, lines: updatedLines })
  }

  const handleQuantityChange = (index: number, value: string) => {
    const updatedLines = [...invoice.lines]
    updatedLines[index].quantity = value === "" ? 0 : parseInt(value)
    setInvoice({ ...invoice, lines: updatedLines })
  }

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedLines = [...invoice.lines]
    updatedLines[index].description = value
    setInvoice({ ...invoice, lines: updatedLines })
  }

  const handleUnitPriceChange = (index: number, value: string) => {
    const updatedLines = [...invoice.lines]
    updatedLines[index].unitPrice = value === "" ? 0 : parseFloat(value)
    setInvoice({ ...invoice, lines: updatedLines })
  }

  const handleRemoveLine = (index: number) => {
    const updatedLines = invoice.lines.filter((_, i) => i !== index)
    setInvoice({ ...invoice, lines: updatedLines })
  }

  return (
    <div className='bg-base-200 rounded-2xl w-full p-5 space-y-4'>

      {/* En-tête */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <div className='bg-accent/10 text-accent rounded-lg p-1.5'>
            <Package className='w-3.5 h-3.5' />
          </div>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
            Produits / Services
          </span>
        </div>
        <button
          className='btn btn-sm btn-accent rounded-lg gap-1.5'
          onClick={handleAddLine}
        >
          <Plus className='w-3.5 h-3.5' />
          Ajouter
        </button>
      </div>

      {/* Tableau ou état vide */}
      {invoice.lines.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-10 text-gray-400 gap-2'>
          <Package className='w-8 h-8 opacity-30' />
          <p className='text-sm'>Aucune ligne — cliquez sur Ajouter</p>
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-base-300'>
          <table className='table table-sm w-full'>
            <thead>
              <tr className='bg-base-300/50 text-xs uppercase tracking-wide'>
                <th className='rounded-tl-xl'>Produit</th>
                <th>Qté</th>
                <th>Description</th>
                <th>Prix unitaire</th>
                <th className='text-right'>Montant HT</th>
                <th className='rounded-tr-xl'></th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line, index) => (
                <tr key={line.id} className='hover:bg-base-300/30 transition-colors'>

                  {/* Sélecteur produit */}
                  <td className='min-w-[160px]'>
                    <select
                      className='select select-sm select-bordered w-full rounded-lg focus:select-accent'
                      value={line.productId ?? ""}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                    >
                      <option value="">✏️ Manuel</option>
                      {products.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={p.quantity === 0}
                        >
                          {p.name} {p.quantity === 0 ? "(épuisé)" : `(${p.quantity})`}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Quantité */}
                  <td className='w-20'>
                    <input
                      type="number"
                      value={line.quantity}
                      className='input input-sm input-bordered w-full rounded-lg focus:input-accent'
                      min={0}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                    />
                  </td>

                  {/* Description */}
                  <td className='min-w-[160px]'>
                    <input
                      type="text"
                      value={line.description}
                      placeholder={line.productId ? "" : "Description..."}
                      className={`input input-sm input-bordered w-full rounded-lg focus:input-accent ${
                        line.productId ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      disabled={!!line.productId}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    />
                  </td>

                  {/* Prix unitaire */}
                  <td className='w-32'>
                    <div className='relative'>
                      <input
                        type="number"
                        value={line.unitPrice}
                        className={`input input-sm input-bordered w-full rounded-lg focus:input-accent pr-14 ${
                          line.productId ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                        min={0}
                        step={1}
                        disabled={!!line.productId}
                        onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                      />
                      <span className='absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none'>
                        FCFA
                      </span>
                    </div>
                  </td>

                  {/* Montant */}
                  <td className='text-right font-bold whitespace-nowrap text-accent'>
                    {(line.quantity * line.unitPrice).toLocaleString()} FCFA
                  </td>

                  {/* Supprimer */}
                  <td className='w-10'>
                    <button
                      className='btn btn-sm btn-ghost btn-circle text-error hover:bg-error/10'
                      onClick={() => handleRemoveLine(index)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

            {/* Footer total */}
            {invoice.lines.length > 1 && (
              <tfoot>
                <tr className='bg-base-300/30'>
                  <td colSpan={4} className='text-right text-sm text-gray-500 font-medium'>
                    Sous-total HT
                  </td>
                  <td className='text-right font-bold text-accent'>
                    {invoice.lines
                      .reduce((acc, l) => acc + l.quantity * l.unitPrice, 0)
                      .toLocaleString()} FCFA
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}

export default InvoiceLines