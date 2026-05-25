import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import TeacherLayout from "../../layouts/TeacherLayout";


export default function TeacherDashboard() {

    const navigate = useNavigate();

    const [collectes, setCollectes] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        fetchCollectes();

    }, []);


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

            <h1 className="text-4xl font-bold mb-8">

                Teacher Dashboard

            </h1>


            <div className="bg-white rounded shadow overflow-hidden">

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
                                Status
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

                                <td className="p-4">

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

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </TeacherLayout>
    );
}