// @ts-nocheck
"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import Wrapper from "../components/Wrapper";
import {
  getProducts, getCategories, createProduct,
  updateProduct, deleteProduct, importProductsFromExcel
} from "../actions"
import {
  Package, Plus, Pencil, Trash2, AlertTriangle,
  Search, Filter, Upload, Download, FileSpreadsheet, TrendingUp
} from "lucide-react";
import * as XLSX from "xlsx";

type Category = { id: string; name: string };
type Product = {
  id: string; name: string; description: string;
  purchasePrice: number; price: number;
  quantity: number; alertQty: number;
  categoryId: string | null; category: Category | null;
};

const emptyForm = {
  name: "", description: "",
  purchasePrice: 0, price: 0,
  quantity: 0, alertQty: 5, categoryId: "",
};

// Calcule la marge en % et le bénéfice unitaire
const calcMargin = (purchasePrice: number, price: number) => {
  if (!purchasePrice || purchasePrice === 0) return null
  const benefit = price - purchasePrice
  const margin = ((benefit / purchasePrice) * 100).toFixed(1)
  return { benefit, margin: Number(margin) }
}

export default function InventoryPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    if (!email) return;
    const [prods, cats] = await Promise.all([getProducts(email), getCategories(email)]);
    setProducts(prods as Product[]);
    setCategories(cats as Category[]);
  };

  useEffect(() => {
    if (!email) return;
    fetchData();
  }, [email]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setForm({
        name: product.name, description: product.description,
        purchasePrice: product.purchasePrice, price: product.price,
        quantity: product.quantity, alertQty: product.alertQty,
        categoryId: product.categoryId ?? "",
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    (document.getElementById("product_modal") as HTMLDialogElement).showModal();
  };

  const handleSubmit = async () => {
    const data = {
      ...form,
      purchasePrice: Number(form.purchasePrice),
      price: Number(form.price),
      quantity: Number(form.quantity),
      alertQty: Number(form.alertQty),
      categoryId: form.categoryId || undefined,
    };
    if (editingId) { await updateProduct(editingId, data); }
    else { await createProduct(email, data); }
    await fetchData();
    (document.getElementById("product_modal") as HTMLDialogElement).close();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteProduct(id);
    await fetchData();
  };

  // ── Modèle Excel ────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["nom", "description", "prix_achat", "prix", "quantite", "seuil_alerte"],
      ["Sac de riz 50kg", "Riz importé", 20000, 25000, 100, 10],
      ["Stylo Bic", "Stylo bleu", 100, 125, 500, 50],
    ])
    ws["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Produits")
    XLSX.writeFile(wb, "modele_produits_invoice_pro.xlsx")
  }

  // ── Exporter Excel ───────────────────────────────────────────
  const handleExportExcel = () => {
    if (products.length === 0) return
    const rows = products.map((p) => {
      const m = calcMargin(p.purchasePrice, p.price)
      return {
        nom: p.name,
        description: p.description,
        prix_achat: p.purchasePrice,
        prix_vente: p.price,
        benefice_unitaire: m ? m.benefit : "",
        marge_pct: m ? `${m.margin}%` : "",
        quantite: p.quantity,
        seuil_alerte: p.alertQty,
        categorie: p.category?.name ?? "",
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    ws["!cols"] = [
      { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Produits")
    XLSX.writeFile(wb, `produits_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.xlsx`)
  }

  // ── Importer Excel ───────────────────────────────────────────
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]
      const productsToImport = rows.map((row) => ({
        name: String(row["nom"] ?? row["name"] ?? ""),
        description: String(row["description"] ?? ""),
        purchasePrice: Number(row["prix_achat"] ?? row["purchasePrice"] ?? 0),
        price: Number(row["prix"] ?? row["price"] ?? 0),
        quantity: Number(row["quantite"] ?? row["quantity"] ?? 0),
        alertQty: Number(row["seuil_alerte"] ?? row["alertQty"] ?? 5),
      })).filter((p) => p.name.trim() !== "")
      const result = await importProductsFromExcel(email, productsToImport)
      setImportResult(result)
      if (result.success) await fetchData()
    } catch (err) {
      console.error(err)
      setImportResult({ success: false, count: 0 })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const lowStockCount = products.filter((p) => p.quantity <= p.alertQty).length;

  // Stats globales bénéfice
  const totalBenefitPotential = products.reduce((acc, p) => {
    const m = calcMargin(p.purchasePrice, p.price)
    return acc + (m ? m.benefit * p.quantity : 0)
  }, 0)

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "" || p.categoryId === categoryFilter;
    return matchSearch && matchCat;
  });

  const stockColor = (p: Product) =>
    p.quantity <= p.alertQty ? "badge-error"
    : p.quantity <= p.alertQty * 2 ? "badge-warning" : "badge-success";

  const stockBarColor = (p: Product) =>
    p.quantity <= p.alertQty ? "bg-error"
    : p.quantity <= p.alertQty * 2 ? "bg-warning" : "bg-success";

  // Couleur marge
  const marginColor = (margin: number) =>
    margin < 0 ? "text-error" : margin < 10 ? "text-warning" : "text-emerald-600"

  // Aperçu marge dans le formulaire
  const formMargin = calcMargin(Number(form.purchasePrice), Number(form.price))

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Inventaire</h1>
            <p className="text-sm text-gray-500">
              {products.length} produit(s) ·{" "}
              <span className={lowStockCount > 0 ? "text-error font-medium" : "text-gray-400"}>
                {lowStockCount} stock(s) faible(s)
              </span>
              {totalBenefitPotential > 0 && (
                <span className="text-emerald-600 font-medium ml-2">
                  · Bénéfice potentiel : {totalBenefitPotential.toLocaleString('fr-FR')} FCFA
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-ghost rounded-lg gap-1.5 border border-base-300"
              onClick={handleDownloadTemplate} title="Télécharger le modèle Excel">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Modèle Excel</span>
            </button>
            <button className="btn btn-sm btn-ghost rounded-lg gap-1.5 border border-base-300"
              onClick={handleExportExcel} disabled={products.length === 0}>
              <Download className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
            <button className="btn btn-sm btn-ghost rounded-lg gap-1.5 border border-base-300"
              onClick={() => fileInputRef.current?.click()} disabled={importing}>
              {importing
                ? <span className="loading loading-spinner loading-xs" />
                : <Upload className="w-4 h-4 text-amber-600" />}
              <span className="hidden sm:inline">{importing ? "Import..." : "Importer"}</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls"
              className="hidden" onChange={handleImportExcel} />
            <button className="btn btn-sm btn-accent rounded-lg gap-2" onClick={() => openModal()}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau produit</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </div>
        </div>

        {/* Résultat import */}
        {importResult && (
          <div className={`flex items-center justify-between rounded-xl px-5 py-3 border ${
            importResult.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-error/10 border-error/20 text-error"
          }`}>
            <p className="text-sm font-medium">
              {importResult.success
                ? `✅ ${importResult.count} produit(s) importé(s) avec succès`
                : "❌ Erreur lors de l'import — vérifiez le format du fichier"}
            </p>
            <button className="btn btn-xs btn-ghost" onClick={() => setImportResult(null)}>✕</button>
          </div>
        )}

        {/* Alerte stock faible */}
        {lowStockCount > 0 && (
          <div className="flex items-center gap-3 bg-warning/10 border border-warning/20 rounded-xl px-5 py-4">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning">Stock faible détecté</p>
              <p className="text-xs text-warning/70 mt-0.5">
                {lowStockCount} produit(s) sont en dessous du seuil minimum
              </p>
            </div>
          </div>
        )}

        {/* Recherche + filtre */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher un produit..."
              className="input input-bordered w-full pl-9 rounded-lg focus:input-accent"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select className="select select-bordered pl-9 rounded-lg w-full sm:w-48 focus:select-accent"
              value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Toutes catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DESKTOP — tableau */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200 text-xs uppercase tracking-wide">
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix achat</th>
                <th>Prix vente</th>
                <th>Marge</th>
                <th>Stock</th>
                <th>Seuil</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Aucun produit trouvé</p>
                    {(search || categoryFilter) && (
                      <button className="btn btn-xs btn-ghost mt-2"
                        onClick={() => { setSearch(""); setCategoryFilter(""); }}>
                        Réinitialiser les filtres
                      </button>
                    )}
                  </td>
                </tr>
              ) : filtered.map((product) => {
                const m = calcMargin(product.purchasePrice, product.price)
                return (
                  <tr key={product.id} className="hover:bg-base-200/50 transition-colors">
                    <td className="max-w-[180px]">
                      <div className="font-semibold text-sm truncate">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-400 truncate">{product.description}</div>
                      )}
                    </td>
                    <td>
                      {product.category ? (
                        <span className="badge badge-outline badge-sm">{product.category.name}</span>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td className="text-sm text-gray-500 whitespace-nowrap">
                      {product.purchasePrice > 0
                        ? `${product.purchasePrice.toLocaleString('fr-FR')} FCFA`
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="font-semibold text-sm whitespace-nowrap">
                      {product.price.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td>
                      {m ? (
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`w-3 h-3 ${marginColor(m.margin)}`} />
                          <span className={`text-xs font-bold ${marginColor(m.margin)}`}>
                            {m.margin}%
                          </span>
                          <span className="text-xs text-gray-400">
                            (+{m.benefit.toLocaleString('fr-FR')})
                          </span>
                        </div>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td>
                      <span className={`badge badge-sm font-bold ${stockColor(product)}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400">min. {product.alertQty}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button className="btn btn-sm btn-ghost btn-circle" onClick={() => openModal(product)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button className="btn btn-sm btn-ghost btn-circle text-error hover:bg-error/10"
                          onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE — cartes */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
              <Package className="w-8 h-8 opacity-20" />
              <p className="text-sm">Aucun produit trouvé</p>
            </div>
          ) : filtered.map((product) => {
            const m = calcMargin(product.purchasePrice, product.price)
            return (
              <div key={product.id} className="bg-base-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="btn btn-xs btn-ghost btn-circle" onClick={() => openModal(product)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn btn-xs btn-ghost btn-circle text-error" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Prix + marge */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-base-300/50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Prix achat</p>
                    <p className="text-sm font-semibold">
                      {product.purchasePrice > 0
                        ? `${product.purchasePrice.toLocaleString('fr-FR')} FCFA`
                        : <span className="text-gray-300">—</span>}
                    </p>
                  </div>
                  <div className="bg-base-300/50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Prix vente</p>
                    <p className="text-sm font-bold text-accent">{product.price.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>

                {/* Marge */}
                {m && (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                    <TrendingUp className={`w-4 h-4 ${marginColor(m.margin)}`} />
                    <span className={`text-sm font-bold ${marginColor(m.margin)}`}>
                      Marge {m.margin}%
                    </span>
                    <span className="text-xs text-gray-500">
                      +{m.benefit.toLocaleString('fr-FR')} FCFA/unité
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge badge-sm font-bold ${stockColor(product)}`}>
                    {product.quantity} en stock
                  </span>
                  {product.category && (
                    <span className="badge badge-outline badge-sm">{product.category.name}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Niveau de stock</span>
                    <span>seuil min. {product.alertQty}</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${stockBarColor(product)}`}
                      style={{ width: `${Math.min((product.quantity / Math.max(product.alertQty * 3, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* Modal produit */}
      <dialog id="product_modal" className="modal modal-middle">
        <div className="modal-box w-full sm:max-w-lg rounded-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">✕</button>
          </form>
          <div className="mb-5">
            <h3 className="font-bold text-xl">{editingId ? "Modifier le produit" : "Nouveau produit"}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {editingId ? "Modifiez les informations" : "Ajoutez un produit à votre inventaire"}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Nom du produit *
              </label>
              <input type="text" placeholder="Ex: Stylo Bic"
                className="input input-bordered w-full rounded-lg focus:input-accent"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Description
              </label>
              <input type="text" placeholder="Description optionnelle"
                className="input input-bordered w-full rounded-lg focus:input-accent"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Prix achat + vente côte à côte */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Prix d&apos;achat (FCFA)
                </label>
                <input type="number" className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.purchasePrice} min={0}
                  onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Prix de vente (FCFA)
                </label>
                <input type="number" className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.price} min={0}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>

            {/* Aperçu marge en temps réel */}
            {formMargin && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
                formMargin.margin < 0 ? 'bg-error/10' : 'bg-emerald-50'
              }`}>
                <TrendingUp className={`w-4 h-4 ${marginColor(formMargin.margin)}`} />
                <div>
                  <span className={`text-sm font-bold ${marginColor(formMargin.margin)}`}>
                    Marge : {formMargin.margin}%
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formMargin.benefit > 0 ? '+' : ''}{formMargin.benefit.toLocaleString('fr-FR')} FCFA par unité)
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Quantité
                </label>
                <input type="number" className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.quantity} min={0}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Seuil alerte
                </label>
                <input type="number" className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.alertQty} min={0}
                  onChange={(e) => setForm({ ...form, alertQty: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Catégorie
              </label>
              <select className="select select-bordered w-full rounded-lg focus:select-accent"
                value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">— Sans catégorie —</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <button className="btn btn-accent w-full rounded-lg" disabled={!form.name} onClick={handleSubmit}>
              {editingId ? "Enregistrer les modifications" : "Ajouter le produit"}
            </button>
          </div>
        </div>
      </dialog>
    </Wrapper>
  );
}
