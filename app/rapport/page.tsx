// @ts-nocheck
"use client"
import { useEffect, useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import Wrapper from "../components/Wrapper"
import { getTransactions } from "../actions"
import {
  TrendingUp, ArrowUpCircle, ArrowDownCircle,
  Download, Calendar, FileText
} from "lucide-react"
import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf"

type Transaction = {
  id: string; type: string; category: string
  description: string; amount: number; date: string
}
type PeriodType = "semaine" | "mois" | "custom"

const getWeekRange = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(new Date().setDate(diff))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] }
}

const getMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] }
}

const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]

export default function ReportPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const pdfTemplateRef = useRef<HTMLDivElement>(null)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [periodType, setPeriodType] = useState<PeriodType>("mois")
  const [dateRange, setDateRange] = useState(getMonthRange())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => { if (email) fetchData() }, [email])

  const fetchData = async () => {
    if (!email) return
    const data = await getTransactions(email)
    setTransactions(data as Transaction[])
  }

  const handlePeriodChange = (type: PeriodType) => {
    setPeriodType(type)
    if (type === "semaine") setDateRange(getWeekRange())
    else if (type === "mois") {
      const start = new Date(selectedYear, selectedMonth, 1)
      const end = new Date(selectedYear, selectedMonth + 1, 0)
      setDateRange({ start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] })
    }
  }

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    setDateRange({ start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] })
  }

  const filtered = transactions.filter((t) => t.date && t.date >= dateRange.start && t.date <= dateRange.end)
  const entrees = filtered.filter((t) => t.type === "entree")
  const sorties = filtered.filter((t) => t.type === "sortie")
  const totalEntrees = entrees.reduce((acc, t) => acc + t.amount, 0)
  const totalSorties = sorties.reduce((acc, t) => acc + t.amount, 0)
  const soldeNet = totalEntrees - totalSorties

  const groupByCategory = (items: Transaction[]) =>
    items.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {} as Record<string, number>)

  const entreesParCat = groupByCategory(entrees)
  const sortiesParCat = groupByCategory(sorties)

  const periodTitle = () => {
    if (periodType === "semaine") return `Semaine du ${dateRange.start} au ${dateRange.end}`
    if (periodType === "mois") return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
    return `Du ${dateRange.start} au ${dateRange.end}`
  }

  // ── Export PDF — capture le template caché ─────────────────
  const handleExportPDF = async () => {
    const element = pdfTemplateRef.current
    if (!element) return
    setIsGenerating(true)
    try {
      element.style.display = 'block'
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        windowWidth: 794,
        width: 794,
        backgroundColor: '#ffffff',
      })
      element.style.display = 'none'
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", format: "a4", unit: "mm" })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      // Si le contenu dépasse une page A4, on pagine
      const pageHeight = pdf.internal.pageSize.getHeight()
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      } else {
        let yPos = 0
        const imgHeightMm = pdfHeight
        while (yPos < imgHeightMm) {
          if (yPos > 0) pdf.addPage()
          pdf.addImage(imgData, "PNG", 0, -yPos, pdfWidth, pdfHeight)
          yPos += pageHeight
        }
      }
      pdf.save(`rapport_${periodType}_${dateRange.start}.pdf`)
    } catch (error) {
      console.error(error)
    } finally {
      if (pdfTemplateRef.current) pdfTemplateRef.current.style.display = 'none'
      setIsGenerating(false)
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // ── Styles inline pour le template PDF ─────────────────────
  const s = {
    page: { fontFamily: 'Arial, Helvetica, sans-serif', color: '#1f2937', backgroundColor: '#ffffff', padding: '48px', width: '794px', boxSizing: 'border-box' as const },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f3f4f6', paddingBottom: '20px', marginBottom: '28px' },
    title: { fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0 },
    subtitle: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
    cardRow: { display: 'flex', gap: '16px', marginBottom: '28px' },
    card: (bg: string) => ({ flex: 1, background: bg, borderRadius: '12px', padding: '16px', textAlign: 'center' as const }),
    cardLabel: (color: string) => ({ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, color, marginBottom: '6px', letterSpacing: '1px' }),
    cardAmount: (color: string) => ({ fontSize: '20px', fontWeight: 900, color }),
    cardUnit: (color: string) => ({ fontSize: '10px', color, marginTop: '2px' }),
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
    sectionLabel: { fontSize: '14px', fontWeight: 700, color: '#111827' },
    sectionCount: { fontSize: '12px', color: '#9ca3af' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
    rowLabel: { fontSize: '13px', color: '#4b5563' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' },
    totalLabel: { fontSize: '13px', fontWeight: 700, color: '#111827' },
    empty: { fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' as const },
    bilan: (pos: boolean) => ({ borderRadius: '12px', padding: '16px 20px', border: `2px solid ${pos ? '#6ee7b7' : '#fca5a5'}`, background: pos ? '#f0fdf4' : '#fff5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }),
    bilanLabel: { fontSize: '14px', fontWeight: 900, color: '#111827' },
    bilanAmount: (pos: boolean) => ({ fontSize: '20px', fontWeight: 900, color: pos ? '#059669' : '#dc2626' }),
    bilanNote: { fontSize: '11px', color: '#6b7280', marginTop: '6px' },
    txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f9fafb' },
    dot: (type: string) => ({ width: '8px', height: '8px', borderRadius: '50%', background: type === 'entree' ? '#34d399' : '#f87171', flexShrink: 0 }),
    footer: { borderTop: '1px solid #f3f4f6', paddingTop: '16px', textAlign: 'center' as const, fontSize: '11px', color: '#9ca3af', marginTop: '24px' },
  }

  return (
    <Wrapper>

      {/* ── Template PDF caché ────────────────────────────────── */}
      <div
        ref={pdfTemplateRef}
        style={{ display: 'none', position: 'fixed', left: '-9999px', top: 0, ...s.page }}
      >
        {/* En-tête */}
        <div style={s.header}>
          <div>
            <p style={s.title}>Rapport financier</p>
            <p style={s.subtitle}>{periodTitle()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', color: '#9ca3af' }}>Généré le</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              {new Date().toLocaleDateString('fr-FR')}
            </p>
            <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic' }}>
              Invoice Pro
            </p>
          </div>
        </div>

        {/* 3 cartes résumé */}
        <div style={s.cardRow}>
          <div style={s.card('#f0fdf4')}>
            <p style={s.cardLabel('#059669')}>Entrées</p>
            <p style={s.cardAmount('#059669')}>+{totalEntrees.toLocaleString('fr-FR')}</p>
            <p style={s.cardUnit('#6ee7b7')}>FCFA</p>
          </div>
          <div style={s.card('#fff5f5')}>
            <p style={s.cardLabel('#dc2626')}>Sorties</p>
            <p style={s.cardAmount('#dc2626')}>-{totalSorties.toLocaleString('fr-FR')}</p>
            <p style={s.cardUnit('#fca5a5')}>FCFA</p>
          </div>
          <div style={s.card(soldeNet >= 0 ? '#eff6ff' : '#fff5f5')}>
            <p style={s.cardLabel(soldeNet >= 0 ? '#2563eb' : '#dc2626')}>Solde net</p>
            <p style={s.cardAmount(soldeNet >= 0 ? '#2563eb' : '#dc2626')}>
              {soldeNet >= 0 ? '+' : ''}{soldeNet.toLocaleString('fr-FR')}
            </p>
            <p style={s.cardUnit(soldeNet >= 0 ? '#93c5fd' : '#fca5a5')}>FCFA</p>
          </div>
        </div>

        {/* Entrées */}
        <div style={{ marginBottom: '24px' }}>
          <div style={s.sectionTitle}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            <span style={s.sectionLabel}>Entrées</span>
            <span style={s.sectionCount}>({entrees.length} transaction{entrees.length > 1 ? 's' : ''})</span>
          </div>
          {Object.keys(entreesParCat).length === 0 ? (
            <p style={s.empty}>Aucune entrée sur cette période</p>
          ) : (
            <>
              {Object.entries(entreesParCat).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} style={s.row}>
                  <span style={s.rowLabel}>{cat}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                    +{amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total entrées</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#059669' }}>
                  +{totalEntrees.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </>
          )}
        </div>

        {/* Sorties */}
        <div style={{ marginBottom: '24px' }}>
          <div style={s.sectionTitle}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
            <span style={s.sectionLabel}>Sorties</span>
            <span style={s.sectionCount}>({sorties.length} transaction{sorties.length > 1 ? 's' : ''})</span>
          </div>
          {Object.keys(sortiesParCat).length === 0 ? (
            <p style={s.empty}>Aucune sortie sur cette période</p>
          ) : (
            <>
              {Object.entries(sortiesParCat).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} style={s.row}>
                  <span style={s.rowLabel}>{cat}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                    -{amount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total sorties</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#dc2626' }}>
                  -{totalSorties.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </>
          )}
        </div>

        {/* Bilan */}
        <div style={s.bilan(soldeNet >= 0)}>
          <div>
            <p style={s.bilanLabel}>Bilan net de la période</p>
            <p style={s.bilanNote}>
              {soldeNet >= 0
                ? `✅ Bénéfice de ${soldeNet.toLocaleString('fr-FR')} FCFA`
                : `⚠️ Dépenses supérieures de ${Math.abs(soldeNet).toLocaleString('fr-FR')} FCFA`}
            </p>
          </div>
          <span style={s.bilanAmount(soldeNet >= 0)}>
            {soldeNet >= 0 ? '+' : ''}{soldeNet.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        {/* Détail transactions */}
        {filtered.length > 0 && (
          <div>
            <p style={{ ...s.sectionLabel, marginBottom: '10px' }}>
              Détail des transactions ({filtered.length})
            </p>
            {filtered.map((t) => (
              <div key={t.id} style={s.txRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={s.dot(t.type)} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#374151', margin: 0 }}>
                      {t.description || t.category}
                    </p>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
                      {t.date} · {t.category}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: t.type === 'entree' ? '#059669' : '#dc2626' }}>
                  {t.type === 'entree' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={s.footer}>
          Rapport généré par <strong>Invoice Pro</strong> — Conçu pour les PME d'Afrique centrale
        </div>
      </div>

      {/* ── Interface visible (responsive) ───────────────────── */}
      <div className="flex flex-col space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Rapport financier</h1>
            <p className="text-sm text-gray-500">Analyse de vos entrées et sorties</p>
          </div>
          <button
            className="btn btn-accent rounded-lg gap-2 w-full sm:w-auto"
            onClick={handleExportPDF}
            disabled={isGenerating}
          >
            {isGenerating
              ? <span className="loading loading-spinner loading-xs" />
              : <Download className="w-4 h-4" />
            }
            {isGenerating ? "Génération..." : "Exporter PDF"}
          </button>
        </div>

        {/* Sélecteur période */}
        <div className="bg-base-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Période</p>
          <div className="flex gap-2 flex-wrap">
            {[{ key: "semaine", label: "Cette semaine" }, { key: "mois", label: "Par mois" }, { key: "custom", label: "Personnalisé" }].map(({ key, label }) => (
              <button key={key}
                className={`btn btn-sm rounded-lg ${periodType === key ? "btn-accent" : "btn-ghost border border-base-300"}`}
                onClick={() => handlePeriodChange(key as PeriodType)}
              >
                {label}
              </button>
            ))}
          </div>

          {periodType === "mois" && (
            <div className="flex gap-3 flex-wrap">
              <select className="select select-bordered rounded-lg focus:select-accent flex-1 sm:flex-none"
                value={selectedMonth} onChange={(e) => handleMonthChange(Number(e.target.value), selectedYear)}>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select className="select select-bordered rounded-lg focus:select-accent flex-1 sm:flex-none"
                value={selectedYear} onChange={(e) => handleMonthChange(selectedMonth, Number(e.target.value))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {periodType === "custom" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Du</label>
                <input type="date" className="input input-bordered rounded-lg focus:input-accent w-full"
                  value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Au</label>
                <input type="date" className="input input-bordered rounded-lg focus:input-accent w-full"
                  value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
              </div>
            </div>
          )}

          {periodType === "semaine" && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateRange.start} → {dateRange.end}
            </p>
          )}
        </div>

        {/* 3 cartes résumé */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Entrées</p>
            <p className="text-2xl font-black text-emerald-600">+{totalEntrees.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-emerald-400">FCFA</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-xs text-red-500 font-semibold uppercase mb-1">Sorties</p>
            <p className="text-2xl font-black text-red-500">-{totalSorties.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-red-400">FCFA</p>
          </div>
          <div className={`rounded-2xl p-4 text-center border ${soldeNet >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-error/10 border-error/20'}`}>
            <p className={`text-xs font-semibold uppercase mb-1 ${soldeNet >= 0 ? 'text-blue-600' : 'text-error'}`}>Solde net</p>
            <p className={`text-2xl font-black ${soldeNet >= 0 ? 'text-blue-600' : 'text-error'}`}>
              {soldeNet >= 0 ? '+' : ''}{soldeNet.toLocaleString('fr-FR')}
            </p>
            <p className={`text-xs ${soldeNet >= 0 ? 'text-blue-400' : 'text-error/70'}`}>FCFA</p>
          </div>
        </div>

        {/* Détail entrées */}
        <div className="bg-white rounded-2xl border border-base-300 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-800">Entrées</h3>
            <span className="text-sm text-gray-400">({entrees.length})</span>
          </div>
          {Object.keys(entreesParCat).length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune entrée sur cette période</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(entreesParCat).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{cat}</span>
                  <span className="text-sm font-bold text-emerald-600">+{amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
              <div className="flex justify-between pt-1">
                <span className="text-sm font-bold">Total</span>
                <span className="text-sm font-black text-emerald-600">+{totalEntrees.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          )}
        </div>

        {/* Détail sorties */}
        <div className="bg-white rounded-2xl border border-base-300 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownCircle className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-gray-800">Sorties</h3>
            <span className="text-sm text-gray-400">({sorties.length})</span>
          </div>
          {Object.keys(sortiesParCat).length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune sortie sur cette période</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(sortiesParCat).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{cat}</span>
                  <span className="text-sm font-bold text-red-500">-{amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
              <div className="flex justify-between pt-1">
                <span className="text-sm font-bold">Total</span>
                <span className="text-sm font-black text-red-500">-{totalSorties.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          )}
        </div>

        {/* Bilan */}
        <div className={`rounded-2xl p-4 sm:p-5 border-2 ${soldeNet >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-error/20 bg-error/5'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${soldeNet >= 0 ? 'text-emerald-600' : 'text-error'}`} />
              <span className="font-black text-gray-800">Bilan net de la période</span>
            </div>
            <span className={`text-2xl font-black ${soldeNet >= 0 ? 'text-emerald-600' : 'text-error'}`}>
              {soldeNet >= 0 ? '+' : ''}{soldeNet.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {soldeNet >= 0
              ? `✅ Bénéfice de ${soldeNet.toLocaleString('fr-FR')} FCFA sur cette période`
              : `⚠️ Dépenses supérieures de ${Math.abs(soldeNet).toLocaleString('fr-FR')} FCFA`}
          </p>
        </div>

        {/* Transactions */}
        {filtered.length > 0 && (
          <div className="bg-white rounded-2xl border border-base-300 p-4 sm:p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Toutes les transactions ({filtered.length})
            </h3>
            <div className="space-y-1.5">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${t.type === 'entree' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{t.description || t.category}</p>
                    <p className="text-[10px] text-gray-400">{t.date} · {t.category}</p>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${t.type === 'entree' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.type === 'entree' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Wrapper>
  )
}
