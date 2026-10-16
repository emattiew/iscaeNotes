
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../../services/api";
import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherRattrapagePage() {
    const { id } = useParams();

    const [students, setStudents] = useState([]);
    const [collecte, setCollecte] = useState(null);
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchCollecte();
        fetchNotes();
    }, []);

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

            setErrorMessage(
                "Erreur lors du chargement de la collecte."
            );
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

            setErrorMessage(
                "Erreur lors du chargement des étudiants."
            );
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
                    note_finale: note.note_finale,
                };
            });

            setNotes(formattedNotes);
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Erreur lors du chargement des notes."
            );
        }
    };

    const handleRattrapageChange = (studentId, value) => {
        setNotes((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                rattrapage: value,
            },
        }));
    };

    const saveRattrapage = async () => {
        try {
            const notesData = Object.keys(notes)
                .filter((studentId) => {
                    const value = notes[studentId]?.rattrapage;

                    return (
                        value !== '' &&
                        value !== null &&
                        value !== undefined
                    );
                })
                .map((studentId) => ({
                    student: studentId,
                    rattrapage: notes[studentId].rattrapage,
                }));

            await api.post(
                `/notes/collectes/${id}/save_rattrapage/`,
                {
                    notes: notesData,
                }
            );

            setSuccessMessage(
                "Notes de rattrapage enregistrées avec succès."
            );

            setErrorMessage('');

            fetchNotes();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response?.data?.error ||
                "Erreur lors de l'enregistrement du rattrapage."
            );

            setSuccessMessage('');
        }
    };

    if (loading || !collecte) {
        return (
            <TeacherLayout>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                        <span className="font-medium text-slate-600">
                            Chargement...
                        </span>
                    </div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-700">
                            Espace enseignant
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                            Gestion du rattrapage
                        </h1>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-1.5 bg-[#102c27]" />

                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                        <div>
                            <p className="mb-1.5 text-sm font-medium text-slate-500">
                                Matière
                            </p>
                            <p className="text-base font-semibold text-slate-800">
                                {collecte.matiere_name}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-slate-500">
                                Filière
                            </p>
                            <p className="text-base font-semibold text-slate-800">
                                {collecte.filiere_name}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-slate-500">
                                Enseignant
                            </p>
                            <p className="text-base font-semibold text-slate-800">
                                {collecte.teacher_name}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-slate-500">
                                Année universitaire
                            </p>
                            <p className="text-base font-semibold text-slate-800">
                                {collecte.academic_year}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-slate-500">
                                Statut de la collecte
                            </p>
                            <span
                                className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                    collecte.status === "published"
                                        ? "bg-blue-100 text-blue-800"
                                        : collecte.status === "validated"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                }`}
                            >
                                {collecte.status === "published"
                                    ? "Publiée"
                                    : collecte.status === "validated"
                                    ? "Validée"
                                    : collecte.status === "prepared"
                                    ? "Préparée"
                                    : collecte.status}
                            </span>
                        </div>

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-slate-500">
                                Statut du rattrapage
                            </p>
                            <span
                                className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                    collecte.rattrapage_status === "opened"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : collecte.rattrapage_status === "validated"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-slate-100 text-slate-700"
                                }`}
                            >
                                {collecte.rattrapage_status === "opened"
                                    ? "Ouvert"
                                    : collecte.rattrapage_status === "validated"
                                    ? "Validé"
                                    : collecte.rattrapage_status === "published"
                                    ? "Publié"
                                    : collecte.rattrapage_status}
                            </span>
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                        <span className="font-bold">✓</span>
                        <p className="font-medium">{successMessage}</p>
                    </div>
                )}

                {errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <p className="font-medium">{errorMessage}</p>
                    </div>
                )}

                {collecte.rattrapage_status !== "opened" && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                        <span className="font-bold">!</span>
                        <p className="font-medium">
                            Le rattrapage n'est pas ouvert pour cette collecte.
                        </p>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:px-6">
                        <h2 className="text-lg font-bold text-slate-800">
                            Notes des étudiants
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] border-collapse text-left">
                            <thead className="bg-[#102c27] text-white">
                                <tr>
                                    <th className="px-5 py-4 text-sm font-semibold">
                                        Étudiant
                                    </th>
                                    <th className="px-5 py-4 text-sm font-semibold">
                                        Matricule
                                    </th>
                                    <th className="px-5 py-4 text-sm font-semibold">
                                        Contrôle continu
                                    </th>
                                    <th className="px-5 py-4 text-sm font-semibold">
                                        Contrôle final
                                    </th>
                                    <th className="px-5 py-4 text-sm font-semibold">
                                        Rattrapage
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="transition-colors hover:bg-emerald-50/40"
                                    >
                                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                            {student.username}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                            {student.matricule}
                                        </td>

                                        <td className="px-5 py-4">
                                            <input
                                                type="number"
                                                className="h-10 w-24 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-600 outline-none disabled:cursor-not-allowed"
                                                value={
                                                    notes[student.id]?.controle_continu ?? ""
                                                }
                                                disabled
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <input
                                                type="number"
                                                className="h-10 w-24 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-600 outline-none disabled:cursor-not-allowed"
                                                value={
                                                    notes[student.id]?.controle_final ?? ""
                                                }
                                                disabled
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.01"
                                                className="h-10 w-28 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                                                placeholder="0 – 20"
                                                value={
                                                    notes[student.id]?.rattrapage ?? ""
                                                }
                                                disabled={
                                                    collecte.rattrapage_status !== "opened"
                                                }
                                                onChange={(e) =>
                                                    handleRattrapageChange(
                                                        student.id,
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
                </div>

                {collecte.rattrapage_status === "opened" && (
                    <div className="flex flex-col justify-end gap-3 sm:flex-row">
                        <button
                            onClick={saveRattrapage}
                            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#102c27] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#19443b] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                        >
                            Enregistrer les notes de rattrapage
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    await api.post(
                                        `/notes/collectes/${id}/validate_rattrapage/`
                                    );

                                    setSuccessMessage(
                                        "Rattrapage validé avec succès."
                                    );

                                    setErrorMessage('');

                                    const response = await api.get(
                                        `/notes/collectes/${id}/`
                                    );

                                    setCollecte(response.data);
                                } catch (error) {
                                    console.error(error);

                                    setErrorMessage(
                                        error.response?.data?.error ||
                                        "Erreur lors de la validation du rattrapage."
                                    );

                                    setSuccessMessage('');
                                }
                            }}
                            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                        >
                            Valider le rattrapage
                        </button>
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
