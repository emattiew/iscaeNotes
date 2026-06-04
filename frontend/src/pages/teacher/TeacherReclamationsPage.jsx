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

                <div>

                    Loading...

                </div>

            </TeacherLayout>
        );
    }

    return (

        <TeacherLayout>

            {
                successMessage && (

                    <div className="bg-green-600 text-white p-4 rounded mb-4">

                        {successMessage}

                    </div>
                )
            }

            {
                errorMessage && (

                    <div className="bg-red-100 text-red-700 p-4 rounded mb-4">

                        {errorMessage}

                    </div>
                )
            }

            <h1 className="text-3xl font-bold mb-6">

                Réclamations

            </h1>

            <div className="bg-white rounded shadow overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-200">

                        <tr>

                            <th className="p-4 text-left">
                                Étudiant
                            </th>

                            <th className="p-4 text-left">
                                Matière
                            </th>

                            <th className="p-4 text-left">
                                Statut
                            </th>
                            <th className="p-4 text-left">
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
                                        className="border-t cursor-pointer hover:bg-blue-50 transition duration-200 hover:shadow-md"
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

                                        <td className="p-4">

                                            {
                                                reclamation.student_name
                                            }

                                        </td>

                                        <td className="p-4">

                                            {
                                                reclamation.matiere_name
                                            }

                                        </td>

                                        <td className="p-4 capitalize">

                                            {reclamation.status}

                                        
                                        </td>
                                        <td className="p-4">

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
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                            >
                                                Voir la réclamation
                                            </button>

                                        </td>
                                    </tr>
                                )
                            )
                        }

                    </tbody>

                </table>

            </div>

            {
                selectedReclamation && (

                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                        <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                            <h2 className="text-2xl font-bold mb-4">

                                Réclamation

                            </h2>

                            <div className="bg-gray-50 border rounded p-4 mb-4">

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

                            <div className="bg-blue-50 border rounded p-4 mb-4">

                                <h3 className="font-semibold mb-3">

                                    Notes publiées

                                </h3>

                                <div className="mb-3">

                                    <label className="block font-semibold mb-1">

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
                                        className="border rounded p-2 w-full bg-white"
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="block font-semibold mb-1">

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
                                        className="border rounded p-2 w-full bg-white"
                                    />

                                </div>

                                <p>

                                    <strong>Note finale actuelle :</strong>
                                    {" "}
                                    {selectedReclamation.note_finale}

                                </p>

                            </div>

                            <div className="mb-4">

                                <p className="font-semibold mb-2">

                                    Message de l'étudiant

                                </p>

                                <div className="bg-gray-100 p-3 rounded">

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
                                className="border w-full p-3 rounded h-32"
                                placeholder="Réponse de l'enseignant..."
                            />

                            <div className="flex gap-3 mt-4">

                                <button
                                    onClick={() =>
                                        updateReclamation(
                                            'accepted'
                                        )
                                    }
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Accepter
                                </button>

                                <button
                                    onClick={() =>
                                        updateReclamation(
                                            'rejected'
                                        )
                                    }
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Rejeter
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedReclamation(
                                            null
                                        )
                                    }
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
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