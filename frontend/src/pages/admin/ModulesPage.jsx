
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
                <div>Chargement des modules...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-6">
                Modules
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
                onClick={openCreateModal}
                className="bg-black text-white px-5 py-3 rounded mb-6 hover:bg-gray-800"
            >
                + Créer un module
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg p-8 relative">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            aria-label="Fermer"
                        >
                            ×
                        </button>

                        <h2 className="text-2xl font-bold mb-6">
                            {editingId
                                ? "Modifier le module"
                                : "Créer un module"}
                        </h2>

                        <form
                            onSubmit={createModule}
                            className="flex flex-col gap-4"
                        >
                            <label className="font-medium">
                                Nom du module
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nom du module"
                                className="border p-3 rounded"
                                required
                            />

                            <label className="font-medium">
                                Semestre
                            </label>

                            <select
                                name="semestre"
                                value={formData.semestre}
                                onChange={handleChange}
                                className="border p-3 rounded"
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
                                <label className="font-medium block mb-2">
                                    Filières associées
                                </label>

                                <p className="text-sm text-gray-500 mb-3">
                                    Sélectionnez toutes les filières
                                    concernées par ce module.
                                </p>

                                {filieres.length === 0 ? (
                                    <p className="text-sm text-red-600">
                                        Aucune filière disponible.
                                    </p>
                                ) : (
                                    <div className="border rounded p-3 flex flex-col gap-3">
                                        {filieres.map((filiere) => (
                                            <label
                                                key={filiere.id}
                                                className="flex items-start gap-3 cursor-pointer"
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
                                                    className="mt-1"
                                                />

                                                <span>
                                                    <span className="font-medium">
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
                                className="bg-black text-white p-3 rounded hover:bg-gray-800 disabled:opacity-50"
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

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-4 text-left">Nom</th>
                            <th className="p-4 text-left">Semestre</th>
                            <th className="p-4 text-left">Filières</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {modules.map((module) => {
                            const codes = getFiliereNames(module);

                            return (
                                <tr key={module.id} className="border-t">
                                    <td className="p-4">
                                        {module.name}
                                    </td>

                                    <td className="p-4">
                                        S{module.semestre}
                                    </td>

                                    <td className="p-4">
                                        {codes.length > 0
                                            ? codes.join(", ")
                                            : "Non définies"}
                                    </td>

                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => editModule(module)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded"
                                            >
                                                Modifier
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(module.id)}
                                                className="bg-red-600 text-white px-3 py-1 rounded"
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
                                    className="p-6 text-center text-gray-500"
                                >
                                    Aucun module trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-lg p-8">
                        <h2 className="text-2xl font-bold mb-4">
                            Confirmation
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Voulez-vous vraiment supprimer ce module ?
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setModuleToDelete(null);
                                }}
                                className="px-5 py-2 rounded border"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={deleteModule}
                                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
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
