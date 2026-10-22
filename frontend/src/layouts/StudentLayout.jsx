import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo-iscae.png";

export default function StudentLayout({ children }) {
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
            label: "Résultats",
            path: "/student/results",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <path d="M7 3h8l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                    <path d="M15 3v5h5M9 13h7M9 17h5" />
                </svg>
            ),
        },
        {
            label: "Mon profil",
            path: "/student/profile",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20v-1.5a7 7 0 0 1 14 0V20H5Z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <button
                        type="button"
                        onClick={() => navigate("/student/dashboard")}
                        className="group flex min-w-0 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/15 sm:gap-4"
                        aria-label="Retour au tableau de bord étudiant"
                    >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white p-1 shadow-sm transition group-hover:border-emerald-200 group-hover:shadow-md sm:h-14 sm:w-14">
                            <img
                                src={logo}
                                alt="ISCAE"
                                className="h-full w-full object-contain"
                            />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-lg font-bold tracking-tight text-gray-900 transition group-hover:text-emerald-800 sm:text-xl">
                                Espace Étudiant
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-500 sm:text-sm">
                                Consultation des résultats académiques
                            </span>
                        </span>
                    </button>

                    <nav aria-label="Navigation étudiant" className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {navItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    type="button"
                                    onClick={() => navigate(item.path)}
                                    aria-current={active ? "page" : undefined}
                                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/15 ${
                                        active
                                            ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            );
                        })}

                        <span className="hidden h-7 w-px bg-gray-200 lg:block" aria-hidden="true" />

                        <button
                            type="button"
                            onClick={logout}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-900 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-gray-700 hover:bg-gray-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-500/20"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                                <path d="M10 17l5-5-5-5M15 12H3" />
                                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                            </svg>
                            Déconnexion
                        </button>
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                {children}
            </main>
        </div>
    );
}
