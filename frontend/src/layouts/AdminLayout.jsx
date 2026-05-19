import { Link } from "react-router-dom";


export default function AdminLayout({ children }) {

    return (

        <div className="flex min-h-screen bg-gray-100">

            <aside className="w-64 bg-black text-white p-6">

                <h1 className="text-2xl font-bold mb-10">

                    ISCAE Admin

                </h1>


                <nav className="flex flex-col gap-4">

                    <Link
                        to="/admin/dashboard"
                        className="hover:text-gray-300"
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/admin/collectes"
                        className="hover:text-gray-300"
                    >
                        Collectes
                    </Link>

                    <Link
                        to="/admin/student-notes"
                        className="hover:text-gray-300"
                    >
                        Student Notes
                    </Link>

                </nav>

            </aside>


            <main className="flex-1 p-8">

                {children}

            </main>

        </div>
    );
}