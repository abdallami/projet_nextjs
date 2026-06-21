 // @ts-nocheck
"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../actions";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string;
  products: { id: string }[];
};

export default function CategoriesPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!email) return;
    const data = await getCategories(email);
    setCategories(data as Category[]);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (email) fetchCategories();
  }, [email]);

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setForm({ name: cat.name, description: cat.description });
    } else {
      setEditingId(null);
      setForm({ name: "", description: "" });
    }
    (document.getElementById("category_modal") as HTMLDialogElement).showModal();
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateCategory(editingId, form.name, form.description);
    } else {
      await createCategory(email, form.name, form.description);
    }
    await fetchCategories();
    (document.getElementById("category_modal") as HTMLDialogElement).close();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await deleteCategory(id);
    await fetchCategories();
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Catégories</h1>
            <p className="text-sm text-gray-500">
              Organisez vos produits par catégorie
            </p>
          </div>
          <button className="btn btn-accent" onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-1" /> Nouvelle catégorie
          </button>
        </div>

        {/* Grille des catégories */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Tag className="w-10 h-10 mx-auto mb-3" />
              <p>Aucune catégorie créée</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="border border-base-300 rounded-xl p-5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">{cat.name}</h2>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => openModal(cat)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-error"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {cat.description && (
                  <p className="text-sm text-gray-500">{cat.description}</p>
                )}
                <span className="badge badge-outline mt-1">
                  {cat.products.length} produit(s)
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <dialog id="category_modal" className="modal modal-middle">
        <div className="modal-box w-full sm:max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">
            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nom de la catégorie"
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