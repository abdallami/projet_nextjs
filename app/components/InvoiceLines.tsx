// @ts-nocheck
"use client"
import { Invoice } from '@/type'
import { AlertTriangle, Package, Plus, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getProducts } from '@/app/actions'
import { useUser } from '@clerk/nextjs'

type ProductOption = {
  id: string
  name: string
  price: number
  quantity: number
  reservedQuantity: number  // ← ajouter
}

// Erreurs de stock par index de ligne
type StockErrors = Record<number, string>

interface Props {
  invoice: Invoice
  setInvoice: (invoice: Invoice) => void
}

const InvoiceLines: React.FC<Props> = ({ invoice, setInvoice }) => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<ProductOption[]>([])
  const [stockErrors, setStockErrors] = useState<StockErrors>({})

  const loadProducts = async () => {
    if (!email) return
    const data = await getProducts(email)
    setProducts(data as ProductOption[])
  }

  useEffect(() => {
    loadProducts()
  }, [email])

  // Calcule le stock réellement disponible pour un produit,
  // en soustrayant les quantités déjà utilisées dans les autres lignes
 const getAvailableStock = (productId: string, currentIndex: number): number => {
  const product = products.find((p) => p.id === productId)
  if (!product) return 0

  // Stock libre = physique - déjà réservé en base
  const freeStock = product.quantity - product.reservedQuantity

  // Quantité utilisée dans les autres lignes de CETTE facture
  const usedInOtherLines = invoice.lines.reduce((total, line, idx) => {
    if (idx !== currentIndex && line.productId === productId) {
      return total + (line.quantity ?? 0)
    }
    return total
  }, 0)

  return Math.max(0, freeStock - usedInOtherLines)
}
  // Valide toutes les lignes et retourne les erreurs
  const validateLines = (lines: typeof invoice.lines) => {
    const errors: StockErrors = {}
    lines.forEach((line, index) => {
      if (!line.productId) return
      const available = getAvailableStock(line.productId, index)
      if (line.quantity > available) {
        const product = products.find((p) => p.id === line.productId)
        errors[index] = `Stock insuffisant — disponible : ${available} ${product?.name ?? ''}`
      }
    })
    return errors
  }

  const handleAddLine = () => {
    const newLine = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      invoiceId: invoice.id,
      productId: null,
    }
    const newLines = [...invoice.lines, newLine]
    setInvoice({ ...invoice, lines: newLines })
    setStockErrors(validateLines(newLines))
  }

  const handleProductSelect = (index: number, productId: string) => {
    const updatedLines = [...invoice.lines]
    if (productId === "") {
      updatedLines[index] = {
        ...updatedLines[index],
        productId: null,
        description: "",
        unitPrice: 0,
        quantity: 1,
      }
    } else {
      const product = products.find((p) => p.id === productId)
      if (product) {
        updatedLines[index] = {
          ...updatedLines[index],
          productId: product.id,
          description: product.name,
          unitPrice: product.price,
          quantity: 1,
        }
      }
    }
    const newInvoice = { ...invoice, lines: updatedLines }
    setInvoice(newInvoice)
    setStockErrors(validateLines(updatedLines))
  }

  const handleQuantityChange = (index: number, value: string) => {
    const updatedLines = [...invoice.lines]
    const qty = value === "" ? 0 : parseInt(value)
    updatedLines[index] = { ...updatedLines[index], quantity: qty }
    const newInvoice = { ...invoice, lines: updatedLines }
    setInvoice(newInvoice)
    setStockErrors(validateLines(updatedLines))
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
    setStockErrors(validateLines(updatedLines))
  }

  const hasStockErrors = Object.keys(stockErrors).length > 0

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
          {hasStockErrors && (
            <span className='flex items-center gap-1 text-xs font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full'>
              <AlertTriangle className='w-3 h-3' />
              Stock insuffisant
            </span>
          )}
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
              {invoice.lines.map((line, index) => {
                const hasError = !!stockErrors[index]
                const available = line.productId
                  ? getAvailableStock(line.productId, index)
                  : null
                const product = line.productId
                  ? products.find((p) => p.id === line.productId)
                  : null

                return (
                  <React.Fragment key={line.id}>
                    <tr className={`transition-colors ${hasError ? 'bg-error/5' : 'hover:bg-base-300/30'}`}>

                      {/* Sélecteur produit */}
                      <td className='min-w-[180px]'>
                        <select
                          className={`select select-sm select-bordered w-full rounded-lg focus:select-accent ${hasError ? 'select-error' : ''}`}
                          value={line.productId ?? ""}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                        >
                          <option value="">✏️ Manuel</option>
                          {products.map((p) => {
                            const availForThis = getAvailableStock(p.id, index)
                            const isExhausted = availForThis === 0 && p.id !== line.productId
                            return (
                              <option
                                key={p.id}
                                value={p.id}
                                disabled={isExhausted}
                              >
                                {p.name}{' '}
                                {availForThis === 0
                                  ? '(épuisé)'
                                  : `(${availForThis} dispo)`
                                }
                              </option>
                            )
                          })}
                        </select>
                      </td>

                      {/* Quantité */}
                      <td className='w-24'>
                        <input
                          type="number"
                          value={line.quantity}
                          className={`input input-sm input-bordered w-full rounded-lg focus:input-accent ${hasError ? 'input-error' : ''}`}
                          min={1}
                          max={available ?? undefined}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                        />
                        {/* Stock restant affiché sous le champ */}
                        {product && available !== null && (
                          <p className={`text-[10px] mt-0.5 ${hasError ? 'text-error font-semibold' : 'text-gray-400'}`}>
                            {hasError
                              ? `Max : ${available}`
                              : `Dispo : ${available}`
                            }
                          </p>
                        )}
                      </td>

                      {/* Description */}
                      <td className='min-w-[160px]'>
                        <input
                          type="text"
                          value={line.description}
                          placeholder={line.productId ? "" : "Description..."}
                          className={`input input-sm input-bordered w-full rounded-lg focus:input-accent ${line.productId ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                            className={`input input-sm input-bordered w-full rounded-lg focus:input-accent pr-14 ${line.productId ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                      <td className={`text-right font-bold whitespace-nowrap ${hasError ? 'text-error' : 'text-accent'}`}>
                        {(line.quantity * line.unitPrice).toLocaleString('fr-FR')} FCFA
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

                    {/* Ligne d'erreur stock */}
                    {hasError && (
                      <tr className='bg-error/5'>
                        <td colSpan={6} className='py-1 px-4'>
                          <div className='flex items-center gap-1.5 text-xs text-error font-medium'>
                            <AlertTriangle className='w-3 h-3 shrink-0' />
                            {stockErrors[index]}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
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
                      .toLocaleString('fr-FR')} FCFA
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
