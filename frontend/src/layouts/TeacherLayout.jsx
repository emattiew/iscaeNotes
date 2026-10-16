
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo-iscae.png";

export default function TeacherLayout({ children }) {
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
            path: "/teacher/dashboard",
            icon: "dashboard",
        },
        {
            label: "Mes collectes",
            path: "/teacher/collectes",
            icon: "collectes",
        },
        {
            label: "Réclamations",
            path: "/teacher/reclamations",
            icon: "reclamations",
        },
        {
            label: "Correction IA",
            path: "/teacher/ai-correction",
            icon: "ai",
        },
    ];

    const isActive = (path) => {
        if (path === "/teacher/dashboard") {
            return location.pathname === path;
        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(`${path}/`)
        );
    };

    const renderIcon = (icon) => {
        const props = {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.7,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className: "h-5 w-5 shrink-0",
            "aria-hidden": true,
        };

        switch (icon) {
            case "dashboard":
                return (
                    <svg {...props}>
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="5" rx="1.5" />
                        <rect x="14" y="12" width="7" height="9" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
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

            case "reclamations":
                return (
                    <svg {...props}>
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                        <path d="M12 8v4M12 16h.01" />
                    </svg>
                );

            case "ai":
                return (
                    <svg {...props}>
                        <path d="M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
                        <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
                        <path d="m5 2 .9 2.1L8 5l-.9 2.1L2 5l2.1-.9L5 2Z" />
                    </svg>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f5f7] text-slate-800">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#102c27] text-white">

                {/* Logo */}
                <div className="px-5 pt-7">
                    <Link
                        to="/teacher/dashboard"
                        className="flex flex-col items-center rounded-xl px-3 py-3 transition hover:bg-white/[0.04]"
                    >
                        <div className="flex h-[78px] w-[78px] items-center justify-center rounded-2xl bg-white p-2.5">
                            <img
                                src={logo}
                                alt="Logo ISCAE"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <p className="mt-3 text-base font-semibold tracking-wide">
                            ISCAE
                        </p>

                        <p className="mt-1 text-xs text-emerald-200/80">
                            Espace enseignant
                        </p>
                    </Link>
                </div>

                <div className="mx-5 mt-5 border-t border-white/10" />

                {/* Navigation */}
                <nav
                    aria-label="Navigation enseignant"
                    className="flex-1 space-y-1 px-4 py-6"
                >
                    {navItems.map((item) => {
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                aria-current={active ? "page" : undefined}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                                    active
                                        ? "bg-emerald-400/15 font-semibold text-white"
                                        : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                                }`}
                            >
                                <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                        active
                                            ? "bg-emerald-300/15 text-emerald-200"
                                            : "text-slate-400 group-hover:text-emerald-200"
                                    }`}
                                >
                                    {renderIcon(item.icon)}
                                </span>

                                <span className="flex-1">
                                    {item.label}
                                </span>

                                {active && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4">
                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path
                                d="M10 17l5-5-5-5M15 12H3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
                                strokeLinecap="round"
                            />
                        </svg>
                        Déconnexion
                    </button>

                    <p className="mt-4 text-center text-[10px] text-slate-500">
                        ISCAE · Espace universitaire
                    </p>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 min-h-screen min-w-0">
                <div className="min-h-screen px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
                    <div className="mx-auto w-full max-w-[1600px]">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
