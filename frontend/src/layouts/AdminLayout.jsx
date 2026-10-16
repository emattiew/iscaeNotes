
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo-iscae.png";

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        navigate("/");
    };

    const navItems = [
        {
            label: "Tableau de bord",
            path: "/admin/dashboard",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
            ),
        },
        {
            label: "Collectes",
            path: "/admin/collectes",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M8 3h8l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3Z" />
                    <path d="M15 3v5h5M8 13h8M8 17h8" />
                </svg>
            ),
        },
        {
            label: "Résultats semestriels",
            path: "/admin/documents",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                    <path d="M8 7h8M8 11h8" />
                </svg>
            ),
        },
        {
            label: "Résultats annuels",
            path: "/admin/annual-results",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M3 3v18h18" />
                    <path d="m7 14 4-4 3 3 6-7" />
                </svg>
            ),
        },
        {
            label: "Utilisateurs",
            path: "/admin/users",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            label: "Filières",
            path: "/admin/filieres",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" />
                    <path d="m5 10.5 7 3.7 7-3.7M5 14.5l7 3.7 7-3.7" />
                </svg>
            ),
        },
        {
            label: "Modules",
            path: "/admin/modules",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" />
                    <rect x="13" y="3" width="8" height="8" rx="1.5" />
                    <rect x="3" y="13" width="8" height="8" rx="1.5" />
                    <rect x="13" y="13" width="8" height="8" rx="1.5" />
                </svg>
            ),
        },
        {
            label: "Matières",
            path: "/admin/matieres",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>
            ),
        },
        {
            label: "Périodes de réclamation",
            path: "/admin/reclamation-periods",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            ),
        },
        {
            label: "Réclamations",
            path: "/admin/reclamations",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                </svg>
            ),
        },
    ];

    const isActive = (path) => {
        if (path === "/admin/dashboard") {
            return location.pathname === path;
        }

        return location.pathname === path ||
            location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="min-h-screen bg-[#f5f7f5]">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#123b2c] text-white shadow-xl">

                {/* Brand */}
                <div className="border-b border-white/10 px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
                            <img
                                src={logo}
                                alt="ISCAE"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-lg font-bold tracking-wide">
                                ISCAE
                            </h1>
                            <p className="mt-0.5 text-xs text-emerald-100/70">
                                Espace administration
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/50">
                        Navigation
                    </p>

                    {navItems.map((item) => {
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                                    active
                                        ? "bg-white text-[#123b2c] shadow-sm"
                                        : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <span
                                    className={`shrink-0 transition-colors ${
                                        active
                                            ? "text-[#176344]"
                                            : "text-emerald-100/65 group-hover:text-white"
                                    }`}
                                >
                                    {item.icon}
                                </span>

                                <span className="leading-5">
                                    {item.label}
                                </span>

                                {active && (
                                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#176344]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-3">
                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-100">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-5 w-5"
                            >
                                <path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-white">
                                Administration
                            </p>
                            <p className="mt-0.5 text-xs text-emerald-100/60">
                                Gestion universitaire
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-100/90 transition-colors hover:bg-rose-500/15 hover:text-white"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-5 w-5"
                        >
                            <path d="M10 17l5-5-5-5M15 12H3" />
                            <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                        </svg>
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 min-h-screen p-6 md:p-8">
                <div className="mx-auto w-full max-w-[1600px]">
                    {children}
                </div>
            </main>
        </div>
    );
}
