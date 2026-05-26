import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function ModulesPage() {

    const [modules, setModules] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');


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


    const createModule = async (e) => {

        e.preventDefault();

        try {

            await api.post(
                "/notes/modules/",
                formData
            );

            fetchModules();

            setShowModal(false);

            setSuccessMessage(
                "Module créé avec succès"
            );

            setErrorMessage('');

            setFormData({

                name: '',

                semestre: '',
            });

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la création"
            );

            setSuccessMessage('');
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
                onClick={() => setShowModal(true)}
                className="bg-black text-white px-5 py-3 rounded mb-6 hover:bg-gray-800"
            >

                + Créer un module

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-lg rounded-lg p-8 relative">

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >

                                ×

                            </button>


                            <h2 className="text-2xl font-bold mb-6">

                                Créer un module

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

                                    Créer

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

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </AdminLayout>
    );
}