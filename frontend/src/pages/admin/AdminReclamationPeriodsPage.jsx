import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function AdminReclamationPeriodsPage() {

    const [periods, setPeriods] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({

        title: '',

        start_date: '',

        end_date: '',

        is_active: true,
    });


    useEffect(() => {

        fetchPeriods();

    }, []);


    useEffect(() => {

        if (successMessage) {

            const timer = setTimeout(() => {

                setSuccessMessage('');

            }, 2000);

            return () => clearTimeout(timer);
        }

    }, [successMessage]);


    useEffect(() => {

        if (errorMessage) {

            const timer = setTimeout(() => {

                setErrorMessage('');

            }, 2000);

            return () => clearTimeout(timer);
        }

    }, [errorMessage]);


    const fetchPeriods = async () => {

        try {

            const response = await api.get(
                "/notes/reclamation-periods/"
            );

            setPeriods(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };


    const handleChange = (e) => {

        const value =

            e.target.type === "checkbox"

                ? e.target.checked

                : e.target.value;

        setFormData({

            ...formData,

            [e.target.name]: value,
        });
    };


    const createPeriod = async (e) => {

        e.preventDefault();

        try {

            await api.post(

                "/notes/reclamation-periods/",

                formData
            );

            fetchPeriods();

            setShowModal(false);

            setSuccessMessage(
                "Période créée avec succès"
            );

            setErrorMessage('');

            setFormData({

                title: '',

                start_date: '',

                end_date: '',

                is_active: true,
            });

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la création"
            );

            setSuccessMessage('');
        }
    };

const togglePeriodStatus = async (period) => {

    try {

        await api.patch(

            `/notes/reclamation-periods/${period.id}/`,

            {

                is_active: !period.is_active
            }
        );

        fetchPeriods();

        setSuccessMessage(

            period.is_active

                ? "Période désactivée"

                : "Période activée"
        );

    } catch (error) {

        console.error(error);

        setErrorMessage(
            "Erreur lors de la mise à jour"
        );
    }
};
    if (loading) {

        return (

            <AdminLayout>

                <div className="flex min-h-[45vh] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-700" />
                        Chargement des périodes...
                    </div>
                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <div className="mb-7">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Administration</p>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#102c27] sm:text-4xl">
                    Périodes de réclamation
                </h1>
                
            </div>


            {successMessage && (

                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">

                    {successMessage}

                </div>
            )}


            {errorMessage && (

                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-sm">

                    {errorMessage}

                </div>
            )}


            <button
                onClick={() => setShowModal(true)}
                className="mb-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 font-semibold text-white shadow-md shadow-emerald-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-[#19483e] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >

                + Créer une période

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

                        <div className="relative my-8 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:p-8">

                            <div className="border-b border-emerald-100 bg-white px-6 pb-5 pt-7 sm:px-8">
                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Nouvelle période</p>
                                <h2 className="pr-10 text-2xl font-bold tracking-tight text-[#102c27]">
                                    Créer une période
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >

                                ×

                            </button>


                            <form
                                onSubmit={createPeriod}
                                className="flex flex-col gap-5 p-6 sm:p-8"
                            >

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Titre"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                    required
                                />

                                <input
                                    type="datetime-local"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                    required
                                />

                                <input
                                    type="datetime-local"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                    required
                                />

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-[#102c27] transition hover:border-emerald-300 hover:bg-emerald-50">

                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 accent-emerald-700 focus:ring-emerald-600"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />

                                    Active

                                </label>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#102c27] p-3 font-semibold text-white shadow-md shadow-emerald-950/10 transition hover:bg-[#19483e] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >

                                    Créer

                                </button>

                            </form>

                        </div>

                    </div>
                )
            }


            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-100 bg-white px-5 py-4">
                    <div>
                        <h2 className="text-sm font-bold text-[#102c27]">Périodes enregistrées</h2>
                        <p className="mt-1 text-xs text-slate-500">Consultez les dates et modifiez le statut de chaque période.</p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                        {periods.length} période(s)
                    </span>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] divide-y divide-slate-100 text-left">

                    <thead className="bg-[#102c27] text-white">

                        <tr>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-100">
                                Titre
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-100">
                                Date début
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-100">
                                Date fin
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-100">
                                Statut
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-100">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {periods.map((period) => (

                            <tr
                                key={period.id}
                                className="border-t border-slate-100 transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-emerald-50/70"
                            >

                                <td className="px-5 py-4 text-sm font-semibold text-slate-800">

                                    {period.title}

                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">

                                    {
                                        new Date(
                                            period.start_date
                                        ).toLocaleString()
                                    }

                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">

                                    {
                                        new Date(
                                            period.end_date
                                        ).toLocaleString()
                                    }

                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">

                                    {
                                        period.is_active ? (

                                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">

                                                Active

                                            </span>

                                        ) : (

                                            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">

                                                Fermée

                                            </span>
                                        )
                                    }

                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600">

                                    <button
                                        onClick={() =>
                                            togglePeriodStatus(
                                                period
                                            )
                                        }
                                        className={
                                            period.is_active
                                                ? "rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                                : "rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                        }
                                    >

                                        {
                                            period.is_active

                                                ? "Fermer la période"

                                                : "Activer la période"
                                        }

                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>
                </div>
                {periods.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-800">
                            —
                        </div>
                        <p className="font-semibold text-slate-800">Aucune période enregistrée</p>
                        <p className="mt-1 text-sm text-slate-500">Créez une période pour commencer à gérer les réclamations.</p>
                    </div>
                )}
            </div>

        </AdminLayout>
    );
}