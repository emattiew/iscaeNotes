import { Link, useNavigate } from "react-router-dom";


import logo from "../assets/logo-iscae.png";
export default function AdminLayout({ children }) {

    const navigate = useNavigate();


    const logout = () => {

        localStorage.removeItem('access');

        localStorage.removeItem('refresh');

        localStorage.removeItem('role');

        navigate('/');
    };


    return (

        <div className="min-h-screen bg-gray-100">

            <aside className="fixed left-0 top-0 h-screen w-64 bg-black text-white p-6 flex flex-col justify-between">

                <div>

                    <div className="flex flex-col items-center mb-10">

                    <img
                        src={logo}
                        alt="ISCAE"
                        className="w-20 h-20 object-contain mb-3"
                    />

                    <h1 className="text-xl font-bold text-center">
                        Administration
                    </h1>

                </div>


                    <nav className="flex flex-col gap-4">

                        <Link
                            to="/admin/dashboard"
                            className="hover:text-gray-300"
                        >
                            Tableau de bord
                        </Link>

                        <Link
                            to="/admin/collectes"
                            className="hover:text-gray-300"
                        >
                            Collectes
                        </Link>

                        <Link
                            to="/admin/users"
                            className="hover:text-gray-300"
                        >
                            Utilisateurs
                        </Link>

                        <Link
                            to="/admin/filieres"
                            className="hover:text-gray-300"
                        >
                            Filières
                        </Link>

                        <Link
                            to="/admin/modules"
                            className="hover:text-gray-300"
                        >
                            Modules
                        </Link>

                        <Link
                            to="/admin/matieres"
                            className="hover:text-gray-300"
                        >
                            Matières
                        </Link>

                        <Link
                            to="/admin/reclamation-periods"
                            className="hover:text-gray-300"
                        >
                            Périodes de réclamation
                        </Link>
                                                <Link
                            to="/admin/reclamations"
                            className="hover:text-gray-300"
                        >
                            Réclamations
                        </Link>

                    </nav>

                </div>


                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 p-3 rounded"
                >
                    Déconnexion
                </button>

            </aside>


            <main className="ml-64 p-8">

                {children}

            </main>

        </div>
    );
}