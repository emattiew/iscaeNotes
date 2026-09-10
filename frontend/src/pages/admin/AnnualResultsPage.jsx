import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

export default function AnnualResultsPage() {
    const [filieres, setFilieres] = useState([]);
    const [collectes, setCollectes] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [modules, setModules] = useState([]);
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState([]);

    const [selectedYear, setSelectedYear] = useState("");
    const [selectedFiliere, setSelectedFiliere] = useState("");

    const [loading, setLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(false);

    useEffect(() => {
        fetchFilieres();
        fetchCollectes();
        fetchMatieres();
        fetchModules();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [selectedFiliere]);

    useEffect(() => {
        fetchResults();
    }, [
        selectedYear,
        selectedFiliere,
        collectes,
        matieres,
        modules
    ]);

    const fetchFilieres = async () => {
        try {
            const response = await api.get("/notes/filieres/");
            setFilieres(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCollectes = async () => {
        try {
            const response = await api.get("/notes/collectes/");
            setCollectes(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMatieres = async () => {
        try {
            const response = await api.get("/notes/matieres/");
            setMatieres(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await api.get("/notes/modules/");
            setModules(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        if (!selectedFiliere) {
            setStudents([]);
            return;
        }

        try {
            const response = await api.get(
                `/accounts/students/?filiere=${selectedFiliere}`
            );

            setStudents(response.data);
        } catch (error) {
            console.error(error);
            setStudents([]);
        }
    };

    const publishedCollectes = collectes.filter(
        (collecte) => collecte.status === "published"
    );

    const years = [
        ...new Set(
            publishedCollectes.map(
                (collecte) => collecte.academic_year
            )
        )
    ];

    const filteredCollectes = publishedCollectes.filter(
        (collecte) => {
            if (
                selectedFiliere &&
                String(collecte.filiere) !==
                    String(selectedFiliere)
            ) {
                return false;
            }

            if (
                selectedYear &&
                collecte.academic_year !== selectedYear
            ) {
                return false;
            }

            return true;
        }
    );

    const fetchResults = async () => {
        if (!selectedYear || !selectedFiliere) {
            setResults([]);
            return;
        }

        try {
            setResultsLoading(true);

            const allResults = [];

            for (const collecte of filteredCollectes) {
                const response = await api.get(
                    `/notes/student-notes/?collecte=${collecte.id}`
                );

                response.data.forEach((note) => {
                    allResults.push({
                        ...note,
                        matiere_name: collecte.matiere_name,
                        academic_year: collecte.academic_year,
                        collecte_id: collecte.id
                    });
                });
            }

            setResults(allResults);
        } catch (error) {
            console.error(
                "Erreur lors du chargement des résultats:",
                error
            );

            setResults([]);
        } finally {
            setResultsLoading(false);
        }
    };

    const studentsResults = students.map((student) => {
        const studentNotes = results.filter(
            (result) =>
                String(result.student) ===
                String(student.id)
        );

        return {
            ...student,
            notes: studentNotes
        };
    });

    const subjects = [];

    filteredCollectes.forEach((collecte) => {
        if (
            !subjects.some(
                (subject) =>
                    String(subject.id) ===
                    String(collecte.matiere)
            )
        ) {
            subjects.push({
                id: collecte.matiere,
                name: collecte.matiere_name
            });
        }
    });

    if (loading) {
        return (
            <AdminLayout>
                <div>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-6">
                Résultats annuels
            </h1>

            <div className="bg-white rounded shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    Résultats annuels
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(e.target.value)
                        }
                        className="border p-3 rounded"
                    >
                        <option value="">
                            Sélectionner une année
                        </option>

                        {years.map((year) => (
                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedFiliere}
                        onChange={(e) =>
                            setSelectedFiliere(e.target.value)
                        }
                        className="border p-3 rounded"
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
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
                {resultsLoading ? (
                    <div className="p-6">
                        Chargement des résultats...
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-4 text-left">
                                    Matricule
                                </th>

                                <th className="p-4 text-left">
                                    Étudiant
                                </th>

                                {subjects.map((subject) => (
                                    <th
                                        key={subject.id}
                                        className="p-4 text-left"
                                    >
                                        {subject.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {studentsResults.map((student) => (
                                <tr
                                    key={student.id}
                                    className="border-t"
                                >
                                    <td className="p-4">
                                        {student.matricule || "-"}
                                    </td>

                                    <td className="p-4">
                                        {student.first_name}{" "}
                                        {student.last_name}
                                    </td>

                                    {subjects.map((subject) => {
                                        const collecte =
                                            filteredCollectes.find(
                                                (collecte) =>
                                                    String(
                                                        collecte.matiere
                                                    ) ===
                                                    String(
                                                        subject.id
                                                    )
                                            );

                                        const note =
                                            student.notes.find(
                                                (result) =>
                                                    collecte &&
                                                    String(
                                                        result.collecte
                                                    ) ===
                                                        String(
                                                            collecte.id
                                                        )
                                            );

                                        return (
                                            <td
                                                key={subject.id}
                                                className="p-4"
                                            >
                                                {note
                                                    ? Number(
                                                          note.note_finale
                                                      ).toFixed(2)
                                                    : "-"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}