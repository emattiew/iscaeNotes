
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

export default function CollecteNotesPage() {
    const { id } = useParams();

    const [students, setStudents] = useState([]);
    const [collecte, setCollecte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchCollecte();
        fetchNotes();
    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchCollecte = async () => {
        try {
            const response = await api.get(
                `/notes/collectes/${id}/`
            );

            setCollecte(response.data);

            fetchStudents(
                response.data.filiere
            );
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
                    rattrapage: note.rattrapage ?? 0,
                    note_finale: note.note_finale ?? 0,
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

                await api.post(
                    "/notes/student-notes/",
                    noteData
                );
            }

            setSuccessMessage(
                "Notes enregistrées avec succès"
            );

            setErrorMessage('');

            fetchNotes();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Erreur lors de l'enregistrement"
            );

            setSuccessMessage('');
        }
    };

    if (loading || !collecte) {
        return (
            <AdminLayout>
                <div className="flex min-h-[320px] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-[#102c27]" />
                        <p className="text-sm font-medium text-slate-500">
                            Chargement des données...
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const isEditable = collecte.status === 'prepared';

    const statusLabels = {
        prepared: "Préparée",
        opened: "Ouverte",
        validated: "Validée",
        published: "Publiée",
    };

    const statusLabel =
        statusLabels[collecte.status] || collecte.status;

    return (
        <AdminLayout>
            <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-8">

                {/* Page heading */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-1.5 w-7 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                                Gestion académique
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-[#102c27] sm:text-4xl">
                            Gestion des notes
                        </h1>
                    </div>

                    <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                        isEditable
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}>
                        <span className={`h-2 w-2 rounded-full ${
                            isEditable ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {statusLabel}
                    </div>
                </div>

                {/* Collecte information */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102c27] text-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                            </svg>
                        </div>

                        <div>
                            <h2 className="font-bold text-[#102c27]">
                                Informations de la collecte
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                label: 'Matière',
                                value: collecte.matiere_name,
                            },
                            {
                                label: 'Filière',
                                value: collecte.filiere_name,
                            },
                            {
                                label: 'Enseignant',
                                value: collecte.teacher_name,
                            },
                            {
                                label: 'Année universitaire',
                                value: collecte.academic_year,
                            },
                            {
                                label: 'Statut',
                                value: statusLabel,
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="min-w-0 bg-white px-6 py-5 transition-colors hover:bg-slate-50/70"
                            >
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {item.label}
                                </p>
                                <p className="break-words text-base font-semibold text-slate-800">
                                    {item.value || '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Feedback messages */}
                {successMessage && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                            </svg>
                        </div>
                        <div className="pt-1">
                            <p className="text-sm font-semibold">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                            </svg>
                        </div>
                        <p className="pt-1 text-sm font-semibold">
                            {errorMessage}
                        </p>
                    </div>
                )}

                {!isEditable && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-5 w-5"
                            >
                                <rect x="5" y="10" width="14" height="11" rx="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold">
                                Cette collecte est verrouillée
                            </p>
                            <p className="mt-1 text-sm leading-6 text-amber-800">
                                Les notes ne peuvent plus être modifiées.
                            </p>
                        </div>
                    </div>
                )}

                {/* Grades table */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-[#102c27]">
                                Liste des étudiants
                            </h2>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-4 w-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {students.length} étudiant{students.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-left">
                            <thead>
                                <tr className="bg-[#102c27] text-white">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Étudiant
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Matricule
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Contrôle Continu
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Contrôle Final
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Rattrapage
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Note finale
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {students.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className={`transition-colors hover:bg-emerald-50/40 ${
                                            index % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-slate-50/50'
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-[#102c27]">
                                                    {(student.username || '?')
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-800">
                                                    {student.username}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-sm text-slate-600">
                                                {student.matricule}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                                placeholder="CC"
                                                disabled={collecte.status !== 'prepared'}
                                                value={notes[student.id]?.controle_continu || ''}
                                                onChange={(e) =>
                                                    handleNoteChange(
                                                        student.id,
                                                        'controle_continu',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                                placeholder="CF"
                                                disabled={collecte.status !== 'prepared'}
                                                value={notes[student.id]?.controle_final || ''}
                                                onChange={(e) =>
                                                    handleNoteChange(
                                                        student.id,
                                                        'controle_final',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                className="w-24 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-500"
                                                value={notes[student.id]?.rattrapage ?? ''}
                                                disabled
                                            />
                                        </td>

                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                className="w-24 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-bold text-[#102c27]"
                                                value={notes[student.id]?.note_finale ?? ''}
                                                disabled
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {students.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        className="h-7 w-7"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                                    </svg>
                                                </div>
                                                <p className="font-semibold text-slate-700">
                                                    Aucun étudiant trouvé
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                    Aucun étudiant n'est disponible pour cette filière.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500">
                            Les champs grisés sont calculés ou gérés automatiquement.
                        </p>

                        {isEditable && (
                            <button
                                onClick={saveNotes}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102c27] px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#1b453d] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-800/20 active:translate-y-0"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h12l4 4v14H3V3h2Zm2 0v6h10V3M7 21v-7h10v7" />
                                </svg>
                                Enregistrer les notes
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
