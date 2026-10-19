
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

export default function CollectesPage() {
    const navigate = useNavigate();

    const [collectes, setCollectes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        teacher: '',
        matiere: '',
        filiere: '',
        academic_year: '2025-2026',
        status: 'prepared',
    });

    const filteredMatieres = formData.filiere
        ? matieres.filter((matiere) =>
            Array.isArray(matiere.module_filieres) &&
            matiere.module_filieres.includes(Number(formData.filiere))
        )
        : [];

    const filteredTeachers = formData.filiere
        ? teachers.filter((teacher) =>
            (teacher.teacher_filieres || []).some(
                (filiereId) =>
                    Number(filiereId) === Number(formData.filiere)
            )
        )
        : [];

    useEffect(() => {
        fetchCollectes();
        fetchTeachers();
        fetchMatieres();
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

    const fetchCollectes = async () => {
        try {
            const response = await api.get(
                "/notes/collectes/"
            );

            setCollectes(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get(
                "/accounts/teachers/"
            );

            setTeachers(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMatieres = async () => {
        try {
            const response = await api.get(
                "/notes/matieres/"
            );

            setMatieres(response.data);
        } catch (error) {
            console.error(error);
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
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "filiere") {
                return {
                    ...prev,
                    filiere: value,
                    teacher: "",
                    matiere: "",
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const createCollecte = async (e) => {
        e.preventDefault();

        try {
            await api.post(
                "/notes/collectes/",
                formData
            );

            fetchCollectes();
            setShowModal(false);

            setSuccessMessage(
                "Collecte créée avec succès"
            );

            setErrorMessage('');
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Erreur lors de la création"
            );

            setSuccessMessage('');
        }
    };

    const validateCollecte = async (collecteId) => {
        try {
            await api.post(
                `/notes/collectes/${collecteId}/validate/`
            );

            setSuccessMessage(
                "Collecte validée avec succès"
            );

            setErrorMessage('');
            fetchCollectes();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Erreur lors de la validation"
            );

            setSuccessMessage('');
        }
    };

    const publishCollecte = async (collecteId) => {
        try {
            await api.post(
                `/notes/collectes/${collecteId}/publish/`
            );

            setSuccessMessage(
                "Collecte publiée avec succès"
            );

            setErrorMessage('');
            fetchCollectes();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Erreur lors de la publication"
            );

            setSuccessMessage('');
        }
    };

    const openRattrapage = async (collecteId) => {
        try {
            await api.post(
                `/notes/collectes/${collecteId}/open_rattrapage/`
            );

            setSuccessMessage(
                "Rattrapage ouvert avec succès"
            );

            setErrorMessage('');
            fetchCollectes();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response?.data?.error ||
                "Erreur lors de l'ouverture du rattrapage"
            );

            setSuccessMessage('');
        }
    };

    const publishRattrapage = async (collecteId) => {
        try {
            await api.post(
                `/notes/collectes/${collecteId}/publish_rattrapage/`
            );

            setSuccessMessage(
                "Rattrapage publié avec succès"
            );

            setErrorMessage('');
            fetchCollectes();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response?.data?.error ||
                "Erreur lors de la publication du rattrapage"
            );

            setSuccessMessage('');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                    Loading...
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-full space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#102c27]">
                            Collectes
                        </h1>
                        <div className="mt-2 h-1 w-14 rounded-full bg-emerald-600" />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#1b453d] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                    >
                        <span className="text-xl leading-none">+</span>
                        Créer une collecte
                    </button>
                </div>

                {successMessage && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                            ✓
                        </span>
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                            !
                        </span>
                        {errorMessage}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
                        <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                            <div className="flex items-start justify-between bg-[#102c27] px-6 py-6 text-white sm:px-8">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Créer une collecte
                                    </h2>
                                </div>

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                onSubmit={createCollecte}
                                className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8"
                            >
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Enseignant
                                    </label>
                                    <select
                                        name="teacher"
                                        value={formData.teacher}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-700 transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                        required
                                        disabled={!formData.filiere}
                                    >
                                        <option value="">
                                            {!formData.filiere
                                                ? "Sélectionnez d'abord une filière"
                                                : filteredTeachers.length === 0
                                                    ? "Aucun enseignant assigné à cette filière"
                                                    : "Sélectionner un enseignant"}
                                        </option>

                                        {filteredTeachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Matiere
                                    </label>
                                    <select
                                        name="matiere"
                                        value={formData.matiere}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-700 transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                        required
                                        disabled={!formData.filiere}
                                    >
                                        <option value="">
                                            {!formData.filiere
                                                ? "Sélectionnez d'abord une filière"
                                                : filteredMatieres.length === 0
                                                    ? "Aucune matière disponible pour cette filière"
                                                    : "Sélectionner une matière"}
                                        </option>

                                        {filteredMatieres.map((matiere) => (
                                            <option key={matiere.id} value={matiere.id}>
                                                {matiere.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Filiere
                                    </label>
                                    <select
                                        name="filiere"
                                        value={formData.filiere}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-700 transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
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
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Année universitaire
                                    </label>
                                    <input
                                        type="text"
                                        name="academic_year"
                                        value={formData.academic_year}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-700 transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                                        placeholder="Année universitaire"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-700 transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                                    >
                                        <option value="prepared">
                                            Prepared
                                        </option>

                                        <option value="validated">
                                            Validated
                                        </option>

                                        <option value="published">
                                            Published
                                        </option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="mt-2 rounded-xl bg-[#102c27] p-3 font-semibold text-white shadow-sm transition duration-200 hover:bg-[#1b453d] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:col-span-2"
                                >
                                    Créer la collecte
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                        <h2 className="font-semibold text-[#102c27]">
                            Liste des collectes
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px]">
                            <thead className="bg-[#102c27] text-white">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                       Enseignant
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Matiere
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Filiere
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Année universitaire
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {collectes.map((collecte) => (
                                    <tr
                                        key={collecte.id}
                                        className="transition-colors hover:bg-emerald-50/40"
                                    >
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {collecte.teacher_name}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {collecte.matiere_name}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {collecte.filiere_name}
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                            {collecte.academic_year}
                                        </td>

                                        <td className="px-5 py-4">
                                            {{
                                                prepared: (
                                                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                                                        Préparée
                                                    </span>
                                                ),
                                                opened: (
                                                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                                                        Ouverte
                                                    </span>
                                                ),
                                                validated: (
                                                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                                                        Validée
                                                    </span>
                                                ),
                                                published: (
                                                    <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800">
                                                        Publiée
                                                    </span>
                                                ),
                                            }[collecte.status]}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/collectes/${collecte.id}/notes`
                                                        )
                                                    }
                                                    className="whitespace-nowrap rounded-lg bg-[#102c27] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b453d] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                                                >
                                                    Gérer les notes
                                                </button>

                                                {
                                                    collecte.status !== 'validated'
                                                    &&
                                                    collecte.status !== 'published'
                                                    && (
                                                        <button
                                                            onClick={() =>
                                                                validateCollecte(
                                                                    collecte.id
                                                                )
                                                            }
                                                            className="whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                                                        >
                                                            Valider
                                                        </button>
                                                    )
                                                }

                                                {
                                                    collecte.status === 'validated' && (
                                                        <button
                                                            onClick={() =>
                                                                publishCollecte(
                                                                    collecte.id
                                                                )
                                                            }
                                                           className="whitespace-nowrap rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                                        >
                                                            Publier
                                                        </button>
                                                    )
                                                }

                                                {
                                                    collecte.status === 'published' &&
                                                    collecte.rattrapage_status === 'closed' && (
                                                        <button
                                                            onClick={() =>
                                                                openRattrapage(collecte.id)
                                                            }
                                                            className="whitespace-nowrap rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                        >
                                                            Ouvrir Rattrapage
                                                        </button>
                                                    )
                                                }

                                                {collecte.rattrapage_status === 'validated' && (
                                                    <button
                                                        onClick={() =>
                                                            publishRattrapage(collecte.id)
                                                        }
                                                        className="whitespace-nowrap rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                                    >
                                                        Publier Rattrapage
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {collectes.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            Aucune collecte
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
