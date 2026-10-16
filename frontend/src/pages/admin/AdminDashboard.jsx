
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        collectes: 0,
        publishedCollectes: 0,
        pendingReclamations: 0,
    });

    const [collectes, setCollectes] = useState([]);
    const [reclamations, setReclamations] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [
                usersResponse,
                collectesResponse,
                reclamationsResponse,
            ] = await Promise.all([
                api.get("/accounts/users/"),
                api.get("/notes/collectes/"),
                api.get("/notes/reclamations/"),
            ]);

            const collectesData = collectesResponse.data;
            const reclamationsData = reclamationsResponse.data;

            setCollectes(collectesData);
            setReclamations(reclamationsData);

            setStats({
                users: usersResponse.data.length,
                collectes: collectesData.length,
                publishedCollectes: collectesData.filter(
                    (c) => c.status === "published"
                ).length,
                pendingReclamations: reclamationsData.filter(
                    (r) => r.status === "pending"
                ).length,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const statCards = [
        {
            title: "Utilisateurs",
            value: stats.users,
            color: "violet",
            icon: "users",
        },
        {
            title: "Collectes",
            value: stats.collectes,
            color: "amber",
            icon: "collectes",
        },
        {
            title: "Collectes publiées",
            value: stats.publishedCollectes,
            color: "emerald",
            icon: "published",
        },
        {
            title: "Réclamations en attente",
            value: stats.pendingReclamations,
            color: "rose",
            icon: "reclamations",
        },
    ];

    const colorStyles = {
        violet: {
            accent: "bg-violet-500",
            icon: "bg-violet-50 text-violet-700",
            number: "text-slate-900",
        },
        amber: {
            accent: "bg-amber-500",
            icon: "bg-amber-50 text-amber-700",
            number: "text-slate-900",
        },
        emerald: {
            accent: "bg-emerald-600",
            icon: "bg-emerald-50 text-emerald-700",
            number: "text-slate-900",
        },
        rose: {
            accent: "bg-rose-500",
            icon: "bg-rose-50 text-rose-700",
            number: "text-slate-900",
        },
    };

    const renderIcon = (name, className = "h-5 w-5") => {
        const props = {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.7,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className,
            "aria-hidden": true,
        };

        switch (name) {
            case "users":
                return (
                    <svg {...props}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="10" cy="7" r="4" />
                        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                );

            case "collectes":
                return (
                    <svg {...props}>
                        <path d="M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="2" width="6" height="4" rx="1.5" />
                        <path d="M8 11h8M8 15h8M8 19h4" />
                    </svg>
                );

            case "published":
                return (
                    <svg {...props}>
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 2.5 2.5L16 9" />
                    </svg>
                );

            case "reclamations":
                return (
                    <svg {...props}>
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                        <path d="M12 8v4M12 16h.01" />
                    </svg>
                );

            default:
                return null;
        }
    };

    const quickActions = [
        {
            label: "Utilisateurs",
            path: "/admin/users",
            icon: "users",
            color: "violet",
        },
        {
            label: "Collectes",
            path: "/admin/collectes",
            icon: "collectes",
            color: "emerald",
        },
        {
            label: "Réclamations",
            path: "/admin/reclamations",
            icon: "reclamations",
            color: "rose",
        },
        {
            label: "Périodes",
            path: "/admin/reclamation-periods",
            icon: "periods",
            color: "amber",
        },
    ];

    const actionStyles = {
        violet: "bg-violet-50 text-violet-700 group-hover:bg-violet-100",
        emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100",
        rose: "bg-rose-50 text-rose-700 group-hover:bg-rose-100",
        amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
    };

    const renderActionIcon = (name) => {
        if (name === "periods") {
            return (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
            );
        }

        return renderIcon(name);
    };

    const statusLabels = {
        prepared: "Préparée",
        validated: "Validée",
        published: "Publiée",
        pending: "En attente",
    };

    const statusStyles = {
        prepared: "bg-amber-50 text-amber-700",
        validated: "bg-sky-50 text-sky-700",
        published: "bg-emerald-50 text-emerald-700",
        pending: "bg-rose-50 text-rose-700",
    };

    return (
        <AdminLayout>
            <div className="space-y-6 pb-6 text-slate-800">

                {/* En-tête */}
                <header>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-6 rounded-full bg-emerald-600" />
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            Administration
                        </p>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Tableau de bord
                    </h1>

                    
                </header>

                {/* Statistiques */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((stat) => {
                        const styles = colorStyles[stat.color];

                        return (
                            <div
                                key={stat.title}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                            >
                                <div
                                    className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`}
                                />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium leading-5 text-slate-500">
                                            {stat.title}
                                        </p>

                                        <p className={`mt-3 text-3xl font-bold tracking-tight tabular-nums ${styles.number}`}>
                                            {stat.value}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${styles.icon}`}
                                    >
                                        {renderIcon(stat.icon, "h-5 w-5")}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Accès rapides */}
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">
                            Accès rapides
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.path}
                                to={action.path}
                                className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 p-3 transition-all duration-200 hover:border-emerald-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${actionStyles[action.color]}`}
                                >
                                    {renderActionIcon(action.icon)}
                                </div>

                                <span className="min-w-0 text-sm font-semibold text-slate-700 transition-colors group-hover:text-emerald-800">
                                    {action.label}
                                </span>

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M5 12h14m-6-6 6 6-6 6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Activité récente */}
                <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                    {/* Dernières collectes */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                            <h2 className="font-bold text-slate-900">
                                Dernières collectes
                            </h2>

                            <Link
                                to="/admin/collectes"
                                className="shrink-0 rounded-lg px-2 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            >
                                Tout voir <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        {collectes.length === 0 ? (
                            <p className="px-5 py-9 text-center text-sm text-slate-400">
                                Aucune collecte disponible
                            </p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {collectes.slice(0, 5).map((collecte) => (
                                    <div
                                        key={collecte.id}
                                        className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                {renderIcon("collectes", "h-4 w-4")}
                                            </div>

                                            <p className="truncate text-sm font-medium text-slate-800">
                                                {collecte.matiere_name}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[collecte.status] || "bg-slate-100 text-slate-600"}`}
                                        >
                                            {statusLabels[collecte.status] || collecte.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Réclamations récentes */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                            <h2 className="font-bold text-slate-900">
                                Réclamations récentes
                            </h2>

                            <Link
                                to="/admin/reclamations"
                                className="shrink-0 rounded-lg px-2 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            >
                                Tout voir <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        {reclamations.length === 0 ? (
                            <p className="px-5 py-9 text-center text-sm text-slate-400">
                                Aucune réclamation disponible
                            </p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {reclamations.slice(0, 5).map((reclamation) => (
                                    <div
                                        key={reclamation.id}
                                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                                            {renderIcon("reclamations", "h-4 w-4")}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-800">
                                                {reclamation.student_name}
                                            </p>

                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                {reclamation.matiere_name}
                                            </p>
                                        </div>

                                        {reclamation.status === "pending" && (
                                            <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                                                En attente
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
