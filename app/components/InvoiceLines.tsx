// @ts-nocheck
"use client"
import { Invoice } from '@/type'
import { AlertTriangle, Package, Plus, Trash2, Search, X } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { getProducts } from '@/app/actions'
import { useUser } from '@clerk/nextjs'

type ProductOption = {
  id: string
  name: string
  price: number
  quantity: number
  reservedQuantity: number
}

type StockErrors = Record<number, string>

interface Props {
  invoice: Invoice
  setInvoice: (invoice: Invoice) => void
}

// ── Composant SearchableProduct ─────────────────────────────
interface SearchableProductProps {
  products: ProductOption[]
  selectedProductId: string | null
  onSelect: (productId: string) => void
  getAvailableStock: (productId: string, index: number) => number
  index: number
  hasError: boolean
}

const SearchableProduct: React.FC<SearchableProductProps> = ({
  products, selectedProductId, onSelect, getAvailableStock, index, hasError
}) => {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Nom du produit sélectionné
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  // Fermer si clic dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filtrer les produits selon la recherche
  const filtered = query.trim() === ""
    ? products
    : products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )

  const handleSelect = (productId: string) => {
    onSelect(productId)
    setQuery("")
    setOpen(false)
  }

  const handleClear = () => {
    onSelect("")
    setQuery("")
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapperRef} className="relative min-w-[200px]">
      {/* Champ de recherche */}
      <div className={`flex items-center gap-1.5 input input-sm input-bordered w-full rounded-lg px-2 ${
        hasError ? 'input-error' : focused ? 'input-accent' : ''
      }`}>
        <Search className="w-3 h-3 text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none text-sm min-w-0"
          placeholder={selectedProduct ? selectedProduct.name : "Rechercher un produit..."}
          value={selectedProduct && !open ? "" : query}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onBlur={() => setFocused(false)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        />
        {/* Badge produit sélectionné ou bouton effacer */}
        {selectedProduct && !open ? (
          <button
            className="shrink-0 text-gray-400 hover:text-error transition-colors"
            onMouseDown={(e) => { e.preventDefault(); handleClear() }}
          >
            <X className="w-3 h-3" />
          </button>
        ) : null}
      </div>

      {/* Nom produit sélectionné affiché sous le champ */}
      {selectedProduct && !open && (
        <p className="text-[10px] text-accent font-semibold mt-0.5 truncate">
          ✓ {selectedProduct.name}
        </p>
      )}

      {/* Dropdown suggestions */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-base-300 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
          {/* Option Manuel */}
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-base-200 transition-colors text-left border-b border-base-200"
            onMouseDown={(e) => { e.preventDefault(); handleSelect("") }}
          >
            <span className="text-base">✏️</span>
            <span className="text-gray-500">Saisie manuelle</span>
          </button>

          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-gray-400">
              Aucun produit trouvé pour &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((p) => {
              const available = getAvailableStock(p.id, index)
              const isExhausted = available === 0
              const isSelected = p.id === selectedProductId

              return (
                <button
                  key={p.id}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors text-left ${
                    isExhausted
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-accent/10 text-accent'
                      : 'hover:bg-base-200'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    if (!isExhausted) handleSelect(p.id)
                  }}
                  disabled={isExhausted}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.price.toLocaleString('fr-FR')} FCFA/u
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isExhausted
                      ? 'bg-error/10 text-error'
                      : available <= 5
                      ? 'bg-warning/10 text-warning'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isExhausted ? 'Épuisé' : `${available} dispo`}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ── Composant principal InvoiceLines ────────────────────────
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts()
  }, [email])

  const getAvailableStock = (productId: string, currentIndex: number): number => {
    const product = products.find((p) => p.id === productId)
    if (!product) return 0
    const freeStock = product.quantity - product.reservedQuantity
    const usedInOtherLines = invoice.lines.reduce((total, line, idx) => {
      if (idx !== currentIndex && line.productId === productId) {
        return total + (line.quantity ?? 0)
      }
      return total
    }, 0)
    return Math.max(0, freeStock - usedInOtherLines)
  }

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
    setInvoice({ ...invoice, lines: updatedLines })
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

                      {/* Recherche produit */}
                      <td className='min-w-[220px]'>
                        <SearchableProduct
                          products={products}
                          selectedProductId={line.productId}
                          onSelect={(productId) => handleProductSelect(index, productId)}
                          getAvailableStock={getAvailableStock}
                          index={index}
                          hasError={hasError}
                        />
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
                        {product && available !== null && (
                          <p className={`text-[10px] mt-0.5 ${hasError ? 'text-error font-semibold' : 'text-gray-400'}`}>
                            {hasError ? `Max : ${available}` : `Dispo : ${available}`}
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

                    {/* Ligne erreur stock */}
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
