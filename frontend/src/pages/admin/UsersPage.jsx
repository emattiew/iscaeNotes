import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function UsersPage() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    const [filieres, setFilieres] = useState([]);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [userToDelete, setUserToDelete] = useState(null);


    const [formData, setFormData] = useState({

        username: '',

        first_name: '',

        last_name: '',

        email: '',

        password: '',

        role: 'student',

        matricule: '',

        filiere: '',
    });


    useEffect(() => {

        fetchUsers();

        fetchFilieres();

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


    const fetchFilieres = async () => {

        try {

            const response = await api.get(
                "/notes/filieres/"
            );

            setFilieres(response.data);

        } catch (error) {

            console.error(error);
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

                first_name: '',

                last_name: '',

                email: '',

                password: '',

                role: 'student',

                matricule: '',

                filiere: '',
            });

        } catch (error) {

            console.log(error.response.data);

            setErrorMessage(
                "Erreur lors de la création"
            );

            setSuccessMessage('');
        }
    };


    const updateUser = async (e) => {

        e.preventDefault();

        try {

            await api.put(
                `/accounts/users/${editingUser.id}/`,
                formData
            );

            fetchUsers();

            setShowModal(false);

            setEditingUser(null);
            setFormData({

                username: '',

                first_name: '',

                last_name: '',

                email: '',

                password: '',

                role: 'student',

                matricule: '',

                filiere: '',
            });
            setSuccessMessage(
                "Utilisateur modifié avec succès"
            );

            setErrorMessage('');

        } catch (error) {

            console.log(error.response.data);

            console.error(error);

            setErrorMessage(
                "Erreur lors de la modification"
            );
        }
    };


    const openDeleteModal = (id) => {

        setUserToDelete(id);

        setShowDeleteModal(true);
    };


    const deleteUser = async () => {

        try {

            await api.delete(
                `/accounts/users/${userToDelete}/`
            );

            fetchUsers();

            setSuccessMessage(
                "Utilisateur supprimé avec succès"
            );

            setShowDeleteModal(false);

            setUserToDelete(null);

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la suppression"
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
                onClick={() => {

                    setEditingUser(null);

                    setFormData({

                        username: '',
                        
                        first_name: '',

                        last_name: '',
                        email: '',

                        password: '',

                        role: 'student',

                        matricule: '',

                        filiere: '',
                    });

                    setShowModal(true);
                }}
                className="bg-black text-white px-5 py-3 rounded mb-6 hover:bg-gray-800"
            >

                + Créer un utilisateur

            </button>


            {
                showModal && (

                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-2xl rounded-lg p-8 relative">

                            <button
                                onClick={() => {

                                    setShowModal(false);

                                    setEditingUser(null);
                                }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >

                                ×

                            </button>


                            <h2 className="text-2xl font-bold mb-6">

                                {
                                    editingUser
                                        ? "Modifier utilisateur"
                                        : "Créer un utilisateur"
                                }

                            </h2>


                            <form
                                onSubmit={
                                    editingUser
                                        ? updateUser
                                        : createUser
                                }
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
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Prénom"
                                    className="border p-3 rounded"
                                />

                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Nom"
                                    className="border p-3 rounded"
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
                                    placeholder={
                                        editingUser
                                            ? "Laisser vide pour ne pas changer"
                                            : "Mot de passe"
                                    }
                                    className="border p-3 rounded"
                                    required={!editingUser}
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


                                {
                                    formData.role === 'student' && (

                                        <select
                                            name="filiere"
                                            value={formData.filiere}
                                            onChange={handleChange}
                                            className="border p-3 rounded"
                                            required
                                        >

                                            <option value="">

                                                Sélectionner une filière

                                            </option>

                                            {filieres.map((filiere) => (

                                                <option
                                                    key={filiere.id}
                                                    value={filiere.id}
                                                >

                                                    {filiere.code}

                                                </option>
                                            ))}

                                        </select>
                                    )
                                }


                                <button
                                    type="submit"
                                    className="bg-black text-white p-3 rounded hover:bg-gray-800"
                                >

                                    {
                                        editingUser
                                            ? "Modifier"
                                            : "Créer"
                                    }

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
                                Prénom
                            </th>

                            <th className="p-4 text-left">
                                Nom
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

                            <th className="p-4 text-left">
                                Filière
                            </th>

                            <th className="p-4 text-left">
                                Actions
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
                                    {user.first_name}
                                </td>

                                <td className="p-4">
                                    {user.last_name}
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

                                <td className="p-4">
                                    {user.filiere_name}
                                </td>

                                <td className="p-4 flex gap-2">

                                    <button
                                        onClick={() => {

                                            setEditingUser(user);

                                            setFormData({

                                                username: user.username,

                                                first_name: user.first_name || '',

                                                last_name: user.last_name || '',

                                                email: user.email,

                                                password: '',

                                                role: user.role,

                                                matricule: user.matricule || '',

                                                filiere: user.filiere || '',
                                            });
                                            setShowModal(true);
                                        }}
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                    >

                                        Modifier

                                    </button>


                                    <button
                                        onClick={() =>
                                            openDeleteModal(user.id)
                                        }
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >

                                        Supprimer

                                    </button>

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>


            {
                showDeleteModal && (

                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

                        <div className="bg-white w-full max-w-md rounded-lg p-8">

                            <h2 className="text-2xl font-bold mb-4">

                                Confirmation

                            </h2>

                            <p className="text-gray-600 mb-6">

                                Voulez-vous vraiment supprimer cet utilisateur ?

                            </p>

                            <div className="flex justify-end gap-4">

                                <button
                                    onClick={() => {

                                        setShowDeleteModal(false);

                                        setUserToDelete(null);
                                    }}
                                    className="px-5 py-2 rounded border"
                                >

                                    Annuler

                                </button>


                                <button
                                    onClick={deleteUser}
                                    className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
                                >

                                    Supprimer

                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

        </AdminLayout>
    );
}