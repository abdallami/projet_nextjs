// @ts-nocheck
"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../actions"
import {
  Package, Plus, Pencil, Trash2,
  AlertTriangle, Search, Filter
} from "lucide-react";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  alertQty: number;
  categoryId: string | null;
  category: Category | null;
};

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  quantity: 0,
  alertQty: 5,
  categoryId: "",
};

export default function InventoryPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchData = async () => {
    if (!email) return;
    const [prods, cats] = await Promise.all([
      getProducts(email),
      getCategories(email),
    ]);
    setProducts(prods as Product[]);
    setCategories(cats as Category[]);
  };

  useEffect(() => {
    if (!email) return;
    const load = async () => { await fetchData(); };
    load();
  }, [email]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        alertQty: product.alertQty,
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
      price: Number(form.price),
      quantity: Number(form.quantity),
      alertQty: Number(form.alertQty),
      categoryId: form.categoryId || undefined,
    };
    if (editingId) {
      await updateProduct(editingId, data);
    } else {
      await createProduct(email, data);
    }
    await fetchData();
    (document.getElementById("product_modal") as HTMLDialogElement).close();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await deleteProduct(id);
    await fetchData();
  };

  const lowStockCount = products.filter((p) => p.quantity <= p.alertQty).length;

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "" || p.categoryId === categoryFilter;
    return matchSearch && matchCat;
  });

  const stockColor = (p: Product) =>
    p.quantity <= p.alertQty
      ? "badge-error"
      : p.quantity <= p.alertQty * 2
      ? "badge-warning"
      : "badge-success";

  const stockBarColor = (p: Product) =>
    p.quantity <= p.alertQty
      ? "bg-error"
      : p.quantity <= p.alertQty * 2
      ? "bg-warning"
      : "bg-success";

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Inventaire</h1>
            <p className="text-sm text-gray-500">
              {products.length} produit(s) ·{" "}
              <span className={lowStockCount > 0 ? "text-error font-medium" : "text-gray-400"}>
                {lowStockCount} stock(s) faible(s)
              </span>
            </p>
          </div>
          <button
            className="btn btn-accent rounded-lg gap-2 w-full sm:w-auto"
            onClick={() => openModal()}
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </button>
        </div>

        {/* Alerte */}
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
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="input input-bordered w-full pl-9 rounded-lg focus:input-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="select select-bordered pl-9 rounded-lg w-full sm:w-48 focus:select-accent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Toutes catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ DESKTOP — tableau caché sur mobile */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-base-300">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200 text-xs uppercase tracking-wide">
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Seuil</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Aucun produit trouvé</p>
                    {(search || categoryFilter) && (
                      <button
                        className="btn btn-xs btn-ghost mt-2"
                        onClick={() => { setSearch(""); setCategoryFilter(""); }}
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-base-200/50 transition-colors">
                    <td className="max-w-[200px]">
                      <div className="font-semibold text-sm truncate">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-400 truncate">{product.description}</div>
                      )}
                    </td>
                    <td className="max-w-[130px]">
                      {product.category ? (
                        <span className="badge badge-outline badge-sm truncate max-w-[120px] block">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="font-medium text-sm whitespace-nowrap">
                      {product.price.toLocaleString()} FCFA
                    </td>
                    <td>
                      <span className={`badge badge-sm font-bold ${stockColor(product)}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400">min. {product.alertQty}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          className="btn btn-sm btn-ghost btn-circle"
                          onClick={() => openModal(product)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost btn-circle text-error hover:bg-error/10"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ MOBILE — cartes cachées sur desktop */}
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
              <Package className="w-8 h-8 opacity-20" />
              <p className="text-sm">Aucun produit trouvé</p>
              {(search || categoryFilter) && (
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={() => { setSearch(""); setCategoryFilter(""); }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          ) : (
            filtered.map((product) => (
              <div key={product.id} className="bg-base-200 rounded-2xl p-4 space-y-3">
                {/* Nom + actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      className="btn btn-xs btn-ghost btn-circle"
                      onClick={() => openModal(product)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="btn btn-xs btn-ghost btn-circle text-error"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Prix + stock + catégorie */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-accent">
                    {product.price.toLocaleString()} FCFA
                  </span>
                  <span className={`badge badge-sm font-bold ${stockColor(product)}`}>
                    {product.quantity} en stock
                  </span>
                  {product.category && (
                    <span className="badge badge-outline badge-sm truncate max-w-[120px]">
                      {product.category.name}
                    </span>
                  )}
                </div>

                {/* Barre de progression */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Niveau de stock</span>
                    <span>seuil min. {product.alertQty}</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${stockBarColor(product)}`}
                      style={{
                        width: `${Math.min(
                          (product.quantity / Math.max(product.alertQty * 3, 1)) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal */}
      <dialog id="product_modal" className="modal modal-middle">
        <div className="modal-box w-full sm:max-w-lg rounded-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">✕</button>
          </form>
          <div className="mb-5">
            <h3 className="font-bold text-xl">
              {editingId ? "Modifier le produit" : "Nouveau produit"}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {editingId ? "Modifiez les informations" : "Ajoutez un produit à votre inventaire"}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Nom du produit *
              </label>
              <input
                type="text"
                placeholder="Ex: Sac de riz 50kg"
                className="input input-bordered w-full rounded-lg focus:input-accent"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Description
              </label>
              <input
                type="text"
                placeholder="Description optionnelle"
                className="input input-bordered w-full rounded-lg focus:input-accent"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.price}
                  min={0}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Quantité
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full rounded-lg focus:input-accent"
                  value={form.quantity}
                  min={0}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Seuil alerte stock faible
              </label>
              <input
                type="number"
                className="input input-bordered w-full rounded-lg focus:input-accent"
                value={form.alertQty}
                min={0}
                onChange={(e) => setForm({ ...form, alertQty: Number(e.target.value) })}
              />
              <p className="text-xs text-gray-400 mt-1">
                Alerte quand le stock descend en dessous de ce seuil
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Catégorie
              </label>
              <select
                className="select select-bordered w-full rounded-lg focus:select-accent"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">— Sans catégorie —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-accent w-full rounded-lg"
              disabled={!form.name}
              onClick={handleSubmit}
            >
              {editingId ? "Enregistrer les modifications" : "Ajouter le produit"}
            </button>
          </div>
        </div>
      </dialog>
    </Wrapper>
  );
}