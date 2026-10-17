import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function FilieresPage() {

    const [filieres, setFilieres] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [filiereToDelete, setFiliereToDelete] = useState(null);
    const [formData, setFormData] = useState({

        name: '',

        code: '',
    });

    const openDeleteModal = (id) => {

    setFiliereToDelete(id);

    setShowDeleteModal(true);
};
    useEffect(() => {

        fetchFilieres();

    }, []);


    useEffect(() => {

        if (successMessage) {

            const timer = setTimeout(() => {

                setSuccessMessage('');

            }, 2000);

            return () => clearTimeout(timer);
        }

    }, [successMessage]);


    const fetchFilieres = async () => {

        try {

            const response = await api.get(
                "/notes/filieres/"
            );

            setFilieres(response.data);

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


    const createFiliere = async (e) => {

        e.preventDefault();

        try {

            if (editingId) {

                await api.put(
                    `/notes/filieres/${editingId}/`,
                    formData
                );

                setSuccessMessage(
                    "Filière modifiée avec succès"
                    
                );
                setErrorMessage('');
            } else {

                await api.post(
                    "/notes/filieres/",
                    formData
                );

                setSuccessMessage(
                    "Filière créée avec succès"
                );
                setErrorMessage('');
            }

            fetchFilieres();

            setShowModal(false);

            setEditingId(null);

            setFormData({
                name: '',
                code: '',
            });

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de l'opération"
            );
        }
    };
    const deleteFiliere = async () => {

        try {

            await api.delete(
                `/notes/filieres/${filiereToDelete}/`
            );

            fetchFilieres();

            setSuccessMessage(
                "Filière supprimée avec succès"
            );

            setErrorMessage('');

            setShowDeleteModal(false);

            setFiliereToDelete(null);

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la suppression"
            );
        }
    };
    const editFiliere = (filiere) => {

    setEditingId(filiere.id);

    setFormData({
        name: filiere.name,
        code: filiere.code,
    });

    setShowModal(true);
};
    if (loading) {

        return (

            <AdminLayout>

                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-6 py-5 shadow-sm">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                        <span className="text-sm font-medium text-slate-600">Chargement des filières...</span>
                    </div>
                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <h1 className="mb-7 text-3xl font-bold tracking-tight text-[#102c27]">

                Filières

            </h1>


            {successMessage && (

                <div className="mb-4 flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 shadow-sm">

                    {successMessage}

                </div>
            )}


            {errorMessage && (

                <div className="mb-4 flex items-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-700 shadow-sm">

                    {errorMessage}

                </div>
            )}


            <button
                onClick={() => {
                    setEditingId(null);

                    setFormData({
                        name: '',
                        code: '',
                    });

                    setShowModal(true);
                }}
                className="mb-6 inline-flex items-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#19463d] focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >

                + Créer une filière

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

                        <div className="relative my-8 w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">

                            <button
                                onClick={() => {
                                setShowModal(false);

                                setEditingId(null);

                                setFormData({
                                    name: '',
                                    code: '',
                                });
                            }}
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            >

                                ×

                            </button>


                            <h2 className="mb-6 pr-10 text-2xl font-bold tracking-tight text-[#102c27]">
                                {editingId
                                    ? "Modifier la filière"
                                    : "Créer une filière"}
                            </h2>


                            <form
                                onSubmit={createFiliere}
                                className="flex flex-col gap-4"
                            >

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nom de la filière"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50"
                                    required
                                />


                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="Code"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50"
                                    required
                                />


                                <button
                                    type="submit"
                                    className="mt-1 w-full rounded-xl bg-[#102c27] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#19463d] focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                >
                                    {editingId ? "Modifier" : "Créer"}
                                </button>

                            </form>

                        </div>

                    </div>
                )
            }


            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">

                <table className="w-full min-w-[560px] text-left">

                    <thead className="bg-[#102c27] text-white">

                        <tr>

                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/90">
                                Nom
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/90">
                                Code
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/90">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {filieres.map((filiere) => (

                            <tr
                                key={filiere.id}
                                className="border-t border-slate-100 transition-colors hover:bg-emerald-50/40"
                            >

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {filiere.name}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                    {filiere.code}
                                </td>

                                <td className="px-5 py-4"><div className="flex flex-wrap items-center gap-2">

                                    <button
                                        onClick={() => editFiliere(filiere)}
                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(filiere.id)}
                                        className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
                                    >
                                        Supprimer
                                    </button>

                                </div></td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>
             {
    showDeleteModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">

                <h2 className="mb-4 text-2xl font-bold tracking-tight text-[#102c27]">

                    Confirmation

                </h2>

                <p className="mb-6 text-sm leading-6 text-slate-600">

                    Voulez-vous vraiment supprimer cette filière ?

                </p>

                <div className="flex justify-end gap-4">

                    <button
                        onClick={() => {

                            setShowDeleteModal(false);

                            setFiliereToDelete(null);
                        }}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                    >

                        Annuler

                    </button>

                    <button
                        onClick={deleteFiliere}
                        className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
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