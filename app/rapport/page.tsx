// @ts-nocheck
"use client"
import { useEffect, useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import Wrapper from "../components/Wrapper"
import { getTransactions, getInvoicesByEmail } from "../actions"
import {
  TrendingUp, TrendingDown, ArrowUpCircle,
  ArrowDownCircle, Download, Calendar, FileText
} from "lucide-react"
import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf"

type Transaction = {
  id: string
  type: string
  category: string
  description: string
  amount: number
  date: string
}

type PeriodType = "semaine" | "mois" | "custom"

// Obtenir début et fin de semaine courante
const getWeekRange = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(now.setDate(diff))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  }
}

// Obtenir début et fin du mois courant
const getMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  }
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

export default function ReportPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const reportRef = useRef<HTMLDivElement>(null)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [periodType, setPeriodType] = useState<PeriodType>("mois")
  const [dateRange, setDateRange] = useState(getMonthRange())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    if (email) fetchData()
  }, [email])

  const fetchData = async () => {
    if (!email) return
    const data = await getTransactions(email)
    setTransactions(data as Transaction[])
  }

  // Changer la période
  const handlePeriodChange = (type: PeriodType) => {
    setPeriodType(type)
    if (type === "semaine") setDateRange(getWeekRange())
    else if (type === "mois") {
      const start = new Date(selectedYear, selectedMonth, 1)
      const end = new Date(selectedYear, selectedMonth + 1, 0)
      setDateRange({
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      })
    }
  }

  // Changer mois/année
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month)
    setSelectedYear(year)
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    })
  }

  // Filtrer les transactions par période
  const filtered = transactions.filter((t) => {
    if (!t.date) return false
    return t.date >= dateRange.start && t.date <= dateRange.end
  })

  const entrees = filtered.filter((t) => t.type === "entree")
  const sorties = filtered.filter((t) => t.type === "sortie")

  const totalEntrees = entrees.reduce((acc, t) => acc + t.amount, 0)
  const totalSorties = sorties.reduce((acc, t) => acc + t.amount, 0)
  const soldeNet = totalEntrees - totalSorties

  // Grouper par catégorie
  const groupByCategory = (items: Transaction[]) => {
    return items.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  }

  const entreesParCat = groupByCategory(entrees)
  const sortiesParCat = groupByCategory(sorties)

  // Titre de la période
  const periodTitle = () => {
    if (periodType === "semaine") return `Semaine du ${dateRange.start} au ${dateRange.end}`
    if (periodType === "mois") return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
    return `Du ${dateRange.start} au ${dateRange.end}`
  }

  // Export PDF
  const handleExportPDF = async () => {
    const element = reportRef.current
    if (!element) return
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", format: "a4", unit: "mm" })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`rapport_${periodType}_${dateRange.start}.pdf`)
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Rapport financier</h1>
            <p className="text-sm text-gray-500">Analyse de vos entrées et sorties</p>
          </div>
          <button
            className="btn btn-accent rounded-lg gap-2"
            onClick={handleExportPDF}
            disabled={isGenerating}
          >
            {isGenerating
              ? <span className="loading loading-spinner loading-xs" />
              : <Download className="w-4 h-4" />
            }
            Exporter PDF
          </button>
        </div>

        {/* Sélecteur de période */}
        <div className="bg-base-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Période du rapport
          </p>

          {/* Boutons type période */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "semaine", label: "Cette semaine" },
              { key: "mois", label: "Par mois" },
              { key: "custom", label: "Personnalisé" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`btn btn-sm rounded-lg ${
                  periodType === key ? "btn-accent" : "btn-ghost border border-base-300"
                }`}
                onClick={() => handlePeriodChange(key as PeriodType)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sélecteur mois/année */}
          {periodType === "mois" && (
            <div className="flex gap-3 flex-wrap">
              <select
                className="select select-bordered rounded-lg focus:select-accent"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value), selectedYear)}
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                className="select select-bordered rounded-lg focus:select-accent"
                value={selectedYear}
                onChange={(e) => handleMonthChange(selectedMonth, Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Dates personnalisées */}
          {periodType === "custom" && (
            <div className="flex gap-3 flex-wrap items-center">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Du</label>
                <input
                  type="date"
                  className="input input-bordered rounded-lg focus:input-accent"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Au</label>
                <input
                  type="date"
                  className="input input-bordered rounded-lg focus:input-accent"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Semaine affichée */}
          {periodType === "semaine" && (
            <p className="text-sm text-gray-500">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              {dateRange.start} → {dateRange.end}
            </p>
          )}
        </div>

        {/* Rapport — capturé pour PDF */}
        <div ref={reportRef} className="bg-white rounded-2xl border border-base-300 p-6 space-y-6">

          {/* En-tête rapport */}
          <div className="flex items-center justify-between border-b border-base-200 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Rapport financier</h2>
              <p className="text-sm text-gray-500 mt-0.5">{periodTitle()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Généré le</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Résumé 3 cartes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Entrées</p>
              <p className="text-lg font-black text-emerald-600">
                +{totalEntrees.toLocaleString('fr-FR')}
              </p>
              <p className="text-xs text-emerald-500">FCFA</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-xs text-red-500 font-semibold uppercase mb-1">Sorties</p>
              <p className="text-lg font-black text-red-500">
                -{totalSorties.toLocaleString('fr-FR')}
              </p>
              <p className="text-xs text-red-400">FCFA</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${
              soldeNet >= 0 ? 'bg-blue-50' : 'bg-error/10'
            }`}>
              <p className={`text-xs font-semibold uppercase mb-1 ${
                soldeNet >= 0 ? 'text-blue-600' : 'text-error'
              }`}>Solde net</p>
              <p className={`text-lg font-black ${
                soldeNet >= 0 ? 'text-blue-600' : 'text-error'
              }`}>
                {soldeNet >= 0 ? '+' : ''}{soldeNet.toLocaleString('fr-FR')}
              </p>
              <p className={`text-xs ${soldeNet >= 0 ? 'text-blue-400' : 'text-error/70'}`}>FCFA</p>
            </div>
          </div>

          {/* Détail Entrées */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-800">Entrées</h3>
              <span className="text-sm text-gray-400">({entrees.length} transaction{entrees.length > 1 ? 's' : ''})</span>
            </div>
            {Object.keys(entreesParCat).length === 0 ? (
              <p className="text-sm text-gray-400 italic">Aucune entrée sur cette période</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(entreesParCat)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{cat}</span>
                      <span className="text-sm font-bold text-emerald-600">
                        +{amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ))
                }
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-gray-800">Total entrées</span>
                  <span className="text-sm font-black text-emerald-600">
                    +{totalEntrees.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Détail Sorties */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownCircle className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-gray-800">Sorties</h3>
              <span className="text-sm text-gray-400">({sorties.length} transaction{sorties.length > 1 ? 's' : ''})</span>
            </div>
            {Object.keys(sortiesParCat).length === 0 ? (
              <p className="text-sm text-gray-400 italic">Aucune sortie sur cette période</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(sortiesParCat)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{cat}</span>
                      <span className="text-sm font-bold text-red-500">
                        -{amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ))
                }
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-gray-800">Total sorties</span>
                  <span className="text-sm font-black text-red-500">
                    -{totalSorties.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bilan final */}
          <div className={`rounded-xl p-4 border-2 ${
            soldeNet >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-error/20 bg-error/5'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${soldeNet >= 0 ? 'text-emerald-600' : 'text-error'}`} />
                <span className="font-black text-gray-800">Bilan net de la période</span>
              </div>
              <span className={`text-xl font-black ${soldeNet >= 0 ? 'text-emerald-600' : 'text-error'}`}>
                {soldeNet >= 0 ? '+' : ''}{soldeNet.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {soldeNet >= 0
                ? `✅ Vous avez dégagé un bénéfice de ${soldeNet.toLocaleString('fr-FR')} FCFA sur cette période`
                : `⚠️ Vos dépenses dépassent vos revenus de ${Math.abs(soldeNet).toLocaleString('fr-FR')} FCFA`
              }
            </p>
          </div>

          {/* Détail des transactions */}
          {filtered.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Détail des transactions ({filtered.length})
              </h3>
              <div className="space-y-1">
                {filtered.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        t.type === 'entree' ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {t.description || t.category}
                        </p>
                        <p className="text-[10px] text-gray-400">{t.date} · {t.category}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${
                      t.type === 'entree' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {t.type === 'entree' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pied de page rapport */}
          <div className="border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-400">
              Rapport généré par <span className="font-semibold">Invoice Pro</span> —
              Conçu pour les PME d&apos;Afrique centrale
            </p>
          </div>
        </div>

      </div>
    </Wrapper>
  )
}
