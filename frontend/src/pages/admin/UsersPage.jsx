import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";
import { Search } from "lucide-react";

export default function UsersPage() {

    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchMatricule, setSearchMatricule] = useState('');

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    const [isImporting, setIsImporting] = useState(false);

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

        niveau: '',

        teacher_filieres: [],
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

                niveau: '',

                teacher_filieres: [],
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

                niveau: '',

                teacher_filieres: [],
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

    const handleImport = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setIsImporting(true);

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    try {

        const response = await api.post(
            "/accounts/students/import/",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data"
                }
            }
        );

        fetchUsers();

        e.target.value = '';

        setSuccessMessage(
            `${response.data.created} étudiants importés, ${response.data.skipped.length} ignorés`
        );

        setErrorMessage('');

        } catch (error) {

        console.error(error);

        setErrorMessage(
            "Erreur lors de l'import"
        );
    } finally {

        setIsImporting(false);
    }
};
    if (loading) {

        return (

            <AdminLayout>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        Chargement des utilisateurs...
                    </div>
                </div>
            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <h1 className="mb-7 text-3xl font-bold tracking-tight text-[#102c27]">

                Utilisateurs

            </h1>


            {successMessage && (

                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 font-medium text-emerald-800 shadow-sm">

                    {successMessage}

                </div>
            )}


            {errorMessage && (

                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 font-medium text-rose-800 shadow-sm">

                    {errorMessage}

                </div>
            )}


            <div className="mb-6 flex flex-wrap gap-3">

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
                            niveau: '',
                            teacher_filieres: [],
                           
                        });

                        setShowModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#1b443b] focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >

                    + Créer un utilisateur

                </button>


                <label
                    className={`inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 ${
                        isImporting ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                >
                    {isImporting ? "Importation..." : "Importer Excel"}

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        hidden
                        onChange={handleImport}
                        disabled={isImporting}
                    />
                </label>

            </div>


            {
                showModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

                        <div className="relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">

                            <button
                                onClick={() => {

                                    setShowModal(false);

                                    setEditingUser(null);
                                }}
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
                            >

                                ×

                            </button>


                            <h2 className="mb-6 text-2xl font-bold tracking-tight text-[#102c27]">

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
                                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                            >

                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nom d'utilisateur"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                    required
                                />
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Prénom"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                />

                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Nom"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                    required
                                />


                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={
                                        editingUser
                                            ? "Nouveau mot de passe"
                                            : "Mot de passe"
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                    required={!editingUser}
                                />


                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
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


                                {
                                    formData.role === 'student' && (
                                        <>
                                            <input
                                                type="text"
                                                name="matricule"
                                                value={formData.matricule}
                                                onChange={handleChange}
                                                placeholder="Matricule"
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                            />

                                            <select
                                                name="filiere"
                                                value={formData.filiere}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
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

                                            <select
                                                name="niveau"
                                                value={formData.niveau}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                                required
                                            >
                                                <option value="">
                                                    Sélectionner un niveau
                                                </option>

                                                <option value="L1">L1</option>
                                                <option value="L2">L2</option>
                                                <option value="L3">L3</option>
                                            </select>
                                        </>
                                    )
                                    
                                }
                                
                                {formData.role === 'teacher' && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2">
                                        <p className="mb-3 font-semibold text-[#102c27]">
                                            Filières de l'enseignant
                                        </p>

                                        {filieres.length === 0 ? (
                                            <p className="text-sm text-slate-500">
                                                Aucune filière disponible.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {filieres.map((filiere) => (
                                                    <label
                                                        key={filiere.id}
                                                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-slate-300 accent-emerald-700 focus:ring-emerald-600"
                                                            checked={formData.teacher_filieres.includes(
                                                                Number(filiere.id)
                                                            )}
                                                            onChange={(e) => {
                                                                const selected = formData.teacher_filieres;
                                                                const filiereId = Number(filiere.id);

                                                                setFormData({
                                                                    ...formData,
                                                                    teacher_filieres: e.target.checked
                                                                        ? [...selected, filiereId]
                                                                        : selected.filter((id) => Number(id) !== filiereId),
                                                                });
                                                            }}
                                                        />
                                                        <span>{filiere.code}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#102c27] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#1b443b] focus:outline-none focus:ring-4 focus:ring-emerald-100 md:col-span-2"
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                >
                    <option value="all">Tous les utilisateurs</option>
                    <option value="teacher">Enseignants uniquement</option>
                    <option value="admin_staff">Administration uniquement</option>
                    <option value="student">Étudiants uniquement</option>
                </select>
            </div>
            <div className="relative mb-5 w-full max-w-md">
                <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={searchMatricule}
                    onChange={(e) => setSearchMatricule(e.target.value)}
                    placeholder="Rechercher par matricule"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">

                <table className="w-full min-w-[1050px] text-left">

                    <thead className="bg-[#102c27] text-white">

                        <tr>

                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Utilisateur
                            </th>
                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Prénom
                            </th>

                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Nom
                            </th>
                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Email
                            </th>

                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Role
                            </th>

                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Matricule
                            </th>

                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Filière
                            </th>
                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Niveau
                            </th>
                            <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-white/90">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {users
                            .filter((user) =>
                                roleFilter === "all" || user.role === roleFilter
                            )
                            .filter((user) =>
                                (user.matricule || "")
                                    .toLowerCase()
                                    .includes(searchMatricule.toLowerCase())
                            )
                            .map((user) => (

                            <tr
                                key={user.id}
                                className="border-t border-slate-100 transition hover:bg-emerald-50/40"
                            >

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {user.username}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {user.first_name}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {user.last_name}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {user.email}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {{
                                        student: "Étudiant",
                                        teacher: "Enseignant",
                                        admin_staff: "Administration",
                                    }[user.role]}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {user.matricule}
                                </td>

                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {user.role === "teacher"
                                        ? (user.teacher_filieres || [])
                                            .map((id) => {
                                                const filiere = filieres.find(
                                                    (f) => Number(f.id) === Number(id)
                                                );
                                                return filiere?.code;
                                            })
                                            .filter(Boolean)
                                            .join(", ") || "Aucune filière"
                                        : user.filiere_name || "-"}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600">
                                    {user.niveau}
                                </td>
                                <td className="flex gap-2 whitespace-nowrap px-4 py-4">

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
                                                niveau: user.niveau || '',
                                                teacher_filieres: (user.teacher_filieres || []).map(Number),
                                            });
                                            setShowModal(true);
                                        }}
                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                    >

                                        Modifier

                                    </button>


                                    <button
                                        onClick={() =>
                                            openDeleteModal(user.id)
                                        }
                                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
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

                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

                        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">

                            <h2 className="mb-4 text-2xl font-bold tracking-tight text-[#102c27]">

                                Confirmation

                            </h2>

                            <p className="mb-6 text-sm leading-6 text-slate-600">

                                Voulez-vous vraiment supprimer cet utilisateur ?

                            </p>

                            <div className="flex justify-end gap-3">

                                <button
                                    onClick={() => {

                                        setShowDeleteModal(false);

                                        setUserToDelete(null);
                                    }}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >

                                    Annuler

                                </button>


                                <button
                                    onClick={deleteUser}
                                    className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
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