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
import { Package, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (email) fetchData();
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

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Inventaire</h1>
            <p className="text-sm text-gray-500">
              Gérez vos produits et votre stock
            </p>
          </div>
          <button className="btn btn-accent" onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-1" /> Nouveau produit
          </button>
        </div>

        {/* Alertes stock faible */}
        {products.filter((p) => p.quantity <= p.alertQty).length > 0 && (
          <div className="alert alert-warning">
            <AlertTriangle className="w-5 h-5" />
            <span>
              {products.filter((p) => p.quantity <= p.alertQty).length}{" "}
              produit(s) avec stock faible !
            </span>
          </div>
        )}

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher un produit..."
          className="input input-bordered w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Tableau */}
        <div className="overflow-x-auto rounded-xl border border-base-300">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2" />
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-400">
                        {product.description}
                      </div>
                    </td>
                    <td>
                      {product.category ? (
                        <span className="badge badge-outline">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td>{product.price.toLocaleString()} FCFA</td>
                    <td>
                      <span
                        className={`badge ${
                          product.quantity <= product.alertQty
                            ? "badge-error"
                            : "badge-success"
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openModal(product)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Produit */}
      <dialog id="product_modal" className="modal modal-middle">
        <div className="modal-box w-full sm:max-w-lg">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">
            {editingId ? "Modifier le produit" : "Nouveau produit"}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nom du produit"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              className="input input-bordered w-full"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Quantité en stock
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Seuil alerte stock faible
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.alertQty}
                onChange={(e) =>
                  setForm({ ...form, alertQty: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Catégorie
              </label>
              <select
                className="select select-bordered w-full"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">— Sans catégorie —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-accent w-full"
              disabled={!form.name}
              onClick={handleSubmit}
            >
              {editingId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </dialog>
    </Wrapper>
  );
}