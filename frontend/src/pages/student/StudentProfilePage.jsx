
import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentLayout from "../../layouts/StudentLayout";

export default function StudentProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/accounts/profile/");
            setProfile(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const saveProfile = async () => {
        try {
            await api.put("/accounts/profile/", {
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email,
            });

            setSuccessMessage("Profil mis à jour avec succès");
            setErrorMessage("");
        } catch (error) {
            console.error(error);
            setErrorMessage("Erreur lors de la mise à jour");
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const changePassword = async () => {
        if (
            passwordData.new_password !==
            passwordData.confirm_password
        ) {
            setErrorMessage(
                "Les mots de passe ne correspondent pas"
            );
            return;
        }

        try {
            await api.post("/accounts/change-password/", {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });

            setSuccessMessage("Mot de passe modifié avec succès");
            setErrorMessage("");

            setPasswordData({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error.response?.data?.error ||
                "Erreur lors du changement du mot de passe"
            );
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10";

    const readOnlyInputClass =
        "w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none";

    const Label = ({ children, htmlFor }) => (
        <label
            htmlFor={htmlFor}
            className="mb-2 block text-sm font-medium text-slate-700"
        >
            {children}
        </label>
    );

    const SectionIcon = ({ children }) => (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
            {children}
        </div>
    );

    if (loading || !profile) {
        return (
            <StudentLayout>
                <div className="flex min-h-[55vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-emerald-100 border-t-emerald-800" />
                        <p className="text-sm text-slate-500">
                            Chargement du profil...
                        </p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <main className="mx-auto w-full max-w-[1500px] space-y-7 pb-10">
                {/* Feedback messages */}
                {successMessage && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m5 12 4 4L19 6"
                            />
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div
                        role="alert"
                        className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4m0 4h.01M5 19h14a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0L3.3 16a2 2 0 0 0 1.7 3Z"
                            />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Green page header */}
                <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-700 px-6 py-8 text-white shadow-lg shadow-emerald-950/10 sm:px-9 sm:py-10">
                    <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/4 h-52 w-52 rounded-full bg-emerald-400/10 blur-2xl" />
                    <div className="relative flex items-center justify-between gap-5">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                Espace étudiant
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Mon profil
                            </h1>
                        </div>
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-inner backdrop-blur-sm sm:h-16 sm:w-16">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true">
                                <circle cx="12" cy="8" r="3.5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1.5a7 7 0 0 1 14 0V20H5Z" />
                            </svg>
                        </div>
                    </div>
                </header>

                {/* Symmetrical cards */}
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                    {/* Personal information card */}
                    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
                        <div className="flex min-h-[88px] items-center gap-4 border-b border-slate-100 px-6 py-5">
                            <SectionIcon>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="8" r="3.5" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 20v-1.5a7 7 0 0 1 14 0V20H5Z"
                                    />
                                </svg>
                            </SectionIcon>

                            <div>
                                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                                    Informations personnelles
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="first_name">
                                            Prénom
                                        </Label>
                                        <input
                                            id="first_name"
                                            type="text"
                                            name="first_name"
                                            autoComplete="given-name"
                                            value={profile.first_name || ""}
                                            onChange={handleProfileChange}
                                            placeholder="Prénom"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="last_name">
                                            Nom
                                        </Label>
                                        <input
                                            id="last_name"
                                            type="text"
                                            name="last_name"
                                            autoComplete="family-name"
                                            value={profile.last_name || ""}
                                            onChange={handleProfileChange}
                                            placeholder="Nom"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">
                                        Adresse e-mail
                                    </Label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                            >
                                                <rect
                                                    x="3"
                                                    y="5"
                                                    width="18"
                                                    height="14"
                                                    rx="2"
                                                />
                                                <path d="m3 7 9 6 9-6" />
                                            </svg>
                                        </span>

                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            value={profile.email || ""}
                                            onChange={handleProfileChange}
                                            placeholder="votre@email.com"
                                            className={`${inputClass} pl-11`}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <h3 className="mb-4 text-sm font-semibold text-slate-800">
                                        Informations académiques
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="matricule">
                                                Matricule
                                            </Label>
                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    >
                                                        <rect
                                                            x="4"
                                                            y="3"
                                                            width="16"
                                                            height="18"
                                                            rx="2"
                                                        />
                                                        <path d="M8 8h8M8 12h5" />
                                                    </svg>
                                                </span>

                                                <input
                                                    id="matricule"
                                                    type="text"
                                                    value={profile.matricule || ""}
                                                    disabled
                                                    className={`${readOnlyInputClass} pl-11`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="filiere">
                                                Filière
                                            </Label>
                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="m3 8 9-5 9 5-9 5-9-5Z" />
                                                        <path d="M7 10.5v4.2c3 2.2 7 2.2 10 0v-4.2" />
                                                    </svg>
                                                </span>

                                                <input
                                                    id="filiere"
                                                    type="text"
                                                    value={profile.filiere_name || ""}
                                                    disabled
                                                    className={`${readOnlyInputClass} pl-11`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto border-t border-slate-100 pt-6">
                                <button
                                    type="button"
                                    onClick={saveProfile}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/15"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path d="m5 12.5 4.5 4.5L19 7" />
                                    </svg>
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Password security card */}
                    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
                        <div className="flex min-h-[88px] items-center gap-4 border-b border-slate-100 px-6 py-5">
                            <SectionIcon>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="4"
                                        y="10"
                                        width="16"
                                        height="11"
                                        rx="2"
                                    />
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
                                </svg>
                            </SectionIcon>

                            <div>
                                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                                    Sécurité du compte
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                            <div className="space-y-5">
                                <div>
                                    <Label htmlFor="old_password">
                                        Mot de passe actuel
                                    </Label>
                                    <input
                                        id="old_password"
                                        type="password"
                                        name="old_password"
                                        autoComplete="current-password"
                                        value={passwordData.old_password}
                                        onChange={handlePasswordChange}
                                        placeholder="Mot de passe actuel"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="new_password">
                                        Nouveau mot de passe
                                    </Label>
                                    <input
                                        id="new_password"
                                        type="password"
                                        name="new_password"
                                        autoComplete="new-password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        placeholder="Nouveau mot de passe"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="confirm_password">
                                        Confirmer le mot de passe
                                    </Label>
                                    <input
                                        id="confirm_password"
                                        type="password"
                                        name="confirm_password"
                                        autoComplete="new-password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirmez le mot de passe"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-auto border-t border-slate-100 pt-6">
                                <button
                                    type="button"
                                    onClick={changePassword}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/15"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="4"
                                            y="10"
                                            width="16"
                                            height="11"
                                            rx="2"
                                        />
                                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                    </svg>
                                    Changer le mot de passe
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </StudentLayout>
    );
}
