import { useEffect, useState } from "react";

import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminReclamationsPage() {
    const [reclamations, setReclamations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReclamation, setSelectedReclamation] = useState(null);

    useEffect(() => {
        fetchReclamations();
    }, []);

    const fetchReclamations = async () => {
        try {
            const response = await api.get("/notes/reclamations/");
            setReclamations(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const pendingCount = reclamations.filter(r => r.status === 'pending').length;
    const acceptedCount = reclamations.filter(r => r.status === 'accepted').length;
    const rejectedCount = reclamations.filter(r => r.status === 'rejected').length;

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex min-h-[45vh] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-6 py-5 text-sm font-semibold text-[#102c27] shadow-lg shadow-emerald-950/5">
                        <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-emerald-100 border-t-emerald-700" />
                        Chargement des réclamations...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-7 text-slate-800 shadow-sm sm:px-8">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Administration</p>
                        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Réclamations</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Consultez les demandes des étudiants et suivez leur statut.</p>
                    </div>
                    <div className="w-fit rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <p className="text-xs font-medium text-emerald-800">Total des réclamations</p>
                        <p className="mt-1 text-2xl font-extrabold">{reclamations.length}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-400 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-amber-900">En attente</p>
                            <p className="mt-3 text-4xl font-extrabold tracking-tight text-amber-700">{pendingCount}</p>
                            <p className="mt-1 text-xs font-medium text-amber-800/75">À examiner</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-xl font-black text-white shadow-md shadow-amber-500/25">!</div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-emerald-950">Corrigées</p>
                            <p className="mt-3 text-4xl font-extrabold tracking-tight text-emerald-700">{acceptedCount}</p>
                            <p className="mt-1 text-xs font-medium text-emerald-800/75">Demandes acceptées</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white shadow-md shadow-emerald-600/25">✓</div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-rose-950">Confirmées</p>
                            <p className="mt-3 text-4xl font-extrabold tracking-tight text-rose-700">{rejectedCount}</p>
                            <p className="mt-1 text-xs font-medium text-rose-800/75">Demandes rejetées</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-xl font-black text-white shadow-md shadow-rose-600/25">×</div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5">
                <div className="flex flex-col gap-1 border-b border-emerald-900/20 bg-gradient-to-r from-[#102c27] to-[#1d5143] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-base font-bold">Liste des réclamations</h2>
                    <p className="text-xs font-medium text-emerald-100">{reclamations.length} demande(s) enregistrée(s)</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                        <thead className="bg-emerald-50 text-emerald-950">
                            <tr>
                                <th className="whitespace-nowrap border-b border-emerald-100 px-5 py-4 text-xs font-extrabold uppercase tracking-wider">Étudiant</th>
                                <th className="whitespace-nowrap border-b border-emerald-100 px-5 py-4 text-xs font-extrabold uppercase tracking-wider">Matricule</th>
                                <th className="whitespace-nowrap border-b border-emerald-100 px-5 py-4 text-xs font-extrabold uppercase tracking-wider">Matière</th>
                                <th className="whitespace-nowrap border-b border-emerald-100 px-5 py-4 text-xs font-extrabold uppercase tracking-wider">Statut</th>
                                <th className="whitespace-nowrap border-b border-emerald-100 px-5 py-4 text-xs font-extrabold uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reclamations.map((reclamation) => (
                                <tr key={reclamation.id} className="border-b border-slate-100 transition-colors last:border-0 odd:bg-white even:bg-slate-50/70 hover:bg-emerald-50">
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">{reclamation.student_name}</td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-600">{reclamation.matricule}</td>
                                    <td className="px-5 py-4 text-sm text-slate-700">{reclamation.matiere_name}</td>
                                    <td className="px-5 py-4 text-sm">
                                        {reclamation.status === 'pending' && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">
                                                En attente
                                            </span>
                                        )}
                                        {reclamation.status === 'accepted' && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900">
                                                Corrigée
                                            </span>
                                        )}
                                        {reclamation.status === 'rejected' && (
                                            <span className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-900">
                                                Confirmée
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <button
                                            onClick={() => setSelectedReclamation(reclamation)}
                                            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-[#102c27] to-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-emerald-900 hover:to-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                                        >
                                            Voir la réclamation
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reclamations.length === 0 && (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-800">—</div>
                        <p className="font-bold text-slate-800">Aucune réclamation</p>
                        <p className="mt-1 text-sm text-slate-500">Les réclamations apparaîtront ici lorsqu'elles seront soumises.</p>
                    </div>
                )}
            </div>

            {selectedReclamation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/30">
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 text-slate-800 sm:px-8">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Dossier étudiant</p>
                                <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Réclamation</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReclamation(null)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-2xl leading-none text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                aria-label="Fermer"
                            >×</button>
                        </div>

                        <div className="space-y-5 p-6 sm:p-8">
                            <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5">
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-sky-900">
                                    Informations étudiant
                                </h3>
                                <div className="grid gap-3 text-sm sm:grid-cols-2">
                                    <p className="text-slate-600"><strong className="text-slate-900">Étudiant :</strong><br />{selectedReclamation.student_name}</p>
                                    <p className="text-slate-600"><strong className="text-slate-900">Matricule :</strong><br />{selectedReclamation.matricule}</p>
                                    <p className="text-slate-600 sm:col-span-2"><strong className="text-slate-900">Matière :</strong><br />{selectedReclamation.matiere_name}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-5">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-emerald-950">
                                    Notes
                                </h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border border-emerald-100 bg-white p-3">
                                        <p className="text-xs font-semibold text-slate-500">CC</p>
                                        <p className="mt-1 text-xl font-extrabold text-emerald-800">{selectedReclamation.controle_continu}</p>
                                    </div>
                                    <div className="rounded-lg border border-emerald-100 bg-white p-3">
                                        <p className="text-xs font-semibold text-slate-500">CF</p>
                                        <p className="mt-1 text-xl font-extrabold text-emerald-800">{selectedReclamation.controle_final}</p>
                                    </div>
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-100/70 p-3">
                                        <p className="text-xs font-bold text-emerald-900">Note finale</p>
                                        <p className="mt-1 text-xl font-extrabold text-emerald-950">{selectedReclamation.note_finale}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 flex items-center gap-2 font-extrabold text-[#102c27]">Message étudiant</p>
                                <div className="whitespace-pre-wrap rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-7 text-slate-700">{selectedReclamation.message}</div>
                            </div>

                            <div>
                                <p className="mb-2 flex items-center gap-2 font-extrabold text-[#102c27]">Réponse enseignant</p>
                                <div className="whitespace-pre-wrap rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-7 text-slate-700">{selectedReclamation.teacher_response || "Aucune réponse"}</div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm font-semibold text-slate-700">
                                    Statut : {selectedReclamation.status === 'pending' ? (
                                        <span className="ml-1 inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">En attente</span>
                                    ) : selectedReclamation.status === 'accepted' ? (
                                        <span className="ml-1 inline-flex rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">Corrigée</span>
                                    ) : selectedReclamation.status === 'rejected' ? (
                                        <span className="ml-1 inline-flex rounded-full border border-rose-300 bg-rose-100 px-3 py-1 text-xs font-bold text-rose-900">Confirmée</span>
                                    ) : selectedReclamation.status}
                                </div>
                                <button
                                    onClick={() => setSelectedReclamation(null)}
                                    className="rounded-lg bg-[#102c27] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
