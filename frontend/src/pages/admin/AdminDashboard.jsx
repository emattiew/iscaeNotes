import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminDashboard() {

    const [stats, setStats] = useState({
        users: 0,
        collectes: 0,
        publishedCollectes: 0,
        pendingReclamations: 0,
    });

    const [collectes, setCollectes] = useState([]);
    const [reclamations, setReclamations] = useState([]);

    useEffect(() => {

        fetchStats();

    }, []);

    const fetchStats = async () => {

        try {

            const [
                usersResponse,
                collectesResponse,
                reclamationsResponse
            ] = await Promise.all([
                api.get("/accounts/users/"),
                api.get("/notes/collectes/"),
                api.get("/notes/reclamations/")
            ]);

            const collectesData =
                collectesResponse.data;

            const reclamationsData =
                reclamationsResponse.data;

            setCollectes(collectesData);
            setReclamations(reclamationsData);

            setStats({

                users:
                    usersResponse.data.length,

                collectes:
                    collectesData.length,

                publishedCollectes:
                    collectesData.filter(
                        c => c.status === "published"
                    ).length,

                pendingReclamations:
                    reclamationsData.filter(
                        r => r.status === "pending"
                    ).length,
            });

        } catch (error) {

            console.error(error);
        }
    };

    return (

        <AdminLayout>

            <div className="mb-8">

                <h1 className="text-4xl font-bold">
                    Tableau de bord
                </h1>

                <p className="text-gray-500 mt-2">
                    Vue d'ensemble de la plateforme
                </p>

            </div>

            {/* Statistiques */}

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
                        Utilisateurs
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-violet-900">
                        {stats.users}
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
                        Collectes
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-orange-900">
                        {stats.collectes}
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
                        Collectes publiées
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-emerald-900">
                        {stats.publishedCollectes}
                    </p>

                </div>

                <div
                    className="
                        bg-rose-100
                        border-l-4
                        border-rose-500
                        p-6
                        rounded-xl
                        shadow-sm
                    "
                >

                    <h2 className="text-rose-800 font-semibold">
                        Réclamations en attente
                    </h2>

                    <p className="text-4xl font-bold mt-3 text-rose-900">
                        {stats.pendingReclamations}
                    </p>

                </div>

            </div>

            {/* Actions rapides */}

            <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">

                <h2 className="text-xl font-semibold mb-4">
                    Actions rapides
                </h2>

                <div className="flex flex-wrap gap-4">

                    <Link
                        to="/admin/users"
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
                        Utilisateurs
                    </Link>

                    <Link
                        to="/admin/collectes"
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
                        Collectes
                    </Link>

                    <Link
                        to="/admin/reclamations"
                        className="
                            bg-rose-200
                            text-rose-900
                            px-5
                            py-3
                            rounded-xl
                            hover:bg-rose-300
                            transition-all
                        "
                    >
                        Réclamations
                    </Link>

                    <Link
                        to="/admin/reclamation-periods"
                        className="
                            bg-cyan-200
                            text-cyan-900
                            px-5
                            py-3
                            rounded-xl
                            hover:bg-cyan-300
                            transition-all
                        "
                    >
                        Périodes
                    </Link>

                </div>

            </div>

            {/* Contenu */}

            <div className="grid grid-cols-2 gap-6">

                {/* Dernières collectes */}

                <div className="bg-white p-6 rounded-2xl shadow-sm">

                    <h2 className="text-xl font-semibold mb-4">
                        Dernières collectes
                    </h2>

                    <div className="space-y-4">

                        {
                            collectes
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

                                        <p className="font-medium">
                                            {
                                                collecte.matiere_name
                                            }
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {
                                                collecte.status
                                            }
                                        </p>

                                    </div>
                                ))
                        }

                    </div>

                </div>

                {/* Réclamations récentes */}

                <div className="bg-white p-6 rounded-2xl shadow-sm">

                    <h2 className="text-xl font-semibold mb-4">
                        Réclamations récentes
                    </h2>

                    <div className="space-y-4">

                        {
                            reclamations
                                .slice(0, 5)
                                .map((reclamation) => (

                                    <div
                                        key={reclamation.id}
                                        className="
                                            border-b
                                            border-gray-100
                                            pb-3
                                        "
                                    >

                                        <p className="font-medium">
                                            {
                                                reclamation.student_name
                                            }
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {
                                                reclamation.matiere_name
                                            }
                                        </p>

                                    </div>
                                ))
                        }

                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}