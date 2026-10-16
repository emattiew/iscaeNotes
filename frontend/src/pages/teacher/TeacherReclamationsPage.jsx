import { useEffect, useState } from "react";

import api from "../../services/api";

import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherReclamationsPage() {

    const [reclamations, setReclamations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedReclamation,
        setSelectedReclamation] =
        useState(null);

    const [teacherResponse,
        setTeacherResponse] =
        useState('');

    const [editedCC,
    setEditedCC] =
    useState('');

    const [editedCF,
    setEditedCF] =
    useState('');

const [successMessage,
    setSuccessMessage] =
    useState('');

const [errorMessage,
    setErrorMessage] =
    useState('');

useEffect(() => {

    fetchReclamations();

}, []);

useEffect(() => {

    if (!successMessage) return;

    const timer = setTimeout(() => {

        setSuccessMessage('');

    }, 2000);

    return () => clearTimeout(timer);

}, [successMessage]);

useEffect(() => {

    if (!errorMessage) return;

    const timer = setTimeout(() => {

        setErrorMessage('');

    }, 2000);

    return () => clearTimeout(timer);

}, [errorMessage]);

    const fetchReclamations = async () => {

        try {

            const response = await api.get(
                "/notes/reclamations/"
            );

            setReclamations(
                response.data
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    const updateReclamation =
        async (status) => {

        try {

            await api.patch(

                `/notes/reclamations/${selectedReclamation.id}/`,

                {

                    status,

                    teacher_response:
                        teacherResponse,

                    controle_continu:
                        editedCC,

                    controle_final:
                        editedCF
                }
            );

            setSuccessMessage(
                "Réclamation mise à jour"
            );

            setErrorMessage('');

            fetchReclamations();

            setSelectedReclamation(
                null
            );

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la mise à jour"
            );

            setSuccessMessage('');
        }
    };

    if (loading) {

        return (

            <TeacherLayout>

                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                    <p className="text-sm font-medium text-slate-600">Chargement...</p>
                </div>

            </TeacherLayout>
        );
    }

    return (

        <TeacherLayout>

            {
                successMessage && (

                    <div role="status" className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-900">

                        {successMessage}

                    </div>
                )
            }

            {
                errorMessage && (

                    <div role="alert" className="mb-4 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-800">

                        {errorMessage}

                    </div>
                )
            }

            <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">

                Réclamations

            </h1>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="overflow-x-auto"><table className="w-full min-w-[640px]">

                    <thead className="bg-slate-50">

                        <tr>

                            <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-semibold text-slate-700">
                                Étudiant
                            </th>

                            <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-semibold text-slate-700">
                                Matière
                            </th>

                            <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-semibold text-slate-700">
                                Statut
                            </th>
                            <th className="border-b border-slate-200 px-5 py-4 text-left text-sm font-semibold text-slate-700">
                                Action
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {
                            reclamations.map(
                                (reclamation) => (

                                    <tr
                                        key={reclamation.id}
                                        className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-emerald-50/40"
                                        onClick={() => {

                                            setSelectedReclamation(
                                                reclamation
                                            );

                                            setTeacherResponse(
                                                reclamation.teacher_response || ''
                                            );

                                            setEditedCC(
                                                reclamation.controle_continu ?? ''
                                            );

                                            setEditedCF(
                                                reclamation.controle_final ?? ''
                                            );
                                        }}
                                    >

                                        <td className="px-5 py-4 text-sm text-slate-700">

                                            {
                                                reclamation.student_name
                                            }

                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-700">

                                            {
                                                reclamation.matiere_name
                                            }

                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium capitalize text-slate-700">
                                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                                                {reclamation.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700">

                                            <button
                                                onClick={(e) => {

                                                    e.stopPropagation();

                                                    setSelectedReclamation(
                                                        reclamation
                                                    );

                                                    setTeacherResponse(
                                                        reclamation.teacher_response || ''
                                                    );

                                                    setEditedCC(
                                                        reclamation.controle_continu ?? ''
                                                    );

                                                    setEditedCF(
                                                        reclamation.controle_final ?? ''
                                                    );
                                                }}
                                                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                            >
                                                Voir la réclamation
                                            </button>

                                        </td>
                                    </tr>
                                )
                            )
                        }

                    </tbody>

                </table></div>

            </div>

            {
                selectedReclamation && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">

                            <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">

                                Réclamation

                            </h2>

                            <div className="mb-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">

                                <p>

                                    <strong>Étudiant :</strong>
                                    {" "}
                                    {selectedReclamation.student_name}

                                </p>

                                <p>

                                    <strong>Matricule :</strong>
                                    {" "}
                                    {selectedReclamation.matricule}

                                </p>

                                <p>

                                    <strong>Matière :</strong>
                                    {" "}
                                    {selectedReclamation.matiere_name}

                                </p>

                            </div>

                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">

                                <h3 className="mb-3 font-semibold text-slate-900">

                                    Notes publiées

                                </h3>

                                <div className="mb-3">

                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                                        Contrôle Continu

                                    </label>

                                    <input
                                        type="number"
                                        value={editedCC}
                                        onChange={(e) =>
                                            setEditedCC(
                                                e.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">

                                        Contrôle Final

                                    </label>

                                    <input
                                        type="number"
                                        value={editedCF}
                                        onChange={(e) =>
                                            setEditedCF(
                                                e.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                                    />

                                </div>

                                <p>

                                    <strong>Note finale actuelle :</strong>
                                    {" "}
                                    {selectedReclamation.note_finale}

                                </p>

                            </div>

                            <div className="mb-4">

                                <p className="mb-2 font-semibold text-slate-900">

                                    Message de l'étudiant

                                </p>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">

                                    {
                                        selectedReclamation.message
                                    }

                                </div>

                            </div>

                            <textarea
                                value={teacherResponse}
                                onChange={(e) =>
                                    setTeacherResponse(
                                        e.target.value
                                    )
                                }
                                className="min-h-32 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                                placeholder="Réponse de l'enseignant..."
                            />

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                                <button
                                    onClick={() =>
                                        updateReclamation(
                                            'accepted'
                                        )
                                    }
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    Accepter
                                </button>

                                <button
                                    onClick={() =>
                                        updateReclamation(
                                            'rejected'
                                        )
                                    }
                                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Rejeter
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedReclamation(
                                            null
                                        )
                                    }
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                                >
                                    Fermer
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

        </TeacherLayout>
    );
}