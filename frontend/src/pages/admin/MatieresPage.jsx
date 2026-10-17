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

        const data = {
            ...formData,
            credit: formData.coefficient,
        };

        if (editingId) {

            await api.put(
                `/notes/matieres/${editingId}/`,
                data
            );

                setSuccessMessage(
                    "Matière modifiée avec succès"
                );

            } else {

                await api.post(
                    "/notes/matieres/",
                    data
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

                <div className="flex min-h-[45vh] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700/20 border-t-emerald-700" />
                        Chargement des matières...
                    </div>
                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-[#102c27]">
                    Matières
                </h1>
                
            </div>


            {successMessage && (

                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">

                    {successMessage}

                </div>
            )}


            {errorMessage && (

                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm">

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
                className="mb-6 inline-flex items-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >

                + Créer une matière

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">

                        <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">

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
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >

                                ×

                            </button>


                            <h2 className="mb-6 pr-10 text-2xl font-bold tracking-tight text-[#102c27]">

                                {
                                    editingId
                                        ? "Modifier la matière"
                                        : "Créer une matière"
                                }

                            </h2>


                            <form
                                onSubmit={createMatiere}
                                className="grid grid-cols-1 gap-5 md:grid-cols-2"
                            >

                                <select
                                    name="module"
                                    value={formData.module}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
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
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                    required
                                />


                                <input
                                    type="number"
                                    step="0.1"
                                    name="coefficient"
                                    value={formData.coefficient}
                                    onChange={handleChange}
                                    placeholder="Coefficient / Crédit"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                                    required
                                />


                                


                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#102c27] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                                >

                                    {editingId ? "Modifier" : "Créer"}

                                </button>

                            </form>

                        </div>

                    </div>
                )
            }


            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">

                    <thead className="bg-[#102c27] text-white">

                        <tr>

                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-50">
                                Matière
                            </th>

                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-50">
                                Module
                            </th>

                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-50">
                                Coefficient
                            </th>

                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-50">
                                Crédit
                            </th>
                            <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-50">
                                Actions
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {matieres.map((matiere) => (

                            <tr
                                key={matiere.id}
                                className="border-t border-slate-100 transition-colors hover:bg-emerald-50/40"
                            >

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {matiere.name}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {matiere.module_name}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {matiere.coefficient}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {matiere.credit}
                                </td>
                                <td className="flex gap-2 whitespace-nowrap px-5 py-4">

                                    <button
                                        onClick={() => editMatiere(matiere)}
                                        className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(matiere.id)}
                                        className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        Supprimer
                                    </button>

                                </td>
                            </tr>
                        ))}

                    </tbody>

                </table>
                </div>
            </div>
            {
    showDeleteModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">

                <h2 className="mb-3 text-2xl font-bold tracking-tight text-[#102c27]">

                    Confirmation

                </h2>

                <p className="mb-6 text-sm leading-6 text-slate-600">

                    Voulez-vous vraiment supprimer cette matière ?

                </p>

                <div className="flex justify-end gap-4">

                    <button
                        onClick={() => {

                            setShowDeleteModal(false);

                            setMatiereToDelete(null);
                        }}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                    >

                        Annuler

                    </button>

                    <button
                        onClick={deleteMatiere}
                        className="rounded-xl bg-rose-600 px-5 py-2.5 font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
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