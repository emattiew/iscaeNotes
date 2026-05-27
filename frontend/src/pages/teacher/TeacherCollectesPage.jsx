import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import TeacherLayout from "../../layouts/TeacherLayout";


export default function TeacherCollectesPage() {

    const navigate = useNavigate();

    const [collectes, setCollectes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {

        fetchCollectes();

    }, []);


    useEffect(() => {

        if (successMessage) {

            const timer = setTimeout(() => {

                setSuccessMessage('');

            }, 1500);

            return () => clearTimeout(timer);
        }

    }, [successMessage]);


    const fetchCollectes = async () => {

        try {

            const response = await api.get(
                "/notes/collectes/"
            );

            setCollectes(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };


    const validateCollecte = async (id) => {

        try {

            await api.post(
                `/notes/collectes/${id}/validate/`
            );

            setSuccessMessage(
                "Collecte validée avec succès"
            );

            setErrorMessage('');

            fetchCollectes();

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la validation"
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

            <div className="flex items-center justify-between mb-8">

                <h1 className="text-5xl font-bold">

                    Mes Collectes

                </h1>

            </div>


            {successMessage && (

                <div className="bg-green-600 text-white p-4 rounded mb-4">

                    {successMessage}

                </div>
            )}


            {errorMessage && (

                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">

                    {errorMessage}

                </div>
            )}


            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-200">

                        <tr>

                            <th className="p-4 text-left">
                                Matière
                            </th>

                            <th className="p-4 text-left">
                                Filière
                            </th>

                            <th className="p-4 text-left">
                                Année
                            </th>

                            <th className="p-4 text-left">
                                Statut
                            </th>

                            <th className="p-4 text-left">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {collectes.map((collecte) => (

                            <tr
                                key={collecte.id}
                                className="border-t"
                            >

                                <td className="p-4">
                                    {collecte.matiere_name}
                                </td>

                                <td className="p-4">
                                    {collecte.filiere_name}
                                </td>

                                <td className="p-4">
                                    {collecte.academic_year}
                                </td>

                                <td className="p-4 capitalize">
                                    {collecte.status}
                                </td>

                                <td className="p-4 flex gap-3">

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/teacher/collectes/${collecte.id}/notes`
                                            )
                                        }
                                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                                    >

                                        Gérer les notes

                                    </button>


                                    {collecte.status === 'prepared' && (

                                        <button
                                            onClick={() =>
                                                validateCollecte(collecte.id)
                                            }
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >

                                            Valider

                                        </button>
                                    )}

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </TeacherLayout>
    );
}