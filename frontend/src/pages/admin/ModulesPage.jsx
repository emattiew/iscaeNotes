import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function ModulesPage() {

    const [modules, setModules] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [editingId, setEditingId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [moduleToDelete, setModuleToDelete] = useState(null);

    const [formData, setFormData] = useState({

        name: '',

        semestre: '',
    });


    useEffect(() => {

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


    const fetchModules = async () => {

        try {

            const response = await api.get(
                "/notes/modules/"
            );

            setModules(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };


    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,
        });
    };
    const editModule = (module) => {

    setEditingId(module.id);

    setFormData({
        name: module.name,
        semestre: module.semestre,
    });

    setShowModal(true);
};

const openDeleteModal = (id) => {

    setModuleToDelete(id);

    setShowDeleteModal(true);
};

const deleteModule = async () => {

    try {

        await api.delete(
            `/notes/modules/${moduleToDelete}/`
        );

        fetchModules();

        setSuccessMessage(
            "Module supprimé avec succès"
        );

        setErrorMessage('');

        setShowDeleteModal(false);

        setModuleToDelete(null);

    } catch (error) {

        console.error(error);

        setErrorMessage(
            "Erreur lors de la suppression"
        );
    }
};

    const createModule = async (e) => {

    e.preventDefault();

    try {

        if (editingId) {

            await api.put(
                `/notes/modules/${editingId}/`,
                formData
            );

            setSuccessMessage(
                "Module modifié avec succès"
            );

        } else {

            await api.post(
                "/notes/modules/",
                formData
            );

            setSuccessMessage(
                "Module créé avec succès"
            );
        }

        setErrorMessage('');

        fetchModules();

        setShowModal(false);

        setEditingId(null);

        setFormData({
            name: '',
            semestre: '',
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

                Modules

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
                    name: '',
                    semestre: '',
                });

                setShowModal(true);
            }}
                className="bg-black text-white px-5 py-3 rounded mb-6 hover:bg-gray-800"
            >

                + Créer un module

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-lg rounded-lg p-8 relative">

                            <button
                                onClick={() => {

                                setShowModal(false);

                                setEditingId(null);

                                setFormData({
                                    name: '',
                                    semestre: '',
                                });
                            }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >

                                ×

                            </button>


                            <h2 className="text-2xl font-bold mb-6">

                                {
                                    editingId
                                        ? "Modifier le module"
                                        : "Créer un module"
                                }

                            </h2>


                            <form
                                onSubmit={createModule}
                                className="flex flex-col gap-4"
                            >

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nom du module"
                                    className="border p-3 rounded"
                                    required
                                />


                                <input
                                    type="number"
                                    name="semestre"
                                    value={formData.semestre}
                                    onChange={handleChange}
                                    placeholder="Semestre"
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
                                Nom
                            </th>

                            <th className="p-4 text-left">
                                Semestre
                            </th>
                            <th className="p-4 text-left">
                                Actions
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {modules.map((module) => (

                            <tr
                                key={module.id}
                                className="border-t"
                            >

                                <td className="p-4">
                                    {module.name}
                                </td>

                                <td className="p-4">
                                    S{module.semestre}
                                </td>
                                <td className="p-4 flex gap-2">

                                    <button
                                        onClick={() => editModule(module)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(module.id)}
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

                    Voulez-vous vraiment supprimer ce module ?

                </p>

                <div className="flex justify-end gap-4">

                    <button
                        onClick={() => {

                            setShowDeleteModal(false);

                            setModuleToDelete(null);
                        }}
                        className="px-5 py-2 rounded border"
                    >

                        Annuler

                    </button>

                    <button
                        onClick={deleteModule}
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