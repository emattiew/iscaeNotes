import { useEffect, useState } from "react";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";

import { PDFViewer } from "@react-pdf/renderer";
import AcademicResultPDF from "../../components/AcademicResultPDF";
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
    const [selectedStudent, setSelectedStudent] = useState(null);

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
const getStudentPDFData = (student) => {
    const studentNotes = results.filter(
        (result) =>
            String(result.student) === String(student.id)
    );

    const semesterSubjects = filteredCollectes
        .map((collecte) => {

            const note = studentNotes.find(
                (result) =>
                    String(result.collecte) ===
                    String(collecte.id)
            );

            if (!note) {
                return null;
            }

            const matiere = matieres.find(
                (m) =>
                    String(m.id) ===
                    String(collecte.matiere)
            );

            const noteFinale = Number(note.note_finale);

            return {
                id: note.id,
                name: collecte.matiere_name,

                controle_continu:
                    note.controle_continu ?? "-",

                controle_final:
                    note.controle_final ?? "-",

                note:
                    Number.isNaN(noteFinale)
                        ? "-"
                        : noteFinale.toFixed(2),

                credit:
                    matiere?.credit ?? "-",

                coefficient:
                    matiere?.coefficient ?? 1,

                decision:
                    !Number.isNaN(noteFinale)
                        ? noteFinale >= 10
                            ? "Validé"
                            : "Rattrapage"
                        : "-",
            };
        })
        .filter(Boolean);

    // Calcul de la moyenne du semestre
    let totalWeighted = 0;
    let totalCoefficients = 0;

    semesterSubjects.forEach((subject) => {

        if (subject.note !== "-") {

            const coefficient =
                Number(subject.coefficient) || 1;

            totalWeighted +=
                Number(subject.note) * coefficient;

            totalCoefficients += coefficient;
        }
    });

    const average =
        totalCoefficients > 0
            ? totalWeighted / totalCoefficients
            : null;

    const semesterAverage =
        average !== null
            ? average.toFixed(2)
            : "-";

    const semesterDecision =
        average !== null
            ? average >= 10
                ? "Validé"
                : "Rattrapage"
            : "-";

    return {
        student: {
            ...student,
            filiere_name:
                student.filiere_name || ""
        },

        academicYear: selectedYear,

        semesters: [
            {
                semester: selectedSemester,

                subjects: semesterSubjects,

                average: semesterAverage,

                decision: semesterDecision,
            }
        ]
    };
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


            <div className="bg-white rounded shadow overflow-x-auto">

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
                <th className="p-4 text-left">
                    Action
                </th>
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
                                className="p-4 font-semibold"
                            >

                                {note
                                    ? Number(
                                          note.note_finale
                                      ).toFixed(2)
                                    : "-"}

                            </td>

                        );

                    })}
                    <td className="p-4">
                        <button
                            onClick={() =>
                                setSelectedStudent(
                                    getStudentPDFData(student)
                                )
                            }
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                        >
                            Voir PDF
                        </button>
                    </td>
                </tr>

            ))}

        </tbody>

    </table>

</div>
            {selectedStudent && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

        <div className="bg-white w-[90%] h-[90%] rounded-lg shadow-lg relative">

            <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-3 right-3 bg-black text-white px-4 py-2 rounded-lg z-10"
            >
                Fermer
            </button>

            <PDFViewer
                width="100%"
                height="100%"
            >
                <AcademicResultPDF
                    student={selectedStudent.student}
                    academicYear={selectedStudent.academicYear}
                    semesters={selectedStudent.semesters}
                />
            </PDFViewer>

        </div>

    </div>
)}
        </AdminLayout>
    );
}