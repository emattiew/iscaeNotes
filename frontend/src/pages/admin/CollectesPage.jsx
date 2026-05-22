import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function CollectesPage() {

    const navigate = useNavigate();

    const [collectes, setCollectes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [teachers, setTeachers] = useState([]);

    const [matieres, setMatieres] = useState([]);

    const [filieres, setFilieres] = useState([]);


    const [formData, setFormData] = useState({

        teacher: '',

        matiere: '',

        filiere: '',

        academic_year: '2025-2026',

        status: 'prepared',
    });


    useEffect(() => {

        fetchCollectes();

        fetchTeachers();

        fetchMatieres();

        fetchFilieres();

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


    const fetchTeachers = async () => {

        try {

            const response = await api.get(
                "/accounts/teachers/"
            );

            setTeachers(response.data);

        } catch (error) {

            console.error(error);
        }
    };


    const fetchMatieres = async () => {

        try {

            const response = await api.get(
                "/notes/matieres/"
            );

            setMatieres(response.data);

        } catch (error) {

            console.error(error);
        }
    };


    const fetchFilieres = async () => {

        try {

            const response = await api.get(
                "/notes/filieres/"
            );

            setFilieres(response.data);

        } catch (error) {

            console.error(error);
        }
    };


    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,
        });
    };


    const createCollecte = async (e) => {

        e.preventDefault();

        try {

            await api.post(
                "/notes/collectes/",
                formData
            );

            fetchCollectes();

            setShowModal(false);

        } catch (error) {

            console.error(error);
        }
    };


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

                Collectes

            </h1>


            <button
                onClick={() => setShowModal(true)}
                className="bg-black text-white px-5 py-3 rounded mb-6 hover:bg-gray-800"
            >

                + Créer une collecte

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-2xl rounded-lg p-8 relative">

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >

                                ×

                            </button>


                            <h2 className="text-2xl font-bold mb-6">

                                Créer une collecte

                            </h2>


                            <form
                                onSubmit={createCollecte}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >

                                <select
                                    name="teacher"
                                    value={formData.teacher}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                    required
                                >

                                    <option value="">

                                        Sélectionner un enseignant

                                    </option>

                                    {teachers.map((teacher) => (

                                        <option
                                            key={teacher.id}
                                            value={teacher.id}
                                        >

                                            {teacher.username}

                                        </option>
                                    ))}

                                </select>


                                <select
                                    name="matiere"
                                    value={formData.matiere}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                    required
                                >

                                    <option value="">

                                        Sélectionner une matière

                                    </option>

                                    {matieres.map((matiere) => (

                                        <option
                                            key={matiere.id}
                                            value={matiere.id}
                                        >

                                            {matiere.name}

                                        </option>
                                    ))}

                                </select>


                                <select
                                    name="filiere"
                                    value={formData.filiere}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                    required
                                >

                                    <option value="">

                                        Sélectionner une filière

                                    </option>

                                    {filieres.map((filiere) => (

                                        <option
                                            key={filiere.id}
                                            value={filiere.id}
                                        >

                                            {filiere.code}

                                        </option>
                                    ))}

                                </select>


                                <input
                                    type="text"
                                    name="academic_year"
                                    value={formData.academic_year}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                    placeholder="Année universitaire"
                                    required
                                />


                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                >

                                    <option value="prepared">
                                        Prepared
                                    </option>

                                    <option value="opened">
                                        Opened
                                    </option>

                                    <option value="validated">
                                        Validated
                                    </option>

                                    <option value="published">
                                        Published
                                    </option>

                                </select>


                                <button
                                    type="submit"
                                    className="bg-black text-white p-3 rounded hover:bg-gray-800"
                                >

                                    Créer la collecte

                                </button>

                            </form>

                        </div>

                    </div>
                )
            }


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

                                <td className="p-4">

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/admin/collectes/${collecte.id}/notes`
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

        </AdminLayout>
    );
}