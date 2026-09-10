import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentLayout from "../../layouts/StudentLayout";

export default function StudentResultsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await api.get(
                "/notes/student-notes/"
            );

            setResults(response.data);
        } catch (error) {
            console.error(
                "Erreur lors du chargement des résultats:",
                error
            );

            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <StudentLayout>
                <div>Chargement...</div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <h1 className="text-3xl font-bold mb-6">
                Mes résultats
            </h1>

            <div className="bg-white rounded shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Résultats académiques
                </h2>

                {results.length === 0 ? (
                    <p className="text-gray-600">
                        Aucun résultat publié pour le moment.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-4 text-left">
                                        Année académique
                                    </th>

                                    <th className="p-4 text-left">
                                        Matière
                                    </th>

                                    <th className="p-4 text-left">
                                        CC
                                    </th>

                                    <th className="p-4 text-left">
                                        CF
                                    </th>

                                    <th className="p-4 text-left">
                                        Note finale
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {results.map((result) => (
                                    <tr
                                        key={result.id}
                                        className="border-t"
                                    >
                                        <td className="p-4">
                                            {result.academic_year}
                                        </td>

                                        <td className="p-4">
                                            {result.matiere_name}
                                        </td>

                                        <td className="p-4">
                                            {result.controle_continu}
                                        </td>

                                        <td className="p-4">
                                            {result.controle_final}
                                        </td>

                                        <td className="p-4 font-semibold">
                                            {Number(
                                                result.note_finale
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}