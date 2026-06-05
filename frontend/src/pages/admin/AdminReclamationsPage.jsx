import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";

export default function AdminReclamationsPage() {

    const [reclamations,
        setReclamations] =
        useState([]);

    const [loading,
        setLoading] =
        useState(true);

    const [selectedReclamation,
        setSelectedReclamation] =
        useState(null);

    useEffect(() => {

        fetchReclamations();

    }, []);

    const fetchReclamations =
        async () => {

        try {

            const response =
                await api.get(
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

    const pendingCount =
        reclamations.filter(
            r => r.status === 'pending'
        ).length;

    const acceptedCount =
        reclamations.filter(
            r => r.status === 'accepted'
        ).length;

    const rejectedCount =
        reclamations.filter(
            r => r.status === 'rejected'
        ).length;

    if (loading) {

        return (

            <AdminLayout>

                <div>

                    Loading...

                </div>

            </AdminLayout>
        );
    }

    return (

        <AdminLayout>

            <h1 className="text-3xl font-bold mb-6">

                Réclamations

            </h1>

            <div className="grid grid-cols-3 gap-4 mb-6">

                <div className="bg-yellow-100 p-4 rounded shadow">

                    <h3 className="font-semibold">

                        En attente

                    </h3>

                    <p className="text-3xl font-bold">

                        {pendingCount}

                    </p>

                </div>

                <div className="bg-green-100 p-4 rounded shadow">

                    <h3 className="font-semibold">

                        Corrigées

                    </h3>

                    <p className="text-3xl font-bold">

                        {acceptedCount}

                    </p>

                </div>

                <div className="bg-red-100 p-4 rounded shadow">

                    <h3 className="font-semibold">

                        Confirmées

                    </h3>

                    <p className="text-3xl font-bold">

                        {rejectedCount}

                    </p>

                </div>

            </div>

            <div className="bg-white rounded shadow overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-200">

                        <tr>

                            <th className="p-4 text-left">

                                Étudiant

                            </th>

                            <th className="p-4 text-left">

                                Matricule

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
                                        className="border-t hover:bg-gray-50"
                                    >

                                        <td className="p-4">

                                            {
                                                reclamation.student_name
                                            }

                                        </td>

                                        <td className="p-4">

                                            {
                                                reclamation.matricule
                                            }

                                        </td>

                                        <td className="p-4">

                                            {
                                                reclamation.matiere_name
                                            }

                                        </td>

                                        <td className="p-4">

                                            {
                                                reclamation.status === 'pending' && (

                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">

                                                        En attente

                                                    </span>
                                                )
                                            }

                                            {
                                                reclamation.status === 'accepted' && (

                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">

                                                        Corrigée

                                                    </span>
                                                )
                                            }

                                            {
                                                reclamation.status === 'rejected' && (

                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">

                                                        Confirmée

                                                    </span>
                                                )
                                            }

                                        </td>

                                        <td className="p-4">

                                            <button
                                                onClick={() =>
                                                    setSelectedReclamation(
                                                        reclamation
                                                    )
                                                }
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

                                    Notes

                                </h3>

                                <p>

                                    <strong>CC :</strong>
                                    {" "}
                                    {selectedReclamation.controle_continu}

                                </p>

                                <p>

                                    <strong>CF :</strong>
                                    {" "}
                                    {selectedReclamation.controle_final}

                                </p>

                                <p>

                                    <strong>Note finale :</strong>
                                    {" "}
                                    {selectedReclamation.note_finale}

                                </p>

                            </div>

                            <div className="mb-4">

                                <p className="font-semibold mb-2">

                                    Message étudiant

                                </p>

                                <div className="bg-gray-100 p-3 rounded">

                                    {
                                        selectedReclamation.message
                                    }

                                </div>

                            </div>

                            <div className="mb-4">

                                <p className="font-semibold mb-2">

                                    Réponse enseignant

                                </p>

                                <div className="bg-gray-100 p-3 rounded">

                                    {
                                        selectedReclamation.teacher_response ||
                                        "Aucune réponse"
                                    }

                                </div>

                            </div>

                            <div className="mb-4">

                                <p>

                                    <strong>Statut :</strong>
                                    {" "}
                                    {selectedReclamation.status}

                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedReclamation(
                                        null
                                    )
                                }
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            >

                                Fermer

                            </button>

                        </div>

                    </div>
                )
            }

        </AdminLayout>
    );
}