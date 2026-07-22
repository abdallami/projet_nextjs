// @ts-nocheck
"use client"
import { Invoice } from '@/type'
import { AlertTriangle, Package, Plus, Trash2, Search, X, ChevronDown, Check } from 'lucide-react'
import React, { useEffect, useState, useRef, useCallback } from 'react'
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

// ── Modal de sélection produit ──────────────────────────────
interface ProductModalProps {
  products: ProductOption[]
  selectedProductId: string | null
  onSelect: (productId: string) => void
  onClose: () => void
  getAvailableStock: (productId: string, index: number) => number
  index: number
}

const ProductModal: React.FC<ProductModalProps> = ({
  products, selectedProductId, onSelect, onClose, getAvailableStock, index
}) => {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus sur le champ de recherche dès l'ouverture
    setTimeout(() => inputRef.current?.focus(), 100)
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const filtered = query.trim() === ""
    ? products
    : products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  const handleSelect = (productId: string) => {
    onSelect(productId)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '85vh' }}>

        {/* Handle mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Choisir un produit</h3>
          <button
            className="btn btn-sm btn-ghost btn-circle"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recherche */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un produit..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Liste */}
        <div className="overflow-y-auto flex-1">
          {/* Option saisie manuelle */}
          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left"
            onClick={() => handleSelect("")}
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0">
              ✏️
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Saisie manuelle</p>
              <p className="text-xs text-gray-400 mt-0.5">Description et prix personnalisés</p>
            </div>
            {!selectedProductId && (
              <Check className="w-4 h-4 text-accent ml-auto shrink-0" />
            )}
          </button>

          {/* Résultats */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-sm">Aucun produit pour &quot;{query}&quot;</p>
            </div>
          ) : (
            filtered.map((p) => {
              const available = getAvailableStock(p.id, index)
              const isExhausted = available === 0
              const isSelected = p.id === selectedProductId

              return (
                <button
                  key={p.id}
                  className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left border-b border-gray-50 ${
                    isExhausted
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-accent/5'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => { if (!isExhausted) handleSelect(p.id) }}
                  disabled={isExhausted}
                >
                  {/* Avatar produit */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                    isExhausted ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {p.name[0].toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isSelected ? 'text-accent' : 'text-gray-800'}`}>
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.price.toLocaleString('fr-FR')} FCFA/unité
                    </p>
                  </div>

                  {/* Badge stock + check */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isExhausted
                        ? 'bg-error/10 text-error'
                        : available <= 5
                        ? 'bg-warning/15 text-warning'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isExhausted ? 'Épuisé' : `${available} dispo`}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-accent" />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 sm:hidden">
          <button className="btn btn-ghost w-full rounded-xl" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// ── InvoiceLines principal ──────────────────────────────────
const InvoiceLines: React.FC<Props> = ({ invoice, setInvoice }) => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [products, setProducts] = useState<ProductOption[]>([])
  const [stockErrors, setStockErrors] = useState<StockErrors>({})
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!email) return
    getProducts(email).then((data) => setProducts(data as ProductOption[]))
  }, [email])

  const getAvailableStock = useCallback((productId: string, currentIndex: number): number => {
    const product = products.find((p) => p.id === productId)
    if (!product) return 0
    const freeStock = product.quantity - product.reservedQuantity
    const usedInOtherLines = invoice.lines.reduce((total, line, idx) => {
      if (idx !== currentIndex && line.productId === productId) return total + (line.quantity ?? 0)
      return total
    }, 0)
    return Math.max(0, freeStock - usedInOtherLines)
  }, [products, invoice.lines])

  const validateLines = useCallback((lines: typeof invoice.lines) => {
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
  }, [getAvailableStock, products])

  const handleAddLine = () => {
    const newLines = [...invoice.lines, {
      id: Date.now().toString(),
      description: "", quantity: 1, unitPrice: 0,
      invoiceId: invoice.id, productId: null,
    }]
    setInvoice({ ...invoice, lines: newLines })
    setStockErrors(validateLines(newLines))
  }

  const handleProductSelect = (index: number, productId: string) => {
    const updatedLines = [...invoice.lines]
    if (productId === "") {
      updatedLines[index] = { ...updatedLines[index], productId: null, description: "", unitPrice: 0, quantity: 1 }
    } else {
      const product = products.find((p) => p.id === productId)
      if (product) {
        updatedLines[index] = { ...updatedLines[index], productId: product.id, description: product.name, unitPrice: product.price, quantity: 1 }
      }
    }
    setInvoice({ ...invoice, lines: updatedLines })
    setStockErrors(validateLines(updatedLines))
  }

  const handleQuantityChange = (index: number, value: string) => {
    const updatedLines = [...invoice.lines]
    updatedLines[index] = { ...updatedLines[index], quantity: value === "" ? 0 : parseInt(value) }
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
    <div className="bg-base-200 rounded-2xl w-full p-4 sm:p-5 space-y-4">

      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-accent/10 text-accent rounded-lg p-1.5">
            <Package className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Produits / Services
          </span>
          {hasStockErrors && (
            <span className="flex items-center gap-1 text-xs font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Stock insuffisant
            </span>
          )}
        </div>
        <button className="btn btn-sm btn-accent rounded-lg gap-1.5" onClick={handleAddLine}>
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      {/* État vide */}
      {invoice.lines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
          <Package className="w-8 h-8 opacity-30" />
          <p className="text-sm">Aucune ligne — cliquez sur Ajouter</p>
          <button className="btn btn-sm btn-accent rounded-lg gap-1.5" onClick={handleAddLine}>
            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {invoice.lines.map((line, index) => {
            const hasError = !!stockErrors[index]
            const available = line.productId ? getAvailableStock(line.productId, index) : null
            const product = line.productId ? products.find((p) => p.id === line.productId) : null

            return (
              <div
                key={line.id}
                className={`rounded-2xl border p-4 space-y-3 transition-all ${
                  hasError ? 'border-error/40 bg-error/5' : 'border-base-300 bg-white'
                }`}
              >
                {/* Numéro ligne + supprimer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Ligne {index + 1}
                  </span>
                  <button
                    className="btn btn-xs btn-ghost btn-circle text-error hover:bg-error/10"
                    onClick={() => handleRemoveLine(index)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bouton sélecteur produit — ouvre le modal */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Produit
                  </label>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      hasError
                        ? 'border-error bg-error/5'
                        : 'border-base-300 bg-base-100 hover:border-accent/50 hover:bg-white'
                    }`}
                    onClick={() => setOpenModalIndex(index)}
                  >
                    {product ? (
                      <>
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                          {product.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {product.price.toLocaleString('fr-FR')} FCFA/u ·{' '}
                            <span className={available !== null && available <= 5 ? 'text-warning font-semibold' : 'text-gray-400'}>
                              {available} dispo
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-400 flex-1">Choisir un produit...</span>
                      </>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {/* Bouton effacer sélection */}
                  {product && (
                    <button
                      className="text-xs text-error hover:underline mt-1 ml-1"
                      onClick={() => handleProductSelect(index, "")}
                    >
                      ✕ Passer en saisie manuelle
                    </button>
                  )}

                  {/* Erreur stock */}
                  {hasError && (
                    <div className="flex items-center gap-1.5 text-xs text-error font-medium mt-1.5 bg-error/10 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {stockErrors[index]}
                    </div>
                  )}
                </div>

                {/* Description si saisie manuelle */}
                {!line.productId && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Description
                    </label>
                    <input
                      type="text"
                      value={line.description}
                      placeholder="Description du service ou produit..."
                      className="input input-sm input-bordered w-full rounded-xl focus:input-accent"
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    />
                  </div>
                )}

                {/* Quantité + Prix */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Quantité
                      {available !== null && (
                        <span className={`ml-1 font-normal normal-case ${hasError ? 'text-error' : 'text-gray-400'}`}>
                          (max {available})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={line.quantity}
                      className={`input input-sm input-bordered w-full rounded-xl focus:input-accent ${hasError ? 'input-error' : ''}`}
                      min={1}
                      max={available ?? undefined}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                      Prix unitaire
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={line.unitPrice}
                        className={`input input-sm input-bordered w-full rounded-xl focus:input-accent pr-14 ${line.productId ? 'opacity-60' : ''}`}
                        min={0}
                        step={1}
                        disabled={!!line.productId}
                        onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Total ligne */}
                <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${hasError ? 'bg-error/10' : 'bg-base-200'}`}>
                  <span className="text-xs text-gray-500 font-medium">Montant HT</span>
                  <span className={`font-black text-base ${hasError ? 'text-error' : 'text-accent'}`}>
                    {(line.quantity * line.unitPrice).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            )
          })}

          {/* Sous-total */}
          {invoice.lines.length > 1 && (
            <div className="flex items-center justify-between bg-base-300 rounded-2xl px-5 py-3.5">
              <span className="text-sm font-semibold text-gray-600">Sous-total HT</span>
              <span className="font-black text-lg text-accent">
                {invoice.lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal sélection produit */}
      {openModalIndex !== null && (
        <ProductModal
          products={products}
          selectedProductId={invoice.lines[openModalIndex]?.productId}
          onSelect={(productId) => handleProductSelect(openModalIndex, productId)}
          onClose={() => setOpenModalIndex(null)}
          getAvailableStock={getAvailableStock}
          index={openModalIndex}
        />
      )}
    </div>
  )
}

export default InvoiceLines
