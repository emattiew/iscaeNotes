import { useNavigate } from "react-router-dom";


export default function StudentLayout({ children }) {

    const navigate = useNavigate();


    const logout = () => {

        localStorage.removeItem('access');

        localStorage.removeItem('refresh');

        navigate('/');
    };


    return (

        <div className="min-h-screen bg-gray-100">

            <header className="bg-white shadow-sm border-b">

                <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-black">

                            ISCAE Student Portal

                        </h1>

                        <p className="text-gray-500 text-sm mt-1">

                            Consultation des résultats académiques

                        </p>

                    </div>


                    <button
                        onClick={logout}
                        className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                    >

                        Déconnexion

                    </button>

                </div>

            </header>


            <main className="max-w-7xl mx-auto px-8 py-10">

                {children}

            </main>

        </div>
    );
}