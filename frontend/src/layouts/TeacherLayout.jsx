import { Link, useNavigate } from "react-router-dom";


export default function TeacherLayout({ children }) {

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

                    <h1 className="text-2xl font-bold mb-10">

                        ISCAE Teacher

                    </h1>


                    <nav className="flex flex-col gap-4">

                        <Link
                            to="/teacher/dashboard"
                            className="hover:text-gray-300"
                        >
                            Tableau de bord
                        </Link>


                        <Link
                            to="/teacher/collectes"
                            className="hover:text-gray-300"
                        >
                            Mes collectes
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