
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../services/api";
import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherCollecteNotesPage() {
    const { id } = useParams();

    const [students, setStudents] = useState([]);
    const [collecte, setCollecte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [ocrFile, setOcrFile] = useState(null);
    const [ocrMatches, setOcrMatches] = useState([]);
    const [ocrLoading, setOcrLoading] = useState(false);

    // Scroll to the top so success and error messages are visible.
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        fetchCollecte();
        fetchNotes();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchCollecte = async () => {
        try {
            const response = await api.get(`/notes/collectes/${id}/`);

            setCollecte(response.data);
            fetchStudents(response.data.filiere);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async (filiereId) => {
        try {
            const response = await api.get(
                `/accounts/students/?filiere=${filiereId}`
            );

            setStudents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotes = async () => {
        try {
            const response = await api.get(
                `/notes/student-notes/?collecte=${id}`
            );

            const formattedNotes = {};

            response.data.forEach((note) => {
                formattedNotes[note.student] = {
                    controle_continu: note.controle_continu,
                    controle_final: note.controle_final,
                };
            });

            setNotes(formattedNotes);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNoteChange = (studentId, field, value) => {
        setNotes((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
            },
        }));
    };

    const handleOCRMatchChange = (index, field, value) => {
        setOcrMatches((prev) => {
            const updated = [...prev];

            updated[index] = {
                ...updated[index],
                [field]: value === "" ? null : Number(value),
            };

            return updated;
        });
    };

    const saveNotes = async () => {
        try {
            for (const studentId in notes) {
                const noteData = {
                    collecte: id,
                    student: studentId,
                    controle_continu:
                        notes[studentId].controle_continu || 0,
                    controle_final:
                        notes[studentId].controle_final || 0,
                };

                await api.post("/notes/student-notes/", noteData);
            }

            setSuccessMessage("Notes enregistrées avec succès");
            setErrorMessage("");
            fetchNotes();
        } catch (error) {
            console.error(error);

            setErrorMessage("Erreur lors de l'enregistrement");
            setSuccessMessage("");
        } finally {
            scrollToTop();
        }
    };

    const analyzeOCR = async () => {
        if (!ocrFile) {
            setErrorMessage("Veuillez sélectionner une image");

            setTimeout(() => {
                setErrorMessage("");
            }, 1500);

            return;
        }

        try {
            setOcrLoading(true);

            const formData = new FormData();
            formData.append("image", ocrFile);

            const response = await api.post(
                "/ocr/upload/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const matches = response.data.matches || [];

            setOcrMatches(matches);

            if (matches.length === 0) {
                setErrorMessage(
                    "Image trop peu claire : l'OCR n'a pas pu détecter les informations des étudiants. Veuillez utiliser une image plus nette."
                );

                setSuccessMessage("");
            } else {
                setSuccessMessage("Analyse OCR terminée");
                setErrorMessage("");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Erreur OCR");
        } finally {
            setOcrLoading(false);
        }
    };

    const importOCR = async () => {
        try {
            const response = await api.post("/ocr/import/", {
                collecte_id: parseInt(id),
                matches: ocrMatches,
            });

            setSuccessMessage(
                `${response.data.imported_notes} notes importées`
            );

            setErrorMessage("");
            fetchNotes();
            setOcrMatches([]);
        } catch (error) {
            console.error(error);
            setErrorMessage("Erreur lors de l'import");
        }
    };

    const validateCollecte = async () => {
        try {
            await api.post(`/notes/collectes/${id}/validate/`);

            setSuccessMessage("Collecte validée avec succès");
            setErrorMessage("");
            fetchCollecte();
        } catch (error) {
            console.error(error);

            setErrorMessage("Erreur lors de la validation");
            setSuccessMessage("");
        } finally {
            scrollToTop();
        }
    };

    const statusStyles = {
        prepared: "bg-amber-100 text-amber-800 ring-amber-600/25",
        validated: "bg-emerald-100 text-emerald-800 ring-emerald-600/25",
        published: "bg-blue-100 text-blue-800 ring-blue-600/25",
    };

    const statusLabels = {
        prepared: "Préparée",
        validated: "Validée",
        published: "Publiée",
    };

    if (loading || !collecte) {
        return (
            <TeacherLayout>
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                    <p className="text-sm font-medium text-slate-600">
                        Chargement...
                    </p>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="space-y-6 pb-8 text-slate-800">

                {/* En-tête */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            to="/teacher/collectes"
                            className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                                aria-hidden="true"
                            >
                                <path
                                    d="M19 12H5m7 7-7-7 7-7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Retour aux collectes
                        </Link>

                        <div className="mb-2 flex items-center gap-2">
                            <span className="h-1.5 w-7 rounded-full bg-emerald-500" />
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                                Espace enseignant
                            </p>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Gestion des notes
                        </h1>
                    </div>

                    <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
                            statusStyles[collecte.status] ||
                            "bg-slate-100 text-slate-700 ring-slate-300"
                        }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                collecte.status === "prepared"
                                    ? "bg-amber-500"
                                    : collecte.status === "validated"
                                    ? "bg-emerald-600"
                                    : collecte.status === "published"
                                    ? "bg-blue-600"
                                    : "bg-slate-500"
                            }`}
                        />
                        {statusLabels[collecte.status] || collecte.status}
                    </span>
                </header>

                {/* Informations de la collecte */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
                        <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:border-r">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" strokeLinejoin="round" />
                                    <path d="M8 7h7M8 10h7" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500">Matière</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                    {collecte.matiere_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:border-b-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500">Filière</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                    {collecte.filiere_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:border-r">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500">Enseignant</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                    {collecte.teacher_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <rect x="3" y="5" width="18" height="16" rx="2" />
                                    <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500">Année universitaire</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                    {collecte.academic_year}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Messages */}
                {successMessage && (
                    <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-900">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0" aria-hidden="true">
                            <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-800">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v5m0 3h.01" strokeLinecap="round" />
                        </svg>
                        {errorMessage}
                    </div>
                )}

                {/* Import OCR */}
                {collecte.status === "prepared" && (
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <rect x="3" y="3" width="18" height="18" rx="3" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Import OCR
                            </h2>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <label
                                    htmlFor="ocr-file"
                                    className="inline-flex min-h-12 max-w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-700 hover:bg-emerald-100"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0" aria-hidden="true">
                                        <path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="truncate">
                                        {ocrFile ? ocrFile.name : "Choisir une image"}
                                    </span>
                                </label>

                                <input
                                    id="ocr-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setOcrFile(e.target.files[0])
                                    }
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={analyzeOCR}
                                    disabled={ocrLoading}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b5143] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {ocrLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Analyse...
                                        </>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                                <circle cx="11" cy="11" r="7" />
                                                <path d="m16 16 4 4M11 8v6m-3-3h6" strokeLinecap="round" />
                                            </svg>
                                            Analyser OCR
                                        </>
                                    )}
                                </button>
                            </div>

                            {ocrMatches.length > 0 && (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <h3 className="text-base font-bold text-slate-900">
                                            Résultats OCR
                                        </h3>
                                        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                                            {ocrMatches.length} résultat(s)
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-200">
                                        {ocrMatches.map((match, index) => (
                                            <div
                                                key={match.matricule}
                                                className="grid grid-cols-1 gap-4 p-4 transition hover:bg-slate-50/70 md:grid-cols-[minmax(0,1fr)_auto] md:items-center sm:p-5"
                                            >
                                                <div className="min-w-0">
                                                    <p className="break-words text-base font-semibold text-slate-900">
                                                        {match.student_name}
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                                        Matricule : {match.matricule}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-end gap-4">
                                                    <label className="block">
                                                        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                                                            CC
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={match.cc ?? ""}
                                                            onChange={(e) =>
                                                                handleOCRMatchChange(
                                                                    index,
                                                                    "cc",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-11 w-24 rounded-lg border border-slate-300 bg-white px-3 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                                                        />
                                                    </label>

                                                    <label className="block">
                                                        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                                                            CF
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={match.cf ?? ""}
                                                            onChange={(e) =>
                                                                handleOCRMatchChange(
                                                                    index,
                                                                    "cf",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-11 w-24 rounded-lg border border-slate-300 bg-white px-3 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                                                        />
                                                    </label>

                                                    {match.found ? (
                                                        <span className="mb-0.5 inline-flex h-8 items-center gap-2 rounded-full bg-emerald-100 px-3 text-sm font-semibold text-emerald-800">
                                                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                                            Trouvé
                                                        </span>
                                                    ) : (
                                                        <span className="mb-0.5 inline-flex h-8 items-center gap-2 rounded-full bg-red-100 px-3 text-sm font-semibold text-red-800">
                                                            <span className="h-2 w-2 rounded-full bg-red-600" />
                                                            Introuvable
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-4 sm:px-5">
                                        <button
                                            type="button"
                                            onClick={importOCR}
                                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                                                <path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Importer les notes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {collecte.status !== "prepared" && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-900">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
                            <path d="M12 3 2.8 20h18.4L12 3Z" strokeLinejoin="round" />
                            <path d="M12 9v4m0 3h.01" strokeLinecap="round" />
                        </svg>
                        <p>Cette collecte est verrouillée. Les notes ne peuvent plus être modifiées.</p>
                    </div>
                )}

                {/* Tableau des notes */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <rect x="4" y="3" width="16" height="18" rx="2" />
                                    <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Notes des étudiants
                            </h2>
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                            {students.length} étudiant(s)
                        </span>
                    </div>

                    {students.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-base font-semibold text-slate-700">
                                Aucun étudiant disponible
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700 sm:px-6">
                                            Étudiant
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                                            Matricule
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                                            Contrôle continu
                                        </th>
                                        <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                                            Contrôle final
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {students.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="transition-colors hover:bg-emerald-50/40"
                                        >
                                            <td className="px-5 py-4 sm:px-6">
                                                <span className="text-base font-semibold text-slate-900">
                                                    {student.username}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                                                    {student.matricule}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <input
                                                    type="number"
                                                    className="h-11 w-28 rounded-lg border border-slate-300 bg-white px-3 text-base font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                                    placeholder="CC"
                                                    disabled={collecte.status !== "prepared"}
                                                    value={
                                                        notes[student.id]?.controle_continu || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleNoteChange(
                                                            student.id,
                                                            "controle_continu",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                <input
                                                    type="number"
                                                    className="h-11 w-28 rounded-lg border border-slate-300 bg-white px-3 text-base font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                                    placeholder="CF"
                                                    disabled={collecte.status !== "prepared"}
                                                    value={
                                                        notes[student.id]?.controle_final || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleNoteChange(
                                                            student.id,
                                                            "controle_final",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {collecte.status === "prepared" && (
                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:justify-end sm:px-6">
                            <button
                                type="button"
                                onClick={saveNotes}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b5143] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <path d="M5 3h12l4 4v14H3V3h2Z" strokeLinejoin="round" />
                                    <path d="M7 3v6h10V3M7 21v-8h10v8" strokeLinejoin="round" />
                                </svg>
                                Enregistrer les notes
                            </button>

                            <button
                                type="button"
                                onClick={validateCollecte}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                                    <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Valider la collecte
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </TeacherLayout>
    );
}
