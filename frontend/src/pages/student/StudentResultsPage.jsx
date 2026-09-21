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
     * Determine the academic level from
     * the semester number.
     *
     * S1 + S2 -> L1
     * S3 + S4 -> L2
     * S5 + S6 -> L3
     */
    const getAcademicLevel = (semester) => {
        const semesterNumber = Number(semester);

        if (
            semesterNumber === 1 ||
            semesterNumber === 2
        ) {
            return "L1";
        }

        if (
            semesterNumber === 3 ||
            semesterNumber === 4
        ) {
            return "L2";
        }

        if (
            semesterNumber === 5 ||
            semesterNumber === 6
        ) {
            return "L3";
        }

        return null;
    };

    /*
     * Group results by academic level
     * and then by semester.
     *
     * Academic year is NOT used as the
     * primary grouping key.
     *
     * The actual academic year remains
     * attached to each result.
     */
    const groupedResults = {
        L1: {},
        L2: {},
        L3: {}
    };

    results.forEach((result) => {
        const semester = result.semester;

        if (
            semester === null ||
            semester === undefined
        ) {
            return;
        }

        const semesterNumber = Number(semester);

        const academicLevel =
            getAcademicLevel(semesterNumber);

        if (!academicLevel) {
            return;
        }

        const semesterKey =
            String(semesterNumber);

        if (
            !groupedResults[academicLevel][
                semesterKey
            ]
        ) {
            groupedResults[academicLevel][
                semesterKey
            ] = [];
        }

        groupedResults[academicLevel][
            semesterKey
        ].push(result);
    });

    /*
     * Only display academic levels that
     * actually contain results.
     */
    const academicLevels = [
        "L1",
        "L2",
        "L3"
    ].filter(
        (academicLevel) =>
            Object.keys(
                groupedResults[academicLevel]
            ).length > 0
    );

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
                     * Credit comes directly
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
     * Get the real academic year(s)
     * attached to a semester.
     *
     * Normally there should be one academic
     * year for a semester. We keep all distinct
     * values instead of inventing anything.
     */
    const getSemesterAcademicYears = (
        semesterResults
    ) => {
        return [
            ...new Set(
                semesterResults
                    .map(
                        (result) =>
                            result.academic_year
                    )
                    .filter(
                        (year) => year
                    )
            )
        ];
    };

    /*
     * Open one semester PDF.
     */
    const openSemesterPDF = (
        academicLevel,
        semester
    ) => {
        if (!student) {
            return;
        }

        const semesterResults =
            groupedResults[
                academicLevel
            ]?.[semester] || [];

        if (!semesterResults.length) {
            return;
        }

        const semesterData =
            buildSemesterData(
                semester,
                semesterResults
            );

        const academicYears =
            getSemesterAcademicYears(
                semesterResults
            );

        /*
         * Keep the actual academic year.
         * If, unexpectedly, more than one year
         * exists, show both instead of inventing
         * a single year.
         */
        const academicYear =
            academicYears.join(" / ");

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
     * Open the annual PDF for one academic level.
     *
     * L1 -> S1 + S2
     * L2 -> S3 + S4
     * L3 -> S5 + S6
     *
     * We only generate an annual result when
     * BOTH semesters are available.
     */
    const openAnnualPDF = (
        academicLevel
    ) => {
        if (!student) {
            return;
        }

        const levelResults =
            groupedResults[
                academicLevel
            ];

        if (!levelResults) {
            return;
        }

        const semesterKeys =
            Object.keys(
                levelResults
            ).sort(
                (a, b) =>
                    Number(a) -
                    Number(b)
            );

        /*
         * An annual result requires the
         * two semesters belonging to the level.
         */
        if (semesterKeys.length !== 2) {
            return;
        }

        const semesters =
            semesterKeys.map(
                (semester) =>
                    buildSemesterData(
                        semester,
                        levelResults[
                            semester
                        ]
                    )
            );

        if (!semesters.length) {
            return;
        }

        /*
         * Preserve the real academic years
         * attached to the two semesters.
         *
         * Example:
         * S1 -> 2024-2025
         * S2 -> 2025-2026
         *
         * Result:
         * "2024-2025 / 2025-2026"
         */
        const allAcademicYears = [
            ...new Set(
                semesterKeys.flatMap(
                    (semester) =>
                        getSemesterAcademicYears(
                            levelResults[
                                semester
                            ]
                        )
                )
            )
        ];

        const academicYear =
            allAcademicYears.join(" / ");

        /*
         * Calculate annual average from
         * the semester averages.
         *
         * Existing rule is preserved.
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
         *
         * Existing rule is preserved.
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

            {academicLevels.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8">
                    <p className="text-gray-600">
                        Aucun résultat publié pour le moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {academicLevels.map(
                        (academicLevel) => {
                            const semesterKeys =
                                Object.keys(
                                    groupedResults[
                                        academicLevel
                                    ]
                                ).sort(
                                    (a, b) =>
                                        Number(a) -
                                        Number(b)
                                );

                            /*
                             * A complete academic level
                             * has exactly its two semesters.
                             *
                             * L1 -> S1 + S2
                             * L2 -> S3 + S4
                             * L3 -> S5 + S6
                             */
                            const hasCompleteLevel =
                                semesterKeys.length === 2;

                            return (
                                <div
                                    key={
                                        academicLevel
                                    }
                                    className="bg-white rounded-lg shadow p-6"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-xl font-semibold">
                                            Niveau{" "}
                                            {
                                                academicLevel
                                            }
                                        </h2>

                                        {hasCompleteLevel && (
                                            <button
                                                onClick={() =>
                                                    openAnnualPDF(
                                                        academicLevel
                                                    )
                                                }
                                                className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                                            >
                                                Relevé annuel
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {semesterKeys.map(
                                            (
                                                semester
                                            ) => {
                                                const semesterResults =
                                                    groupedResults[
                                                        academicLevel
                                                    ][
                                                        semester
                                                    ];

                                                const academicYears =
                                                    getSemesterAcademicYears(
                                                        semesterResults
                                                    );

                                                return (
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

                                                            {academicYears.length >
                                                                0 && (
                                                                <p className="text-sm text-gray-400 mt-1">
                                                                    Année académique :{" "}
                                                                    {
                                                                        academicYears.join(
                                                                            " / "
                                                                        )
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                openSemesterPDF(
                                                                    academicLevel,
                                                                    semester
                                                                )
                                                            }
                                                            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                                                        >
                                                            Voir le PDF
                                                        </button>
                                                    </div>
                                                );
                                            }
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