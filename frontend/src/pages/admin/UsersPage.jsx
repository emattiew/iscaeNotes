import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function UsersPage() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');


    const [formData, setFormData] = useState({

        username: '',

        email: '',

        password: '',

        role: 'student',

        matricule: '',
    });


    useEffect(() => {

        fetchUsers();

    }, []);


    useEffect(() => {

        if (successMessage) {

            const timer = setTimeout(() => {

                setSuccessMessage('');

            }, 2000);

            return () => clearTimeout(timer);
        }

    }, [successMessage]);


    const fetchUsers = async () => {

        try {

            const response = await api.get(
                "/accounts/users/"
            );

            setUsers(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };


    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,
        });
    };


    const createUser = async (e) => {

        e.preventDefault();

        try {

            await api.post(
                "/accounts/users/",
                formData
            );

            fetchUsers();

            setShowModal(false);

            setSuccessMessage(
                "Utilisateur créé avec succès"
            );

            setErrorMessage('');

            setFormData({

                username: '',

                email: '',

                password: '',

                role: 'student',

                matricule: '',
            });

        } catch (error) {

            console.log(error.response.data);

            setErrorMessage(
                "Erreur lors de la création"
            );

            setSuccessMessage('');
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

                Utilisateurs

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

                + Créer un utilisateur

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-2xl rounded-lg p-8 relative">

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >

                                ×

                            </button>


                            <h2 className="text-2xl font-bold mb-6">

                                Créer un utilisateur

                            </h2>


                            <form
                                onSubmit={createUser}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >

                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nom d'utilisateur"
                                    className="border p-3 rounded"
                                    required
                                />


                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="border p-3 rounded"
                                    required
                                />


                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mot de passe"
                                    className="border p-3 rounded"
                                    required
                                />


                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="border p-3 rounded"
                                >

                                    <option value="student">
                                        Étudiant
                                    </option>

                                    <option value="teacher">
                                        Enseignant
                                    </option>

                                    <option value="admin_staff">
                                        Administration
                                    </option>

                                </select>


                                <input
                                    type="text"
                                    name="matricule"
                                    value={formData.matricule}
                                    onChange={handleChange}
                                    placeholder="Matricule"
                                    className="border p-3 rounded"
                                />


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
                                Username
                            </th>

                            <th className="p-4 text-left">
                                Email
                            </th>

                            <th className="p-4 text-left">
                                Role
                            </th>

                            <th className="p-4 text-left">
                                Matricule
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr
                                key={user.id}
                                className="border-t"
                            >

                                <td className="p-4">
                                    {user.username}
                                </td>

                                <td className="p-4">
                                    {user.email}
                                </td>

                                <td className="p-4">
                                    {user.role}
                                </td>

                                <td className="p-4">
                                    {user.matricule}
                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </AdminLayout>
    );
}