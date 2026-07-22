// @ts-nocheck
"use client"
import { Invoice, Totals } from '@/type'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { Download, Layers2 } from 'lucide-react'
import React, { useRef } from 'react'

interface FacturePDFprops {
  invoice: Invoice
  totals: Totals
}

const InvoicePDF: React.FC<FacturePDFprops> = ({ invoice, totals }) => {
  const factureRef = useRef<HTMLDivElement>(null)
  const pdfTemplateRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    const element = pdfTemplateRef.current
    if (!element) return
    try {
      element.style.display = 'block'
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        windowWidth: 794,
        width: 794,
      })
      element.style.display = 'none'
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', format: 'a4', unit: 'mm' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Facture-${invoice.name}.pdf`)
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, zIndex: 9999 })
    } catch (error) {
      if (pdfTemplateRef.current) pdfTemplateRef.current.style.display = 'none'
      console.error('Erreur lors de la génération du PDF', error)
    }
  }

  const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: 'BROUILLON', color: '#9ca3af' },
    2: { label: 'EN ATTENTE', color: '#f59e0b' },
    3: { label: 'PAYÉ', color: '#10b981' },
    4: { label: 'ANNULÉ', color: '#ef4444' },
    5: { label: 'IMPAYÉ', color: '#ef4444' },
  }
  const status = statusMap[invoice.status] ?? statusMap[1]

  return (
    <div className='mt-4'>

      {/* ── Template PDF fixe — caché, capturé au clic ──────────── */}
      <div
        ref={pdfTemplateRef}
        style={{
          display: 'none',
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          backgroundColor: '#fff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#1f2937',
          padding: '48px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#f3f4f6', borderRadius: '50%', padding: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px', fontStyle: 'italic', color: '#374151' }}>
                In<span style={{ color: '#10b981' }}>voice</span> Pro
              </span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', margin: 0, color: '#111827' }}>
              Facture
            </h1>
            <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', color: '#fff', backgroundColor: status.color }}>
              {status.label}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Numéro de facture</p>
            <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '12px' }}>
              #{invoice.id.slice(0, 8).toUpperCase()}
            </p>
            <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '12px' }} />
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
              Date : <span style={{ color: '#374151', fontWeight: 600 }}>{invoice.invoiceDate || '—'}</span>
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              Échéance : <span style={{ color: '#374151', fontWeight: 600 }}>{invoice.dueDate || '—'}</span>
            </p>
          </div>
        </div>

        {/* Émetteur / Client */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '36px' }}>
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '8px' }}>Émetteur</p>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>{invoice.issuerName || '—'}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{invoice.issuerAddress || '—'}</p>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', marginBottom: '8px' }}>Client</p>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>{invoice.clientName || '—'}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{invoice.clientAddress || '—'}</p>
          </div>
        </div>

        {/* Tableau — toutes colonnes toujours visibles */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px' }}>
          <thead>
            <tr style={{ background: '#1f2937', color: '#fff' }}>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, textAlign: 'left', width: '32px' }}>#</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>Description</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>Qté</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>Prix unitaire</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((ligne, index) => (
              <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#9ca3af' }}>{index + 1}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: '#111827' }}>{ligne.description || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563', textAlign: 'center' }}>{ligne.quantity}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563', textAlign: 'right' }}>{ligne.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#111827', textAlign: 'right' }}>{(ligne.quantity * ligne.unitPrice).toLocaleString('fr-FR')} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Total Hors Taxes</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{totals.totalHT.toLocaleString('fr-FR')} FCFA</span>
            </div>
            {invoice.vatActive && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>TVA {invoice.vatRate}%</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{totals.totalVAT.toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}
            <div style={{ height: '1px', background: '#e5e7eb', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Total TTC</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', background: '#10b981', padding: '6px 16px', borderRadius: '8px' }}>
                {totals.totalTTC.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Footer PDF */}
        <div style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#9ca3af' }}>
            Merci pour votre confiance —{' '}
            <span style={{ fontWeight: 700, color: '#6b7280' }}>
              In<span style={{ color: '#10b981' }}>voice</span> Pro
            </span>
          </p>
        </div>
      </div>

      {/* ── Aperçu responsive — affiché à l'écran uniquement ─────── */}
      <div className='border-2 border-dashed border-base-300 rounded-2xl p-3 sm:p-5'>
        <div className='flex items-center justify-between mb-4 sm:mb-5'>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>Aperçu PDF</span>
          <button onClick={handleDownloadPDF} className='btn btn-sm btn-accent rounded-lg gap-2'>
            <Download className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>Télécharger PDF</span>
            <span className='sm:hidden'>PDF</span>
          </button>
        </div>

        <div className='w-full overflow-x-auto'>
          <div ref={factureRef} className='bg-white text-gray-800 rounded-xl shadow-sm' style={{ minWidth: '320px', padding: 'clamp(16px, 5vw, 40px)' }}>

            {/* Header aperçu */}
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 sm:mb-10'>
              <div>
                <div className='flex items-center gap-2 mb-3 sm:mb-4'>
                  <div className='bg-gray-100 rounded-full p-2'>
                    <Layers2 className='w-4 h-4 sm:w-5 sm:h-5 text-gray-700' />
                  </div>
                  <span className='font-bold text-base sm:text-lg text-gray-700 italic'>
                    In<span className='text-emerald-500'>voice</span> Pro
                  </span>
                </div>
                <h1 className='text-3xl sm:text-5xl font-black uppercase text-gray-800 tracking-tight'>Facture</h1>
                <span className='inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full text-white' style={{ backgroundColor: status.color }}>
                  {status.label}
                </span>
              </div>
              <div className='text-left sm:text-right space-y-1'>
                <p className='text-xs text-gray-400 uppercase tracking-wide'>Numéro de facture</p>
                <p className='font-mono font-bold text-gray-800 text-sm'>#{invoice.id.slice(0, 8).toUpperCase()}</p>
                <div className='h-px bg-gray-100 my-2' />
                <p className='text-xs text-gray-400'>Date : <span className='text-gray-700 font-medium'>{invoice.invoiceDate || '—'}</span></p>
                <p className='text-xs text-gray-400'>Échéance : <span className='text-gray-700 font-medium'>{invoice.dueDate || '—'}</span></p>
              </div>
            </div>

            {/* Émetteur / Client aperçu */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-10'>
              <div className='bg-gray-50 rounded-xl p-3 sm:p-4'>
                <p className='text-xs font-bold uppercase tracking-wide text-gray-400 mb-2'>Émetteur</p>
                <p className='font-bold text-gray-800 text-sm sm:text-base'>{invoice.issuerName || '—'}</p>
                <p className='text-xs sm:text-sm text-gray-500 mt-1 whitespace-pre-line'>{invoice.issuerAddress || '—'}</p>
              </div>
              <div className='bg-gray-50 rounded-xl p-3 sm:p-4'>
                <p className='text-xs font-bold uppercase tracking-wide text-gray-400 mb-2'>Client</p>
                <p className='font-bold text-gray-800 text-sm sm:text-base'>{invoice.clientName || '—'}</p>
                <p className='text-xs sm:text-sm text-gray-500 mt-1 whitespace-pre-line'>{invoice.clientAddress || '—'}</p>
              </div>
            </div>

            {/* Tableau aperçu */}
            <div className='rounded-xl overflow-hidden border border-gray-100 mb-6 sm:mb-8'>
              <table className='w-full text-xs sm:text-sm'>
                <thead>
                  <tr className='bg-gray-800 text-white'>
                    <th className='text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold w-6 sm:w-8'>#</th>
                    <th className='text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold'>Description</th>
                    <th className='text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold'>Qté</th>
                    <th className='text-right px-2 sm:px-4 py-2 sm:py-3 font-semibold hidden sm:table-cell'>Prix unitaire</th>
                    <th className='text-right px-2 sm:px-4 py-2 sm:py-3 font-semibold'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((ligne, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className='px-2 sm:px-4 py-2 sm:py-3 text-gray-400 text-xs'>{index + 1}</td>
                      <td className='px-2 sm:px-4 py-2 sm:py-3 text-gray-800 font-medium'>
                        {ligne.description || '—'}
                        <span className='block text-gray-400 text-xs font-normal sm:hidden'>
                          {ligne.unitPrice.toLocaleString('fr-FR')} FCFA / u.
                        </span>
                      </td>
                      <td className='px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-600'>{ligne.quantity}</td>
                      <td className='px-2 sm:px-4 py-2 sm:py-3 text-right text-gray-600 hidden sm:table-cell'>
                        {ligne.unitPrice.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className='px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-gray-800'>
                        {(ligne.quantity * ligne.unitPrice).toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux aperçu */}
            <div className='flex justify-end'>
              <div className='w-full sm:w-72 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Total Hors Taxes</span>
                  <span className='font-semibold text-gray-800'>{totals.totalHT.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {invoice.vatActive && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>TVA {invoice.vatRate}%</span>
                    <span className='font-semibold text-gray-800'>{totals.totalVAT.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                <div className='h-px bg-gray-200 my-1' />
                <div className='flex justify-between items-center'>
                  <span className='font-bold text-gray-800'>Total TTC</span>
                  <span className='font-black text-base sm:text-lg bg-emerald-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg'>
                    {totals.totalTTC.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Footer aperçu */}
            <div className='mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-100 text-center'>
              <p className='text-xs text-gray-400'>
                Merci pour votre confiance —{' '}
                <span className='font-semibold text-gray-500'>
                  In<span className='text-emerald-500'>voice</span> Pro
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoicePDF
