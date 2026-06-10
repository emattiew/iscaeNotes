import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function MatieresPage() {

    const [matieres, setMatieres] = useState([]);

    const [modules, setModules] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [editingId, setEditingId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [matiereToDelete, setMatiereToDelete] = useState(null);

    const [formData, setFormData] = useState({

        module: '',

        name: '',

        coefficient: '',

        credit: '',
    });


    useEffect(() => {

        fetchMatieres();

        fetchModules();

    }, []);


    useEffect(() => {

        if (successMessage) {

            const timer = setTimeout(() => {

                setSuccessMessage('');

            }, 2000);

            return () => clearTimeout(timer);
        }

    }, [successMessage]);


    const fetchMatieres = async () => {

        try {

            const response = await api.get(
                "/notes/matieres/"
            );

            setMatieres(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };


    const fetchModules = async () => {

        try {

            const response = await api.get(
                "/notes/modules/"
            );

            setModules(response.data);

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

    const editMatiere = (matiere) => {

    setEditingId(matiere.id);

    setFormData({
        module: matiere.module,
        name: matiere.name,
        coefficient: matiere.coefficient,
        credit: matiere.credit,
    });

    setShowModal(true);
};

const openDeleteModal = (id) => {

    setMatiereToDelete(id);

    setShowDeleteModal(true);
};

const deleteMatiere = async () => {

    try {

        await api.delete(
            `/notes/matieres/${matiereToDelete}/`
        );

        fetchMatieres();

        setSuccessMessage(
            "Matière supprimée avec succès"
        );

        setErrorMessage('');

        setShowDeleteModal(false);

        setMatiereToDelete(null);

    } catch (error) {

        console.error(error);

        setErrorMessage(
            "Erreur lors de la suppression"
        );
    }
};
    const createMatiere = async (e) => {

        e.preventDefault();

        try {

            if (editingId) {

                await api.put(
                    `/notes/matieres/${editingId}/`,
                    formData
                );

                setSuccessMessage(
                    "Matière modifiée avec succès"
                );

            } else {

                await api.post(
                    "/notes/matieres/",
                    formData
                );

                setSuccessMessage(
                    "Matière créée avec succès"
                );
            }

            setErrorMessage('');

            fetchMatieres();

            setShowModal(false);

            setEditingId(null);

            setFormData({
                module: '',
                name: '',
                coefficient: '',
                credit: '',
            });

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de l'opération"
            );
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

                Matières

            </h1>


            {successMessage && (

                <div className="bg-green-600 text-white p-4 rounded mb-4">

                    {successMessage}

                </div>
            )}


            {errorMessage && (

                <div className="bg-red-600 text-white p-4 rounded mb-4">

                    {errorMessage}

                </div>
            )}


            <button
                onClick={() => {

                setEditingId(null);

                setFormData({
                    module: '',
                    name: '',
                    coefficient: '',
                    credit: '',
                });

                setShowModal(true);
            }}
                className="bg-black text-white px-5 py-3 rounded mb-6 hover:bg-gray-800"
            >

                + Créer une matière

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-xl rounded-lg p-8 relative">

                            <button
                                onClick={() => {

                                    setShowModal(false);

                                    setEditingId(null);

                                    setFormData({
                                        module: '',
                                        name: '',
                                        coefficient: '',
                                        credit: '',
                                    });
                                }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >

                                ×

                            </button>


                            <h2 className="text-2xl font-bold mb-6">

                                {
                                    editingId
                                        ? "Modifier la matière"
                                        : "Créer une matière"
                                }

                            </h2>


                            <form
                                onSubmit={createMatiere}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >

                                <select
                                    name="module"
                                    value={formData.module}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                    required
                                >

                                    <option value="">

                                        Sélectionner un module

                                    </option>

                                    {modules.map((module) => (

                                        <option
                                            key={module.id}
                                            value={module.id}
                                        >

                                            {module.name}

                                        </option>
                                    ))}

                                </select>


                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nom de la matière"
                                    className="border p-3 rounded"
                                    required
                                />


                                <input
                                    type="number"
                                    step="0.1"
                                    name="coefficient"
                                    value={formData.coefficient}
                                    onChange={handleChange}
                                    placeholder="Coefficient"
                                    className="border p-3 rounded"
                                    required
                                />


                                <input
                                    type="number"
                                    step="0.1"
                                    name="credit"
                                    value={formData.credit}
                                    onChange={handleChange}
                                    placeholder="Crédit"
                                    className="border p-3 rounded"
                                    required
                                />


                                <button
                                    type="submit"
                                    className="bg-black text-white p-3 rounded hover:bg-gray-800"
                                >

                                    {editingId ? "Modifier" : "Créer"}

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
                                Matière
                            </th>

                            <th className="p-4 text-left">
                                Module
                            </th>

                            <th className="p-4 text-left">
                                Coefficient
                            </th>

                            <th className="p-4 text-left">
                                Crédit
                            </th>
                            <th className="p-4 text-left">
                                Actions
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {matieres.map((matiere) => (

                            <tr
                                key={matiere.id}
                                className="border-t"
                            >

                                <td className="p-4">
                                    {matiere.name}
                                </td>

                                <td className="p-4">
                                    {matiere.module_name}
                                </td>

                                <td className="p-4">
                                    {matiere.coefficient}
                                </td>

                                <td className="p-4">
                                    {matiere.credit}
                                </td>
                                <td className="p-4 flex gap-2">

                                    <button
                                        onClick={() => editMatiere(matiere)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(matiere.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Supprimer
                                    </button>

                                </td>
                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>
            {
    showDeleteModal && (

        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-md rounded-lg p-8">

                <h2 className="text-2xl font-bold mb-4">

                    Confirmation

                </h2>

                <p className="text-gray-600 mb-6">

                    Voulez-vous vraiment supprimer cette matière ?

                </p>

                <div className="flex justify-end gap-4">

                    <button
                        onClick={() => {

                            setShowDeleteModal(false);

                            setMatiereToDelete(null);
                        }}
                        className="px-5 py-2 rounded border"
                    >

                        Annuler

                    </button>

                    <button
                        onClick={deleteMatiere}
                        className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
                    >

                        Supprimer

                    </button>

                </div>

            </div>

        </div>
    )
}            
        </AdminLayout>
    );
}