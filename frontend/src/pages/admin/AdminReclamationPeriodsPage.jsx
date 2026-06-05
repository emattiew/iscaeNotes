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

                <div>

                    Loading...

                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <h1 className="text-3xl font-bold mb-6">

                Périodes de réclamation

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

                + Créer une période

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

                                Créer une période

                            </h2>


                            <form
                                onSubmit={createPeriod}
                                className="flex flex-col gap-4"
                            >

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Titre"
                                    className="border p-3 rounded"
                                    required
                                />

                                <input
                                    type="datetime-local"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                    required
                                />

                                <input
                                    type="datetime-local"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                    required
                                />

                                <label className="flex items-center gap-2">

                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />

                                    Active

                                </label>

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
                                Titre
                            </th>

                            <th className="p-4 text-left">
                                Date début
                            </th>

                            <th className="p-4 text-left">
                                Date fin
                            </th>

                            <th className="p-4 text-left">
                                Statut
                            </th>

                            <th className="p-4 text-left">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {periods.map((period) => (

                            <tr
                                key={period.id}
                                className="border-t"
                            >

                                <td className="p-4">

                                    {period.title}

                                </td>

                                <td className="p-4">

                                    {
                                        new Date(
                                            period.start_date
                                        ).toLocaleString()
                                    }

                                </td>

                                <td className="p-4">

                                    {
                                        new Date(
                                            period.end_date
                                        ).toLocaleString()
                                    }

                                </td>

                                <td className="p-4">

                                    {
                                        period.is_active ? (

                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">

                                                Active

                                            </span>

                                        ) : (

                                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">

                                                Fermée

                                            </span>
                                        )
                                    }

                                </td>

                                <td className="p-4">

                                    <button
                                        onClick={() =>
                                            togglePeriodStatus(
                                                period
                                            )
                                        }
                                        className={
                                            period.is_active

                                                ? "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"

                                                : "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
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

        </AdminLayout>
    );
}