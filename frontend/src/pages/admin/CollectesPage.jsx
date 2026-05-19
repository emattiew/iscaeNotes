import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";
export default function CollectesPage() {

    const [collectes, setCollectes] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        fetchCollectes();

    }, []);


    const fetchCollectes = async () => {

        try {

            const response = await api.get("/notes/collectes/");

            setCollectes(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    };


    if (loading) {

        return (

            <div className="p-10">

                Loading...

            </div>
        );
    }


    return (

    <AdminLayout>

        <h1 className="text-3xl font-bold mb-6">

            Collectes

        </h1>


        <div className="bg-white rounded shadow overflow-hidden">

            <table className="w-full">

                <thead className="bg-gray-200">

                    <tr>

                        <th className="p-4 text-left">
                            Teacher
                        </th>

                        <th className="p-4 text-left">
                            Matiere
                        </th>

                        <th className="p-4 text-left">
                            Filiere
                        </th>

                        <th className="p-4 text-left">
                            Academic Year
                        </th>

                        <th className="p-4 text-left">
                            Status
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
                                {collecte.teacher_name}
                            </td>

                            <td className="p-4">
                                {collecte.matiere_name}
                            </td>

                            <td className="p-4">
                                {collecte.filiere_name}
                            </td>

                            <td className="p-4">
                                {collecte.academic_year}
                            </td>

                            <td className="p-4">
                                {collecte.status}
                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>

    </AdminLayout>
);
}