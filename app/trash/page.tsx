// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Wrapper from "../components/Wrapper";
import { getTrashedInvoices, restoreInvoice, permanentDeleteInvoice } from "../actions";
import { RotateCcw, Trash2, Inbox } from "lucide-react";
import { Invoice } from "@/type";

export default function TrashPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrash = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const data = await getTrashedInvoices(email);
      setInvoices(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrash();
  }, [email]);

  const handleRestore = async (id: string) => {
    if (!confirm("Restaurer cette facture ?")) return;
    await restoreInvoice(id);
    fetchTrash();
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cette facture ?")) return;
    await permanentDeleteInvoice(id);
    fetchTrash();
  };

  return (
    <Wrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Corbeille</h1>
          <p className="text-sm text-gray-500">
            Les factures supprimées restent ici jusqu’à ce qu’elles soient effacées automatiquement après 30 jours.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-accent"></span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 p-10 text-center text-gray-500">
            <Inbox className="mx-auto mb-3 h-8 w-8" />
            <p>Aucune facture dans la corbeille.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-base-300">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Client</th>
                  <th>Supprimée le</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.name}</td>
                    <td>{invoice.clientName || "—"}</td>
                    <td>{invoice.deletedAt ? new Date(invoice.deletedAt).toLocaleDateString() : "—"}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-sm btn-outline btn-success"
                          onClick={() => handleRestore(invoice.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restaurer
                        </button>
                        <button
                          className="btn btn-sm btn-outline btn-error"
                          onClick={() => handlePermanentDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer définitivement
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
