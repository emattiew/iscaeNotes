
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherDashboard() {
    const navigate = useNavigate();

    const [collectes, setCollectes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollectes();
    }, []);

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

    const preparedCount = collectes.filter(
        (c) => c.status === "prepared"
    ).length;

    const validatedCount = collectes.filter(
        (c) => c.status === "validated"
    ).length;

    const publishedCount = collectes.filter(
        (c) => c.status === "published"
    ).length;

    const stats = [
        {
            title: "Mes collectes",
            value: collectes.length,
            color: "emerald",
            icon: "layers",
        },
        {
            title: "À préparer",
            value: preparedCount,
            color: "amber",
            icon: "clock",
        },
        {
            title: "Validées",
            value: validatedCount,
            color: "sky",
            icon: "check",
        },
        {
            title: "Publiées",
            value: publishedCount,
            color: "emerald",
            icon: "send",
        },
    ];

    const statusStyles = {
        prepared: {
            label: "Préparée",
            badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
            dot: "bg-amber-500",
        },
        validated: {
            label: "Validée",
            badge: "bg-sky-50 text-sky-700 ring-sky-600/20",
            dot: "bg-sky-500",
        },
        published: {
            label: "Publiée",
            badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
            dot: "bg-emerald-500",
        },
    };

    const colorStyles = {
        emerald: {
            icon: "bg-emerald-100 text-emerald-700",
            number: "text-emerald-950",
            accent: "bg-emerald-500",
        },
        amber: {
            icon: "bg-amber-100 text-amber-700",
            number: "text-amber-950",
            accent: "bg-amber-500",
        },
        sky: {
            icon: "bg-sky-100 text-sky-700",
            number: "text-sky-950",
            accent: "bg-sky-500",
        },
    };

    if (loading) {
        return (
            <TeacherLayout>
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                    <p className="text-sm text-slate-500">
                        Chargement...
                    </p>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="min-h-full space-y-6 pb-8 text-slate-800">

                {/* En-tête */}
                <header>
                    
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-6 rounded-full bg-emerald-600" />
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            Espace enseignant
                        </p>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Tableau de bord
                    </h1>
                </header>

                {/* Statistiques */}
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-800">
                            Vue d'ensemble
                        </h2>
                        <span className="text-xs text-slate-400">
                            {collectes.length} collecte(s)
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                        {stats.map((stat) => {
                            const styles = colorStyles[stat.color];

                            return (
                                <div
                                    key={stat.title}
                                    className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                                >
                                    <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />

                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-slate-500">
                                            {stat.title}
                                        </p>

                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
                                            {stat.icon === "layers" && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                                    <path d="m12 3 9 5-9 5-9-5 9-5Z" strokeLinejoin="round" />
                                                    <path d="m3 12 9 5 9-5M3 16l9 5 9-5" strokeLinejoin="round" />
                                                </svg>
                                            )}

                                            {stat.icon === "clock" && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                                    <circle cx="12" cy="12" r="9" />
                                                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}

                                            {stat.icon === "check" && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                                    <circle cx="12" cy="12" r="9" />
                                                    <path d="m8 12 2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}

                                            {stat.icon === "send" && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                                    <path d="m22 2-7 20-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M22 2 11 13" strokeLinecap="round" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    <p className={`mt-3 text-3xl font-bold tracking-tight ${styles.number}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Accès rapides */}
                <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                    <h2 className="mb-3 text-sm font-bold text-slate-800">
                        Accès rapides
                    </h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => navigate("/teacher/collectes")}
                            className="group flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <rect x="4" y="4" width="16" height="16" rx="2" />
                                    <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
                                </svg>
                            </div>

                            <span className="flex-1 text-sm font-semibold text-emerald-950">
                                Mes collectes
                            </span>

                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-emerald-600 transition group-hover:translate-x-1" aria-hidden="true">
                                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/teacher/reclamations")}
                            className="group flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <span className="flex-1 text-sm font-semibold text-emerald-950">
                                Réclamations
                            </span>

                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-emerald-600 transition group-hover:translate-x-1" aria-hidden="true">
                                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </section>

                {/* Dernières collectes */}
                <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                        <h2 className="text-sm font-bold text-slate-800">
                            Dernières collectes
                        </h2>

                        {collectes.length > 0 && (
                            <button
                                type="button"
                                onClick={() => navigate("/teacher/collectes")}
                                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            >
                                Tout voir
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                                    <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {collectes.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
                                    <rect x="4" y="3" width="16" height="18" rx="2" />
                                    <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
                                </svg>
                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                Aucune collecte disponible
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {collectes.slice(0, 5).map((collecte) => {
                                const status = statusStyles[collecte.status];

                                return (
                                    <div
                                        key={collecte.id}
                                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/80 sm:px-5"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
                                                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" strokeLinejoin="round" />
                                                <path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7M8 10h7" strokeLinecap="round" />
                                            </svg>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {collecte.matiere_name}
                                            </p>
                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                {collecte.filiere_name}
                                            </p>
                                        </div>

                                        {status ? (
                                            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.badge}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </span>
                                        ) : (
                                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                {collecte.status}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </TeacherLayout>
    );
}
