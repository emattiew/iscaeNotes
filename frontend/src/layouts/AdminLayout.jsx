import { Link, useNavigate } from "react-router-dom";


export default function AdminLayout({ children }) {

    const navigate = useNavigate();


    const logout = () => {

        localStorage.removeItem('access');

        localStorage.removeItem('refresh');

        navigate('/');
    };


    return (

        <div className="flex min-h-screen bg-gray-100">

            <aside className="w-64 bg-black text-white p-6 flex flex-col justify-between">

                <div>

                    <h1 className="text-2xl font-bold mb-10">

                        ISCAE Admin

                    </h1>


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
                     </nav>

                </div>


                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 p-3 rounded mt-10"
                >
                    Déconnexion
                </button>

            </aside>


            <main className="flex-1 p-8">

                {children}

            </main>

        </div>
    );
}