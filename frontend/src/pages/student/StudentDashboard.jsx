
import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentLayout from "../../layouts/StudentLayout";

export default function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);
    const [reclamationPeriodOpen, setReclamationPeriodOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [showReclamationModal, setShowReclamationModal] = useState(false);
    const [reclamationMessage, setReclamationMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchProfile();
        fetchResults();
        fetchReclamationPeriodStatus();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/accounts/profile/");
            setUser(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchResults = async () => {
        try {
            const response = await api.get("/notes/student-notes/");
            setNotes(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openReclamationModal = (note) => {
        setSelectedNote(note);
        setShowReclamationModal(true);
    };

    const fetchReclamationPeriodStatus = async () => {
        try {
            const response = await api.get(
                "/notes/reclamation-period-status/"
            );

            setReclamationPeriodOpen(
                response.data?.is_open === true
            );
        } catch (error) {
            console.error(
                "Reclamation status error:",
                error.response?.status,
                error.response?.data || error.message
            );

            setReclamationPeriodOpen(false);
        }
    };

    const createReclamation = async () => {
        try {
            await api.post("/notes/reclamations/", {
                student_note: selectedNote.id,
                message: reclamationMessage,
            });

            setSuccessMessage("Réclamation envoyée avec succès");
            setErrorMessage("");
            setShowReclamationModal(false);
            setReclamationMessage("");
            setSelectedNote(null);
        } catch (error) {
            console.error(error);
            setErrorMessage("Erreur lors de l'envoi");
            setSuccessMessage("");
        }
    };


    // Read the level from fields that may already exist in the API response.
    // No backend or API changes are made here.
    const currentLevel =
        user?.niveau ??
        user?.level ??
        user?.niveau_etude ??
        user?.annee_etude ??
        user?.study_level ??
        "";

    const normalizeLevel = (level) =>
        String(level ?? "").trim().toUpperCase().replace(/\s+/g, "");

    const levelNumber = (level) => {
        const normalized = normalizeLevel(level);
        const match = normalized.match(/L\s*(\d+)/) || normalized.match(/(\d+)/);
        return match ? Number(match[1]) : null;
    };

    // Semester mapping used by the academic structure: S1/S2 = L1,
    // S3/S4 = L2, and S5/S6 = L3. The serializer already exposes `semester`.
    const levelFromSemester = (semester) => {
        const semesterNumber = Number(semester);
        if (!Number.isFinite(semesterNumber) || semesterNumber < 1 || semesterNumber > 6) {
            return "";
        }
        return `L${Math.ceil(semesterNumber / 2)}`;
    };

    const getSubjectLevel = (note) => {
        const explicitLevel =
            note.module_level ??
            note.niveau_module ??
            note.module_niveau ??
            note.matiere_level ??
            note.niveau_matiere ??
            note.level ??
            note.niveau ??
            "";

        return explicitLevel || levelFromSemester(note.semester);
    };

    // Prefer the student's explicit level from the profile. If it is absent,
    // infer the current level from the highest semester in published results.
    // Semester mapping: S1/S2 = L1, S3/S4 = L2, S5/S6 = L3.
    const semesterLevelNumbers = notes
        .map((note) => levelNumber(getSubjectLevel(note)))
        .filter((level) => level !== null);

    const currentLevelNumber =
        levelNumber(currentLevel) ??
        (semesterLevelNumbers.length > 0
            ? Math.max(...semesterLevelNumbers)
            : null);

    const currentLevelNotes = notes.filter((note) => {
        const subjectLevelNumber = levelNumber(getSubjectLevel(note));
        return currentLevelNumber !== null && subjectLevelNumber === currentLevelNumber;
    });

    // Every subject from a level below the student's current level belongs
    // in the previous-level section, regardless of grade or validation status.
    const debtNotes = notes.filter((note) => {
        const subjectLevelNumber = levelNumber(getSubjectLevel(note));
        return currentLevelNumber !== null &&
            subjectLevelNumber !== null &&
            subjectLevelNumber < currentLevelNumber;
    });

    // If the existing response does not expose level information, keep the
    // results visible instead of hiding them; the UI shows a notice below.
    const classifiedNoteIds = new Set([
        ...currentLevelNotes.map((note) => note.id),
        ...debtNotes.map((note) => note.id),
    ]);
    const unclassifiedNotes = notes.filter((note) => !classifiedNoteIds.has(note.id));

    const renderNoteCard = (note, isDebt = false) => (
        <article
            key={note.id}
            className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isDebt
                    ? "border-amber-200 hover:border-amber-300 hover:shadow-amber-950/[0.06]"
                    : "border-slate-200/90 hover:border-emerald-200 hover:shadow-emerald-950/[0.06]"
            }`}
        >
            <div className="flex items-start justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex min-w-0 items-start gap-3.5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition ${
                        isDebt
                            ? "border-amber-200 bg-amber-50 text-amber-800 group-hover:bg-amber-100"
                            : "border-emerald-100 bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100"
                    }`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v16H7.5A2.5 2.5 0 0 0 5 20.5v-16Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 20.5A2.5 2.5 0 0 1 7.5 18H20M9 6h7M9 10h7" />
                        </svg>
                    </div>
                    <div className="min-w-0 pt-0.5">
                        <h3 className="break-words text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                            {note.matiere_name}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0" aria-hidden="true">
                                <circle cx="12" cy="8" r="3.5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-1.5a7 7 0 0 1 14 0V20H5Z" />
                            </svg>
                            <span className="break-words">{note.teacher_name}</span>
                        </p>
                    </div>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${
                    isDebt
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-emerald-100 bg-emerald-50 text-emerald-800"
                }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isDebt ? "bg-amber-500" : "bg-emerald-600"}`} />
                    {isDebt ? "À valider" : "Publié"}
                </span>
            </div>

            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-slate-100 bg-slate-50/80 px-2 py-4 text-center sm:px-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-xs">CC</p>
                        <p className="mt-2 break-words text-xl font-bold tabular-nums text-slate-800 sm:text-2xl">{note.controle_continu}</p>
                        <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">Continu</p>
                    </div>
                    <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-slate-100 bg-slate-50/80 px-2 py-4 text-center sm:px-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-xs">CF</p>
                        <p className="mt-2 break-words text-xl font-bold tabular-nums text-slate-800 sm:text-2xl">{note.controle_final}</p>
                        <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">Final</p>
                    </div>
                    <div className={`relative flex min-w-0 flex-col justify-center overflow-hidden rounded-2xl px-2 py-4 text-center text-white shadow-md sm:px-3 ${
                        isDebt
                            ? "bg-gradient-to-br from-amber-600 to-amber-500 shadow-amber-900/10"
                            : "bg-gradient-to-br from-emerald-800 to-emerald-700 shadow-emerald-900/10"
                    }`}>
                        <p className={`text-[11px] font-bold uppercase tracking-[0.12em] sm:text-xs ${isDebt ? "text-amber-50" : "text-emerald-100"}`}>Finale</p>
                        <p className="mt-2 break-words text-xl font-bold tabular-nums sm:text-2xl">{Number(note.note_finale).toFixed(2)}</p>
                        <p className={`mt-1 text-[11px] sm:text-xs ${isDebt ? "text-amber-50/90" : "text-emerald-100/80"}`}>Résultat final</p>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M3 10h18" />
                        </svg>
                        <span>Année universitaire : {note.academic_year}</span>
                    </p>
                    {reclamationPeriodOpen && (
                        <button
                            type="button"
                            onClick={() => openReclamationModal(note)}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 sm:w-auto ${
                                isDebt
                                    ? "border-amber-200 text-amber-800 hover:border-amber-600 hover:bg-amber-50 focus:ring-amber-100"
                                    : "border-emerald-200 text-emerald-800 hover:border-emerald-700 hover:bg-emerald-50 focus:ring-emerald-100"
                            }`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.4 8.4 0 0 1 12.5 3H13a8.4 8.4 0 0 1 8 8v.5Z" />
                            </svg>
                            Faire une réclamation
                        </button>
                    )}
                </div>
            </div>
        </article>
    );

    if (loading || !user) {
        return (
            <StudentLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                        <p className="text-sm font-medium text-slate-500">
                            Chargement de votre espace étudiant...
                        </p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="mx-auto max-w-7xl space-y-8 pb-10">
                {/* Feedback messages */}
                {successMessage && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">
                            ✓
                        </span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div
                        role="alert"
                        className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg">
                            !
                        </span>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Premium welcome banner */}
                <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 shadow-lg shadow-emerald-950/10">
                    {/* Decorative shapes */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-white/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
                    />

                    <div className="relative p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                    Espace étudiant
                                </div>

                                <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                    Bonjour{" "}
                                    {user.first_name} {user.last_name}
                                </h1>

                                <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-100/80 sm:text-base">
                                    Bienvenue sur votre espace académique.
                                    Consultez vos informations et retrouvez
                                    vos résultats publiés en un seul endroit.
                                </p>

                                <a
                                    href="#results"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/20"
                                >
                                    Consulter mes résultats
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 12h14m-6-6 6 6-6 6"
                                        />
                                    </svg>
                                </a>
                            </div>

                            <div className="hidden shrink-0 lg:flex lg:items-center lg:justify-center">
                                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] shadow-inner">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-200/20 bg-emerald-400/10">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.2"
                                            className="h-12 w-12 text-emerald-100"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.5 9 12 4l9.5 5L12 14 2.5 9Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6.5 11.1v5c3.3 2.6 7.7 2.6 11 0v-5M21.5 9v6"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21.5 15.5v2"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic summary cards */}
                        <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm transition hover:bg-white/[0.12]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 3 2.5 8 12 13l9.5-5L12 3Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.5 10.1V15c3.3 2.7 7.7 2.7 11 0v-4.9"
                                        />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-emerald-100/70">
                                        Filière
                                    </p>
                                    <p className="mt-1 truncate text-base font-semibold text-white">
                                        {user.filiere_name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm transition hover:bg-white/[0.12]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m3 8 9-5 9 5-9 5-9-5Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5v4.2c3 2.2 7 2.2 10 0v-4.2M21 8v6" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-emerald-100/70">
                                        Niveau
                                    </p>
                                    <p className="mt-1 text-base font-semibold text-white">
                                        {user.niveau || "Non renseigné"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm transition hover:bg-white/[0.12]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
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
                                            rx="2.5"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            d="M8 8h8M8 12h3m-3 4h8"
                                        />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-emerald-100/70">
                                        Matricule
                                    </p>
                                    <p className="mt-1 break-words text-base font-semibold text-white">
                                        {user.matricule}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm transition hover:bg-white/[0.12]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
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
                                            height="16"
                                            rx="2"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16 3v4M8 3v4M3 10h18"
                                        />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-emerald-100/70">
                                        Année universitaire
                                    </p>
                                    <p className="mt-1 text-base font-semibold text-white">
                                        2025-2026
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Results section: current level and previous-level debts */}
                <section id="results" className="scroll-mt-6 space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                                Suivi académique
                            </p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Mes résultats
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                                Retrouvez vos résultats publiés et les matières des niveaux précédents à valider.
                            </p>
                        </div>
                        <div className="inline-flex w-fit items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 15v-4m4 4V7m4 8V9" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-lg font-bold leading-5 text-slate-900">{notes.length}</p>
                                <p className="mt-1 text-xs text-slate-500">Matière{notes.length !== 1 ? "s" : ""} au total</p>
                            </div>
                        </div>
                    </div>

                    {notes.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-8 w-8" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75h8l4 4V20a1 1 0 0 1-1 1H6a1.25 1.25 0 0 1-1-1.25V5A1.25 1.25 0 0 1 6 3.75Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v4h4M8 13h8M8 17h5" />
                                </svg>
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-slate-900">Aucun résultat publié</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Vos résultats apparaîtront ici dès qu'ils seront publiés par l'administration.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Current-year results board */}
                            <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/40">
                                <div className="flex flex-col gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-5 9 5-9 5-9-5Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5v4.2c3 2.2 7 2.2 10 0v-4.2M21 9v6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-emerald-950 sm:text-xl">Résultats de l’année en cours</h3>
                                            <p className="mt-1 text-sm text-emerald-800/80">Les matières de votre niveau actuel</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800">
                                        {currentLevelNotes.length + unclassifiedNotes.length} matière{currentLevelNotes.length + unclassifiedNotes.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {currentLevelNotes.length + unclassifiedNotes.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                            {[...currentLevelNotes, ...unclassifiedNotes].map((note) => renderNoteCard(note, false))}
                                        </div>
                                    ) : (
                                        <p className="rounded-2xl border border-dashed border-emerald-200 bg-white p-6 text-center text-sm text-slate-500">
                                            Aucun résultat identifié pour votre niveau actuel.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Previous-level debts board */}
                            <div className="overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/40">
                                <div className="flex flex-col gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-amber-950 sm:text-xl">Matières en dette</h3>
                                            <p className="mt-1 text-sm text-amber-800/80">Matières des niveaux précédents à valider</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-semibold text-amber-800">
                                        {debtNotes.length} matière{debtNotes.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {debtNotes.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                            {debtNotes.map((note) => renderNoteCard(note, true))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-6 text-center">
                                            <p className="text-sm font-semibold text-amber-900">Aucune matière en dette identifiée</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                Les matières des niveaux précédents avec une note finale inférieure à 10 apparaîtront ici.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* Reclamation modal */}
            {showReclamationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reclamation-modal-title"
                        className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-800 px-6 py-6 sm:px-7">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/10"
                            />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-emerald-100">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.4 8.4 0 0 1 12.5 3H13a8.4 8.4 0 0 1 8 8v.5Z"
                                            />
                                        </svg>
                                    </div>

                                    <h2
                                        id="reclamation-modal-title"
                                        className="text-xl font-bold text-white sm:text-2xl"
                                    >
                                        Nouvelle réclamation
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                                        Expliquez votre demande concernant votre note.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowReclamationModal(false)
                                    }
                                    aria-label="Fermer"
                                    className="rounded-xl p-2 text-emerald-100 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            d="m6 6 12 12M18 6 6 18"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 sm:p-7">
                            <label
                                htmlFor="reclamation-message"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Votre message
                            </label>

                            <textarea
                                id="reclamation-message"
                                value={reclamationMessage}
                                onChange={(e) =>
                                    setReclamationMessage(e.target.value)
                                }
                                className="min-h-36 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                                placeholder="Expliquez votre réclamation..."
                            />

                            <p className="mt-2 text-xs leading-5 text-slate-400">
                                Veuillez fournir suffisamment de détails pour
                                expliquer votre demande.
                            </p>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowReclamationModal(false)
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="button"
                                    onClick={createReclamation}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"
                                        />
                                    </svg>
                                    Envoyer la réclamation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}
