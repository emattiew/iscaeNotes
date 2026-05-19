import AdminLayout from "../../layouts/AdminLayout";


export default function AdminDashboard() {

    return (

        <AdminLayout>

            <h1 className="text-4xl font-bold mb-6">

                Admin Dashboard

            </h1>


            <div className="grid grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded shadow">

                    <h2 className="text-gray-500">

                        Total Collectes

                    </h2>

                    <p className="text-3xl font-bold mt-2">

                        1

                    </p>

                </div>


                <div className="bg-white p-6 rounded shadow">

                    <h2 className="text-gray-500">

                        Total Students

                    </h2>

                    <p className="text-3xl font-bold mt-2">

                        1

                    </p>

                </div>


                <div className="bg-white p-6 rounded shadow">

                    <h2 className="text-gray-500">

                        Published Results

                    </h2>

                    <p className="text-3xl font-bold mt-2">

                        0

                    </p>

                </div>

            </div>

        </AdminLayout>
    );
}