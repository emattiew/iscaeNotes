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

                <div className="text-center py-20 text-gray-500">

                    Chargement...

                </div>

            </TeacherLayout>
        );
    }

    const preparedCount = collectes.filter(
        c => c.status === "prepared"
    ).length;

    const validatedCount = collectes.filter(
        c => c.status === "validated"
    ).length;

    const publishedCount = collectes.filter(
        c => c.status === "published"
    ).length;

    return (

        <TeacherLayout>

            <div className="mb-8">

                <h1 className="text-4xl font-bold">
                    Tableau de bord
                </h1>

                <p className="text-gray-500 mt-2">
                    Suivi de vos collectes et réclamations
                </p>

            </div>

            {/* Cartes */}

            <div className="grid grid-cols-4 gap-6 mb-8">

                <div
                    className="
                        bg-violet-100
                        border-l-4
                        border-violet-500
                        p-6
                        rounded-xl
                        shadow-sm
                    "
                >

                    <h2 className="text-violet-800 font-semibold">
                        Mes collectes
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-violet-900">
                        {collectes.length}
                    </p>

                </div>

                <div
                    className="
                        bg-orange-100
                        border-l-4
                        border-orange-500
                        p-6
                        rounded-xl
                        shadow-sm
                    "
                >

                    <h2 className="text-orange-800 font-semibold">
                        À préparer
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-orange-900">
                        {preparedCount}
                    </p>

                </div>

                <div
                    className="
                        bg-cyan-100
                        border-l-4
                        border-cyan-500
                        p-6
                        rounded-xl
                        shadow-sm
                    "
                >

                    <h2 className="text-cyan-800 font-semibold">
                        Validées
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-cyan-900">
                        {validatedCount}
                    </p>

                </div>

                <div
                    className="
                        bg-emerald-100
                        border-l-4
                        border-emerald-500
                        p-6
                        rounded-xl
                        shadow-sm
                    "
                >

                    <h2 className="text-emerald-800 font-semibold">
                        Publiées
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-emerald-900">
                        {publishedCount}
                    </p>

                </div>

            </div>

            {/* Actions rapides */}

            <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">

                <h2 className="text-xl font-semibold mb-4">
                    Actions rapides
                </h2>

                <div className="flex flex-wrap gap-4">

                    <button
                        onClick={() =>
                            navigate(
                                "/teacher/collectes"
                            )
                        }
                        className="
                            bg-violet-200
                            text-violet-900
                            px-5
                            py-3
                            rounded-xl
                            hover:bg-violet-300
                            transition-all
                        "
                    >
                        Voir mes collectes
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/teacher/reclamations"
                            )
                        }
                        className="
                            bg-orange-200
                            text-orange-900
                            px-5
                            py-3
                            rounded-xl
                            hover:bg-orange-300
                            transition-all
                        "
                    >
                        Réclamations
                    </button>

                </div>

            </div>

            {/* Dernières collectes */}

            <div className="bg-white p-6 rounded-2xl shadow-sm">

                <h2 className="text-xl font-semibold mb-4">
                    Dernières collectes
                </h2>

                {collectes.length === 0 ? (

                    <p className="text-gray-400 text-center py-8">
                        Aucune collecte disponible
                    </p>

                ) : (

                    <div className="space-y-4">

                        {collectes
                            .slice(0, 5)
                            .map((collecte) => (

                                <div
                                    key={collecte.id}
                                    className="
                                        border-b
                                        border-gray-100
                                        pb-3
                                    "
                                >

                                    <div className="flex justify-between items-center">

                                        <div>

                                            <p className="font-medium">
                                                {
                                                    collecte.matiere_name
                                                }
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {
                                                    collecte.filiere_name
                                                }
                                            </p>

                                        </div>

                                        {collecte.status === "prepared" && (

                                            <span className="
                                                bg-orange-100
                                                text-orange-700
                                                px-3
                                                py-1
                                                rounded-full
                                                text-sm
                                            ">
                                                Préparée
                                            </span>

                                        )}

                                        {collecte.status === "validated" && (

                                            <span className="
                                                bg-cyan-100
                                                text-cyan-700
                                                px-3
                                                py-1
                                                rounded-full
                                                text-sm
                                            ">
                                                Validée
                                            </span>

                                        )}

                                        {collecte.status === "published" && (

                                            <span className="
                                                bg-emerald-100
                                                text-emerald-700
                                                px-3
                                                py-1
                                                rounded-full
                                                text-sm
                                            ">
                                                Publiée
                                            </span>

                                        )}

                                    </div>

                                </div>

                            ))}

                    </div>

                )}

            </div>

        </TeacherLayout>
    );
}