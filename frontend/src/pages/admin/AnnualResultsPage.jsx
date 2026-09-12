import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";

import { PDFViewer } from "@react-pdf/renderer";
import AcademicResultPDF from "../../components/AcademicResultPDF";

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

    const [selectedStudent, setSelectedStudent] = useState(null);


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
            const response = await api.get(
                "/notes/filieres/"
            );

            setFilieres(response.data);

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


                return true;
            }
        );


    const fetchResults = async () => {

        if (
            !selectedYear ||
            !selectedFiliere
        ) {
            setResults([]);
            return;
        }

        try {

            setResultsLoading(true);

            const allResults = [];

            for (
                const collecte of filteredCollectes
            ) {

                const response =
                    await api.get(
                        `/notes/student-notes/?collecte=${collecte.id}`
                    );

                response.data.forEach(
                    (note) => {

                        allResults.push({
                            ...note,

                            matiere_name:
                                collecte.matiere_name,

                            academic_year:
                                collecte.academic_year,

                            collecte_id:
                                collecte.id
                        });
                    }
                );
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


    const studentsResults =
        students.map((student) => {

            const studentNotes =
                results.filter(
                    (result) =>
                        String(
                            result.student
                        ) ===
                        String(student.id)
                );

            return {
                ...student,
                notes: studentNotes
            };
        });


    const subjects = [];

    filteredCollectes.forEach(
        (collecte) => {

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
        }
    );


    const getStudentAnnualPDFData = (
        student
    ) => {

        const studentNotes =
            results.filter(
                (result) =>
                    String(
                        result.student
                    ) ===
                    String(student.id)
            );


        const semestersMap = {};


        studentNotes.forEach(
            (note) => {

                const collecte =
                    filteredCollectes.find(
                        (c) =>
                            String(c.id) ===
                            String(
                                note.collecte_id
                            )
                    );


                if (!collecte) {
                    return;
                }


                const matiere =
                    matieres.find(
                        (m) =>
                            String(m.id) ===
                            String(
                                collecte.matiere
                            )
                    );


                if (!matiere) {
                    return;
                }


                const module =
                    modules.find(
                        (m) =>
                            String(m.id) ===
                            String(
                                matiere.module
                            )
                    );


                if (!module) {
                    return;
                }


                const semester =
                    String(module.semestre);


                if (
                    !semestersMap[semester]
                ) {
                    semestersMap[semester] =
                        [];
                }


                const noteFinale =
                    Number(
                        note.note_finale
                    );


                semestersMap[semester].push({

                    id: note.id,

                    name:
                        note.matiere_name,

                    controle_continu:
                        note.controle_continu ??
                        "-",

                    controle_final:
                        note.controle_final ??
                        "-",
                    rattrapage:
                        note.rattrapage ?? 0,

                    note:
                        Number.isNaN(
                            noteFinale
                        )
                            ? "-"
                            : noteFinale.toFixed(
                                  2
                              ),

                    credit:
                        matiere.credit ??
                        "-",

                    coefficient:
                        Number(
                            matiere.coefficient ||
                                0
                        ),

                    decision:
                        !Number.isNaN(
                            noteFinale
                        )
                            ? noteFinale >= 10
                                ? "Validé"
                                : "Rattrapage"
                            : "-"
                });
            }
        );


        const semesters =
            Object.keys(semestersMap)
                .sort(
                    (a, b) =>
                        Number(a) -
                        Number(b)
                )
                .map(
                    (semester) => {

                        const subjects =
                            semestersMap[
                                semester
                            ];


                        let weightedTotal =
                            0;

                        let coefficientTotal =
                            0;


                        subjects.forEach(
                            (subject) => {

                                const note =
                                    Number(
                                        subject.note
                                    );


                                if (
                                    !isNaN(note) &&
                                    subject.coefficient >
                                        0
                                ) {

                                    weightedTotal +=
                                        note *
                                        subject.coefficient;

                                    coefficientTotal +=
                                        subject.coefficient;
                                }
                            }
                        );


                        const average =
                            coefficientTotal >
                            0
                                ? (
                                      weightedTotal /
                                      coefficientTotal
                                  ).toFixed(2)
                                : "-";


                        const semesterDecision =
                            average !== "-" &&
                            Number(
                                average
                            ) >= 10
                                ? "Validé"
                                : "Rattrapage";


                        return {

                            semester,

                            subjects,

                            average,

                            decision:
                                semesterDecision
                        };
                    }
                );


        const annualAverages =
            semesters
                .map(
                    (semester) =>
                        Number(
                            semester.average
                        )
                )
                .filter(
                    (average) =>
                        !isNaN(average)
                );


        const annualAverage =
            annualAverages.length > 0
                ? (
                      annualAverages.reduce(
                          (
                              sum,
                              average
                          ) =>
                              sum +
                              average,
                          0
                      ) /
                      annualAverages.length
                  ).toFixed(2)
                : "-";

const annualDecision =
    annualAverage !== "-" &&
    Number(annualAverage) >= 10 &&
    semesters.every(
        (semester) =>
            semester.decision === "Validé"
    )
        ? "Admis"
        : "Ajourné";

        return {

            student: {
                ...student,

                filiere_name:
                    student.filiere_name ||
                    ""
            },

            academicYear:
                selectedYear,

            semesters,

            annualAverage,

            annualDecision
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
                            setSelectedYear(
                                e.target.value
                            )
                        }
                        className="border p-3 rounded"
                    >

                        <option value="">
                            Sélectionner une année
                        </option>


                        {years.map(
                            (year) => (

                                <option
                                    key={year}
                                    value={year}
                                >
                                    {year}
                                </option>

                            )
                        )}

                    </select>


                    <select
                        value={
                            selectedFiliere
                        }
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


                        {filieres.map(
                            (filiere) => (

                                <option
                                    key={filiere.id}
                                    value={
                                        filiere.id
                                    }
                                >
                                    {filiere.code}
                                </option>

                            )
                        )}

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


                                {subjects.map(
                                    (subject) => (

                                        <th
                                            key={
                                                subject.id
                                            }
                                            className="p-4 text-left"
                                        >
                                            {
                                                subject.name
                                            }
                                        </th>

                                    )
                                )}


                                <th className="p-4 text-left">
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {studentsResults.map(
                                (student) => (

                                    <tr
                                        key={
                                            student.id
                                        }
                                        className="border-t"
                                    >

                                        <td className="p-4">
                                            {
                                                student.matricule ||
                                                "-"
                                            }
                                        </td>


                                        <td className="p-4">
                                            {
                                                student.first_name
                                            }{" "}
                                            {
                                                student.last_name
                                            }
                                        </td>


                                        {subjects.map(
                                            (subject) => {

                                                const collecte =
                                                    filteredCollectes.find(
                                                        (
                                                            collecte
                                                        ) =>
                                                            String(
                                                                collecte.matiere
                                                            ) ===
                                                            String(
                                                                subject.id
                                                            )
                                                    );


                                                const note =
                                                    student.notes.find(
                                                        (
                                                            result
                                                        ) =>
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
                                                        key={
                                                            subject.id
                                                        }
                                                        className="p-4"
                                                    >

                                                        {note
                                                            ? Number(
                                                                  note.note_finale
                                                              ).toFixed(
                                                                  2
                                                              )
                                                            : "-"}

                                                    </td>

                                                );
                                            }
                                        )}


                                        <td className="p-4">

                                            <button
                                                onClick={() =>
                                                    setSelectedStudent(
                                                        getStudentAnnualPDFData(
                                                            student
                                                        )
                                                    )
                                                }
                                                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                                            >
                                                Voir PDF
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {selectedStudent && (

                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                    <div className="bg-white w-[90%] h-[90%] rounded-lg shadow-lg relative">

                        <button
                            onClick={() =>
                                setSelectedStudent(
                                    null
                                )
                            }
                            className="absolute top-3 right-3 bg-black text-white px-4 py-2 rounded-lg z-10"
                        >
                            Fermer
                        </button>


                        <PDFViewer
                            width="100%"
                            height="100%"
                        >

                            <AcademicResultPDF
                                student={
                                    selectedStudent.student
                                }

                                academicYear={
                                    selectedStudent.academicYear
                                }

                                semesters={
                                    selectedStudent.semesters
                                }

                                annualAverage={
                                    selectedStudent.annualAverage
                                }

                                annualDecision={
                                    selectedStudent.annualDecision
                                }
                            />

                        </PDFViewer>

                    </div>

                </div>

            )}

        </AdminLayout>
    );
}