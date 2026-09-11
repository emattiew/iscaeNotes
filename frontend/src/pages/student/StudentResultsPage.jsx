import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentLayout from "../../layouts/StudentLayout";

import { PDFViewer } from "@react-pdf/renderer";
import AcademicResultPDF from "../../components/AcademicResultPDF";

export default function StudentResultsPage() {
    const [results, setResults] = useState([]);
    const [student, setStudent] = useState(null);

    const [selectedPDF, setSelectedPDF] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [
                resultsResponse,
                profileResponse
            ] = await Promise.all([
                api.get("/notes/student-notes/"),
                api.get("/accounts/profile/")
            ]);

            console.log(
                "Student results:",
                resultsResponse.data
            );

            setResults(resultsResponse.data);
            setStudent(profileResponse.data);
        } catch (error) {
            console.error(
                "Erreur lors du chargement des résultats :",
                error
            );

            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    /*
     * Group results by academic year
     * and then by semester.
     */
    const groupedResults = {};

    results.forEach((result) => {
        const year = result.academic_year;
        const semester = result.semester;

        if (
            !year ||
            semester === null ||
            semester === undefined
        ) {
            return;
        }

        if (!groupedResults[year]) {
            groupedResults[year] = {};
        }

        const semesterKey = String(semester);

        if (!groupedResults[year][semesterKey]) {
            groupedResults[year][semesterKey] = [];
        }

        groupedResults[year][semesterKey].push(result);
    });

    /*
     * Academic years.
     * Most recent year first.
     */
    const academicYears = Object.keys(
        groupedResults
    ).sort((a, b) => b.localeCompare(a));

    /*
     * Subject decision.
     */
    const getSubjectDecision = (note) => {
        const value = Number(note);

        if (Number.isNaN(value)) {
            return "-";
        }

        return value >= 10
            ? "Validé"
            : "Rattrapage";
    };

    /*
     * Calculate semester average.
     *
     * For now we keep the same simple average
     * used in the existing PDF.
     */
    const calculateAverage = (
        semesterResults
    ) => {
        if (!semesterResults.length) {
            return "-";
        }

        const total =
            semesterResults.reduce(
                (sum, result) =>
                    sum +
                    Number(
                        result.note_finale || 0
                    ),
                0
            );

        return (
            total /
            semesterResults.length
        ).toFixed(2);
    };

    /*
     * Build the data expected by AcademicResultPDF.
     */
    const buildSemesterData = (
        semester,
        semesterResults
    ) => {
        const subjects =
            semesterResults.map(
                (result) => ({
                    id: result.id,

                    name:
                        result.matiere_name,

                    controle_continu:
                        result.controle_continu ??
                        "-",

                    controle_final:
                        result.controle_final ??
                        "-",

                    note:
                        Number(
                            result.note_finale
                        ).toFixed(2),

                    /*
                     * IMPORTANT:
                     * Credit now comes directly
                     * from StudentNoteSerializer.
                     */
                    credit:
                        result.credit ??
                        "-",

                    decision:
                        getSubjectDecision(
                            result.note_finale
                        )
                })
            );

        const average =
            calculateAverage(
                semesterResults
            );

        const decision =
            average !== "-" &&
            Number(average) >= 10
                ? "Validé"
                : "Rattrapage";

        return {
            semester,
            subjects,
            average,
            decision
        };
    };

    /*
     * Open one semester PDF.
     */
    const openSemesterPDF = (
        academicYear,
        semester
    ) => {
        if (!student) {
            return;
        }

        const semesterResults =
            groupedResults[
                academicYear
            ]?.[semester] || [];

        if (!semesterResults.length) {
            return;
        }

        const semesterData =
            buildSemesterData(
                semester,
                semesterResults
            );

        setSelectedPDF({
            student: {
                ...student,
                filiere_name:
                    student.filiere_name || ""
            },

            academicYear,

            semesters: [
                semesterData
            ],

            /*
             * The existing PDF component requires
             * these values. For a semester PDF,
             * we use the semester result.
             */
            annualAverage:
                semesterData.average,

            annualDecision:
                semesterData.decision
        });
    };

    /*
     * Open the annual PDF.
     */
    const openAnnualPDF = (
        academicYear
    ) => {
        if (!student) {
            return;
        }

        const yearResults =
            groupedResults[
                academicYear
            ];

        if (!yearResults) {
            return;
        }

        const semesterKeys =
            Object.keys(
                yearResults
            ).sort(
                (a, b) =>
                    Number(a) -
                    Number(b)
            );

        const semesters =
            semesterKeys.map(
                (semester) =>
                    buildSemesterData(
                        semester,
                        yearResults[
                            semester
                        ]
                    )
            );

        if (!semesters.length) {
            return;
        }

        /*
         * Calculate annual average from
         * the semester averages.
         */
        const validAverages =
            semesters
                .map(
                    (semester) =>
                        Number(
                            semester.average
                        )
                )
                .filter(
                    (average) =>
                        !Number.isNaN(
                            average
                        )
                );

        const annualAverage =
            validAverages.length
                ? (
                    validAverages.reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    ) /
                    validAverages.length
                ).toFixed(2)
                : "-";

        /*
         * Annual decision.
         */
        const annualDecision =
            annualAverage !== "-" &&
            Number(
                annualAverage
            ) >= 10 &&
            semesters.every(
                (semester) =>
                    semester.decision ===
                    "Validé"
            )
                ? "Admis"
                : "Ajourné";

        setSelectedPDF({
            student: {
                ...student,
                filiere_name:
                    student.filiere_name || ""
            },

            academicYear,

            semesters,

            annualAverage,

            annualDecision
        });
    };

    if (loading) {
        return (
            <StudentLayout>
                <div>
                    Chargement...
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <h1 className="text-3xl font-bold mb-6">
                Mes résultats
            </h1>

            {academicYears.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8">
                    <p className="text-gray-600">
                        Aucun résultat publié pour le moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {academicYears.map(
                        (academicYear) => {
                            const semesterKeys =
                                Object.keys(
                                    groupedResults[
                                        academicYear
                                    ]
                                ).sort(
                                    (a, b) =>
                                        Number(a) -
                                        Number(b)
                                );

                            return (
                                <div
                                    key={
                                        academicYear
                                    }
                                    className="bg-white rounded-lg shadow p-6"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-xl font-semibold">
                                            Année académique{" "}
                                            {
                                                academicYear
                                            }
                                        </h2>

                                        <button
                                            onClick={() =>
                                                openAnnualPDF(
                                                    academicYear
                                                )
                                            }
                                            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                                        >
                                            Relevé annuel
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {semesterKeys.map(
                                            (
                                                semester
                                            ) => (
                                                <div
                                                    key={
                                                        semester
                                                    }
                                                    className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                                                >
                                                    <div>
                                                        <h3 className="font-medium">
                                                            Semestre{" "}
                                                            {
                                                                semester
                                                            }
                                                        </h3>

                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Relevé de notes du semestre
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            openSemesterPDF(
                                                                academicYear,
                                                                semester
                                                            )
                                                        }
                                                        className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                                                    >
                                                        Voir le PDF
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            )}

            {selectedPDF && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] h-[90%] rounded-lg shadow-lg relative">
                        <button
                            onClick={() =>
                                setSelectedPDF(null)
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
                                    selectedPDF.student
                                }
                                academicYear={
                                    selectedPDF.academicYear
                                }
                                semesters={
                                    selectedPDF.semesters
                                }
                                annualAverage={
                                    selectedPDF.annualAverage
                                }
                                annualDecision={
                                    selectedPDF.annualDecision
                                }
                            />
                        </PDFViewer>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}