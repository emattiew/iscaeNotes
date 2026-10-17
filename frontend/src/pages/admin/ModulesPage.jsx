
import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

const emptyForm = () => ({
    name: "",
    semestre: "",
    filieres: [],
});

const getErrorMessage = (error) => {
    const data = error.response?.data;

    if (typeof data === "string") {
        return data;
    }

    if (data && typeof data === "object") {
        return Object.entries(data)
            .map(([key, value]) => {
                const message = Array.isArray(value)
                    ? value.join(", ")
                    : typeof value === "string"
                        ? value
                        : JSON.stringify(value);

                return `${key}: ${message}`;
            })
            .join(" | ");
    }

    return "Une erreur est survenue. Veuillez réessayer.";
};

export default function ModulesPage() {
    const [modules, setModules] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState(null);

    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        fetchModules();
        fetchFilieres();
    }, []);

    useEffect(() => {
        if (!successMessage) return;

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    const fetchModules = async () => {
        try {
            const response = await api.get("/notes/modules/");
            setModules(response.data);
        } catch (error) {
            console.error("Erreur chargement modules :", error);
            setErrorMessage(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const fetchFilieres = async () => {
        try {
            const response = await api.get("/notes/filieres/");
            setFilieres(response.data);
        } catch (error) {
            console.error("Erreur chargement filières :", error);
            setErrorMessage(
                "Impossible de charger les filières. Vérifiez l'API."
            );
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleFiliereChange = (filiereId, checked) => {
        setFormData((previous) => {
            const selected = previous.filieres.map(Number);

            return {
                ...previous,
                filieres: checked
                    ? [...new Set([...selected, Number(filiereId)])]
                    : selected.filter(
                        (id) => id !== Number(filiereId)
                    ),
            };
        });
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData(emptyForm());
        setErrorMessage("");
        setShowModal(true);
    };

    const editModule = (module) => {
        setEditingId(module.id);

        setFormData({
            name: module.name,
            semestre: String(module.semestre),
            filieres: (module.filieres || []).map(Number),
        });

        setErrorMessage("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(emptyForm());
        setErrorMessage("");
    };

    const openDeleteModal = (id) => {
        setModuleToDelete(id);
        setErrorMessage("");
        setShowDeleteModal(true);
    };

    const deleteModule = async () => {
        try {
            await api.delete(`/notes/modules/${moduleToDelete}/`);

            setShowDeleteModal(false);
            setModuleToDelete(null);
            setSuccessMessage("Module supprimé avec succès");
            setErrorMessage("");

            await fetchModules();
        } catch (error) {
            console.error("Erreur suppression module :", error);
            setErrorMessage(getErrorMessage(error));
            setShowDeleteModal(false);
        }
    };

    const createModule = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage("");

        const payload = {
            name: formData.name.trim(),
            semestre: Number(formData.semestre),
            filieres: formData.filieres.map(Number),
        };

        try {
            if (editingId) {
                await api.put(
                    `/notes/modules/${editingId}/`,
                    payload
                );

                setSuccessMessage("Module modifié avec succès");
            } else {
                await api.post("/notes/modules/", payload);

                setSuccessMessage("Module créé avec succès");
            }

            closeModal();
            await fetchModules();
        } catch (error) {
            console.error("Erreur enregistrement module :", error);
            setErrorMessage(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const getFiliereNames = (module) => {
        const ids = (module.filieres || []).map(Number);

        return filieres
            .filter((filiere) => ids.includes(Number(filiere.id)))
            .map((filiere) => filiere.code);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex min-h-[40vh] items-center justify-center"><div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-6 py-5 shadow-sm"><span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" /><span className="text-sm font-medium text-slate-600">Chargement des modules...</span></div></div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <h1 className="mb-7 text-3xl font-bold tracking-tight text-[#102c27]">
                Modules
            </h1>

            {successMessage && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 shadow-sm">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-medium text-rose-700 shadow-sm">
                    {errorMessage}
                </div>
            )}

            <button
                onClick={openCreateModal}
                className="mb-6 inline-flex items-center gap-2 rounded-xl bg-[#102c27] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#19463d] focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
                + Créer un module
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="relative my-6 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            aria-label="Fermer"
                        >
                            ×
                        </button>

                        <h2 className="mb-6 pr-10 text-2xl font-bold tracking-tight text-[#102c27]">
                            {editingId
                                ? "Modifier le module"
                                : "Créer un module"}
                        </h2>

                        <form
                            onSubmit={createModule}
                            className="flex flex-col gap-4"
                        >
                            <label className="text-sm font-semibold text-slate-700">
                                Nom du module
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nom du module"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50"
                                required
                            />

                            <label className="text-sm font-semibold text-slate-700">
                                Semestre
                            </label>

                            <select
                                name="semestre"
                                value={formData.semestre}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50"
                                required
                            >
                                <option value="">
                                    Sélectionner un semestre
                                </option>
                                {[1, 2, 3, 4, 5, 6].map((semestre) => (
                                    <option
                                        key={semestre}
                                        value={semestre}
                                    >
                                        S{semestre}
                                    </option>
                                ))}
                            </select>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Filières associées
                                </label>

                                <p className="mb-3 text-sm text-slate-500">
                                    Sélectionnez toutes les filières
                                    concernées par ce module.
                                </p>

                                {filieres.length === 0 ? (
                                    <p className="text-sm font-medium text-rose-600">
                                        Aucune filière disponible.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                                        {filieres.map((filiere) => (
                                            <label
                                                key={filiere.id}
                                                className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-emerald-50/70"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.filieres
                                                        .map(Number)
                                                        .includes(Number(filiere.id))}
                                                    onChange={(e) =>
                                                        handleFiliereChange(
                                                            filiere.id,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="mt-1 h-4 w-4 accent-emerald-700 focus:ring-emerald-600"
                                                />

                                                <span>
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {filiere.code}
                                                    </span>
                                                    {" — "}
                                                    {filiere.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-1 w-full rounded-xl bg-[#102c27] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#19463d] focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Enregistrement..."
                                    : editingId
                                        ? "Modifier"
                                        : "Créer"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <table className="w-full min-w-[680px] text-left">
                    <thead className="bg-[#102c27] text-white">
                        <tr>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/90">Nom</th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/90">Semestre</th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/90">Filières</th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/90">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {modules.map((module) => {
                            const codes = getFiliereNames(module);

                            return (
                                <tr key={module.id} className="border-t border-slate-100 transition-colors hover:bg-emerald-50/40">
                                    <td className="px-5 py-4 text-sm text-slate-700">
                                        {module.name}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-700">
                                        S{module.semestre}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-700">
                                        {codes.length > 0
                                            ? codes.join(", ")
                                            : "Non définies"}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-700">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => editModule(module)}
                                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                            >
                                                Modifier
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(module.id)}
                                                className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {modules.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-12 text-center text-sm text-slate-500"
                                >
                                    Aucun module trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
                        <h2 className="mb-4 text-2xl font-bold tracking-tight text-[#102c27]">
                            Confirmation
                        </h2>

                        <p className="mb-6 text-sm leading-6 text-slate-600">
                            Voulez-vous vraiment supprimer ce module ?
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setModuleToDelete(null);
                                }}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={deleteModule}
                                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
