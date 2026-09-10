import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function DocumentsPage() {

    const [filieres, setFilieres] = useState([]);

    const [collectes, setCollectes] = useState([]);

    const [selectedFiliere, setSelectedFiliere] = useState('');

    const [selectedSemester, setSelectedSemester] = useState('');

    const [selectedYear, setSelectedYear] = useState('');

    const [loading, setLoading] = useState(true);

    const [matieres, setMatieres] = useState([]);

    const [modules, setModules] = useState([]);

    const [results, setResults] = useState([]);

    const [resultsLoading, setResultsLoading] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {

    fetchFilieres();

    fetchMatieres();

    fetchModules();

    fetchCollectes();

}, []);
useEffect(() => {

    fetchResults();

}, [
    selectedYear,
    selectedFiliere,
    selectedSemester,
    collectes,
    matieres,
    modules
]);
useEffect(() => {

    fetchStudents();

}, [selectedFiliere]);

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


const fetchModules = async () => {

    try {

        const response = await api.get(
            "/notes/modules/"
        );

        setModules(response.data);

    } catch (error) {

        console.error(error);

    }

};
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

    const fetchResults = async () => {

    if (
        !selectedYear ||
        !selectedFiliere ||
        !selectedSemester
    ) {
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

                    matiere_name:
                        collecte.matiere_name,

                    filiere_name:
                        collecte.filiere_name,

                    academic_year:
                        collecte.academic_year,

                });

            });

        }


        setResults(allResults);

    } catch (error) {

        console.error(error);

        setResults([]);

    } finally {

        setResultsLoading(false);
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
        (collecte) =>
            collecte.status === "published"
    );


    const years = [
        ...new Set(
            publishedCollectes.map(
                (collecte) =>
                    collecte.academic_year
            )
        )
    ];


    const filteredCollectes =
    publishedCollectes.filter(
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
                collecte.academic_year !==
                selectedYear
            ) {
                return false;
            }


            if (selectedSemester) {

                const matiere = matieres.find(
                    (m) =>
                        String(m.id) ===
                        String(collecte.matiere)
                );


                if (!matiere) {
                    return false;
                }


                const module = modules.find(
                    (m) =>
                        String(m.id) ===
                        String(matiere.module)
                );


                if (!module) {
                    return false;
                }


                if (
                    String(module.semestre) !==
                    String(selectedSemester)
                ) {
                    return false;
                }
            }


            return true;
        }
    );

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

                 Résultats

            </h1>
           

            <div className="bg-white rounded shadow p-6 mb-6">

                <h2 className="text-xl font-semibold mb-4">

                    PV Semestriel

                </h2>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <select
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(
                                e.target.value
                            )
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
                            setSelectedFiliere(
                                e.target.value
                            )
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


                    <select
                        value={selectedSemester}
                        onChange={(e) =>
                            setSelectedSemester(
                                e.target.value
                            )
                        }
                        className="border p-3 rounded"
                    >

                        <option value="">
                            Sélectionner un semestre
                        </option>

                        <option value="1">
                            Semestre 1
                        </option>

                        <option value="2">
                            Semestre 2
                        </option>

                        <option value="3">
                            Semestre 3
                        </option>

                        <option value="4">
                            Semestre 4
                        </option>

                        <option value="5">
                            Semestre 5
                        </option>

                        <option value="6">
                            Semestre 6
                        </option>

                    </select>

                </div>

            </div>


            <div className="bg-white rounded shadow overflow-hidden">

    <table className="w-full">

        <thead className="bg-gray-200">

            <tr>

                <th className="p-4 text-left">
                    Matricule
                </th>

                <th className="p-4 text-left">
                    Étudiant
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

            {results.map((result, index) => (

                <tr
                    key={`${result.id}-${index}`}
                    className="border-t"
                >

                    <td className="p-4">
                    {
                        students.find(
                            (student) =>
                                String(student.id) ===
                                String(result.student)
                        )?.matricule || "-"
                    }
                </td>

                    <td className="p-4">
                        {result.student_name}
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
                        {result.note_finale}
                    </td>

                </tr>

            ))}

        </tbody>

    </table>

</div>

        </AdminLayout>
    );
}