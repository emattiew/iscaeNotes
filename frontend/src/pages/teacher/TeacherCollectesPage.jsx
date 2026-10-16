
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherCollectesPage() {
    const navigate = useNavigate();

    const [collectes, setCollectes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchCollectes();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchCollectes = async () => {
        try {
            const response = await api.get("/notes/collectes/");
            setCollectes(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const validateCollecte = async (id) => {
        try {
            await api.post(`/notes/collectes/${id}/validate/`);

            setSuccessMessage("Collecte validée avec succès");
            setErrorMessage("");

            fetchCollectes();
        } catch (error) {
            console.error(error);

            setErrorMessage("Erreur lors de la validation");
            setSuccessMessage("");
        }
    };

    const statusStyles = {
        prepared: "bg-amber-50 text-amber-700 ring-amber-600/20",
        validated: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        published: "bg-blue-50 text-blue-700 ring-blue-600/20",
    };

    const statusLabels = {
        prepared: "Préparée",
        validated: "Validée",
        published: "Publiée",
    };

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                    <p className="text-sm font-medium text-slate-500">
                        Chargement des collectes...
                    </p>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="space-y-6 pb-8 text-slate-800">

                {/* En-tête */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="h-1.5 w-7 rounded-full bg-emerald-500" />
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                                Espace enseignant
                            </p>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Mes collectes
                        </h1>

                      
                    </div>

                    <div className="flex w-fit items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-6 w-6"
                                aria-hidden="true"
                            >
                                <path d="m12 3 9 5-9 5-9-5 9-5Z" strokeLinejoin="round" />
                                <path d="m3 12 9 5 9-5M3 16l9 5 9-5" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <div>
                            <p className="text-2xl font-bold leading-7 text-[#102c27]">
                                {collectes.length}
                            </p>
                            <p className="text-sm text-slate-500">
                                Collecte(s)
                            </p>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                {successMessage && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                        >
                            <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div
                        role="alert"
                        className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v5m0 3h.01" strokeLinecap="round" />
                        </svg>
                        {errorMessage}
                    </div>
                )}

                {/* Tableau des collectes */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {collectes.length === 0 ? (
                        <div className="flex flex-col items-center px-6 py-14 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-8 w-8"
                                    aria-hidden="true"
                                >
                                    <rect x="4" y="3" width="16" height="18" rx="2" />
                                    <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-base font-semibold text-slate-800">
                                Aucune collecte disponible
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Vos collectes apparaîtront ici.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 sm:px-6">
                                            Matière
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                            Filière
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                            Année
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                                            Statut
                                        </th>
                                        <th className="px-5 py-4 text-right text-sm font-semibold text-slate-600 sm:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {collectes.map((collecte) => (
                                        <tr
                                            key={collecte.id}
                                            className="transition-colors duration-150 hover:bg-emerald-50/40"
                                        >
                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.7"
                                                            className="h-5 w-5"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" strokeLinejoin="round" />
                                                            <path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7M8 10h7" strokeLinecap="round" />
                                                        </svg>
                                                    </div>

                                                    <span className="text-base font-semibold text-slate-800">
                                                        {collecte.matiere_name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-base text-slate-600">
                                                {collecte.filiere_name}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-base text-slate-600">
                                                {collecte.academic_year}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${
                                                        statusStyles[collecte.status] ||
                                                        "bg-slate-100 text-slate-600 ring-slate-200"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${
                                                            collecte.status === "prepared"
                                                                ? "bg-amber-500"
                                                                : collecte.status === "validated"
                                                                ? "bg-emerald-500"
                                                                : collecte.status === "published"
                                                                ? "bg-blue-500"
                                                                : "bg-slate-400"
                                                        }`}
                                                    />
                                                    {statusLabels[collecte.status] || collecte.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/teacher/collectes/${collecte.id}/notes`
                                                            )
                                                        }
                                                        className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#102c27] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b5143] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                    >
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            className="h-4 w-4"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M12 20h9" strokeLinecap="round" />
                                                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Gérer les notes
                                                    </button>

                                                    {collecte.status === "prepared" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                validateCollecte(collecte.id)
                                                            }
                                                            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                        >
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                className="h-4 w-4"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            Valider
                                                        </button>
                                                    )}

                                                    {collecte.status === "published" &&
                                                        collecte.rattrapage_status === "opened" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/teacher/collectes/${collecte.id}/rattrapage`
                                                                    )
                                                                }
                                                                className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-teal-600 bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:border-teal-700 hover:bg-teal-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                                            >
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                >
                                                                    <circle cx="12" cy="12" r="9" />
                                                                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                Rattrapage
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </TeacherLayout>
    );
}
