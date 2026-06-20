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

  const handleDownloadPDF = async () => {
    const element = factureRef.current
    if (element) {
      try {
        const canvas = await html2canvas(element, { scale: 3, useCORS: true })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: "portrait",
          format: "A4",
          unit: "mm"
        })
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Facture-${invoice.name}.pdf`)
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999
        })
      } catch (error) {
        console.error('Erreur lors de la génération du PDF', error)
      }
    }
  }

  // Statut badge
  const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: "BROUILLON", color: "#9ca3af" },
    2: { label: "EN ATTENTE", color: "#f59e0b" },
    3: { label: "PAYÉ", color: "#10b981" },
    4: { label: "ANNULÉ", color: "#ef4444" },
    5: { label: "IMPAYÉ", color: "#ef4444" },
  }
  const status = statusMap[invoice.status] ?? statusMap[1]

  return (
    <div className='mt-4 hidden lg:block'>
      <div className='border-2 border-dashed border-base-300 rounded-2xl p-5'>

        {/* Bouton téléchargement */}
        <div className='flex items-center justify-between mb-5'>
          <span className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
            Aperçu PDF
          </span>
          <button
            onClick={handleDownloadPDF}
            className='btn btn-sm btn-accent rounded-lg gap-2'
          >
            <Download className='w-3.5 h-3.5' />
            Télécharger PDF
          </button>
        </div>

        {/* Contenu PDF */}
        <div ref={factureRef} className='bg-white text-gray-800 rounded-xl p-10 shadow-sm'>

          {/* Header */}
          <div className='flex justify-between items-start mb-10'>
            {/* Logo + titre */}
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <div className='bg-gray-100 rounded-full p-2'>
                  <Layers2 className='w-5 h-5 text-gray-700' />
                </div>
                <span className='font-bold text-lg text-gray-700 italic'>
                  In<span className='text-violet-600'>voice</span>
                </span>
              </div>
              <h1 className='text-5xl font-black uppercase text-gray-800 tracking-tight'>
                Facture
              </h1>
              {/* Badge statut */}
              <span
                className='inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full text-white'
                style={{ backgroundColor: status.color }}
              >
                {status.label}
              </span>
            </div>

            {/* Infos facture */}
            <div className='text-right space-y-1'>
              <p className='text-xs text-gray-400 uppercase tracking-wide'>
                Numéro de facture
              </p>
              <p className='font-mono font-bold text-gray-800 text-sm'>
                #{invoice.id.slice(0, 8).toUpperCase()}
              </p>
              <div className='h-px bg-gray-100 my-2' />
              <p className='text-xs text-gray-400'>
                Date : <span className='text-gray-700 font-medium'>{invoice.invoiceDate || '—'}</span>
              </p>
              <p className='text-xs text-gray-400'>
                {"Échéance : "}<span className='text-gray-700 font-medium'>{invoice.dueDate || '—'}</span>
              </p>
            </div>
          </div>

          {/* Émetteur / Client */}
          <div className='grid grid-cols-2 gap-6 mb-10'>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs font-bold uppercase tracking-wide text-gray-400 mb-2'>
                Émetteur
              </p>
              <p className='font-bold text-gray-800'>{invoice.issuerName || '—'}</p>
              <p className='text-sm text-gray-500 mt-1 whitespace-pre-line'>
                {invoice.issuerAddress || '—'}
              </p>
            </div>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs font-bold uppercase tracking-wide text-gray-400 mb-2'>
                Client
              </p>
              <p className='font-bold text-gray-800'>{invoice.clientName || '—'}</p>
              <p className='text-sm text-gray-500 mt-1 whitespace-pre-line'>
                {invoice.clientAddress || '—'}
              </p>
            </div>
          </div>

          {/* Tableau des lignes */}
          <div className='rounded-xl overflow-hidden border border-gray-100 mb-8'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-800 text-white'>
                  <th className='text-left px-4 py-3 font-semibold w-8'>#</th>
                  <th className='text-left px-4 py-3 font-semibold'>Description</th>
                  <th className='text-center px-4 py-3 font-semibold'>Qté</th>
                  <th className='text-right px-4 py-3 font-semibold'>Prix unitaire</th>
                  <th className='text-right px-4 py-3 font-semibold'>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((ligne, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className='px-4 py-3 text-gray-400 text-xs'>{index + 1}</td>
                    <td className='px-4 py-3 text-gray-800 font-medium'>
                      {ligne.description || '—'}
                    </td>
                    <td className='px-4 py-3 text-center text-gray-600'>
                      {ligne.quantity}
                    </td>
                    <td className='px-4 py-3 text-right text-gray-600'>
                      {ligne.unitPrice.toLocaleString()} FCFA
                    </td>
                    <td className='px-4 py-3 text-right font-bold text-gray-800'>
                      {(ligne.quantity * ligne.unitPrice).toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className='flex justify-end'>
            <div className='w-72 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Total Hors Taxes</span>
                <span className='font-semibold text-gray-800'>
                  {totals.totalHT.toLocaleString()} FCFA
                </span>
              </div>
              {invoice.vatActive && (
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>TVA {invoice.vatRate}%</span>
                  <span className='font-semibold text-gray-800'>
                    {totals.totalVAT.toLocaleString()} FCFA
                  </span>
                </div>
              )}
              <div className='h-px bg-gray-200 my-1' />
              <div className='flex justify-between items-center'>
                <span className='font-bold text-gray-800'>Total TTC</span>
                <span className='font-black text-lg bg-violet-600 text-white px-4 py-1.5 rounded-lg'>
                  {totals.totalTTC.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className='mt-12 pt-6 border-t border-gray-100 text-center'>
            <p className='text-xs text-gray-400'>
              Merci pour votre confiance —{' '}
              <span className='font-semibold text-gray-500'>
                In<span className='text-violet-600'>voice</span>
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default InvoicePDF