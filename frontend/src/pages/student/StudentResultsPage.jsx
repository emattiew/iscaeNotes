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
                <main className="mx-auto flex min-h-[55vh] max-w-[1500px] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-11 w-11">
                            <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100" />
                            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-emerald-800" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                            Chargement des résultats...
                        </p>
                    </div>
                </main>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <main className="mx-auto w-[94%] max-w-[1600px] space-y-9 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-slate-50 to-white px-4 py-6 pb-12 sm:px-6 sm:py-8 lg:px-8">
                {/* Page heading */}
                <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-700 shadow-lg shadow-emerald-950/15">
                    <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/[0.04]" />
                    <div className="absolute -bottom-28 right-32 h-64 w-64 rounded-full border border-white/10 bg-white/[0.04]" />
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-300" />
                    <div className="relative flex flex-col gap-6 px-7 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-11 lg:px-12 lg:py-12">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-emerald-50 backdrop-blur-sm">
                                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.12)]" />
                                ESPACE ÉTUDIANT
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                Mes résultats
                            </h1>
                            <p className="mt-3 text-sm text-emerald-100/90 sm:text-base">
                                Consultez vos relevés de notes par semestre et par niveau.
                            </p>
                        </div>

                        <div className="relative flex h-16 w-16 items-center justify-center self-start rounded-2xl border border-white/20 bg-white/10 text-white shadow-inner backdrop-blur-sm sm:h-[84px] sm:w-[84px] sm:self-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true">
                                <path d="M7 3h8l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                                <path d="M15 3v5h5M9 13h7M9 17h7" />
                            </svg>
                        </div>
                    </div>
                </header>

                {academicLevels.length === 0 ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-8 w-8" aria-hidden="true">
                                <path d="M7 3h8l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                                <path d="M15 3v5h5M9 13h7M9 17h5" />
                            </svg>
                        </div>
                        <h2 className="mt-5 text-lg text-lg font-semibold text-slate-900">
                            Aucun résultat disponible
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Aucun résultat publié pour le moment.
                        </p>
                    </section>
                ) : (
                    <div className="grid grid-cols-1 items-stretch gap-7 xl:grid-cols-2">
                        {academicLevels.map((academicLevel) => {
                            const semesterKeys = Object.keys(
                                groupedResults[academicLevel]
                            ).sort((a, b) => Number(a) - Number(b));

                            const hasCompleteLevel = semesterKeys.length === 2;

                            return (
                                <section
                                    key={academicLevel}
                                    className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/[0.04]"
                                >
                                    <div className="h-1 bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-200" />

                                    {/* Academic level header */}
                                    <div className="flex min-h-[132px] items-center justify-between gap-4 border-b border-slate-100 px-6 py-7 sm:px-8 sm:py-8">
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7" aria-hidden="true">
                                                    <path d="m3 8 9-5 9 5-9 5-9-5Z" />
                                                    <path d="M7 10.5v4.2c3 2.2 7 2.2 10 0v-4.2M21 8v6" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
                                                    Parcours académique
                                                </p>
                                                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
                                                    Niveau {academicLevel}
                                                </h2>
                                            </div>
                                        </div>

                                        {hasCompleteLevel && (
                                            <button
                                                type="button"
                                                onClick={() => openAnnualPDF(academicLevel)}
                                                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/15 sm:px-4 sm:text-sm"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                                                    <path d="M7 3h8l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                                                    <path d="M15 3v5h5M9 13h7M9 17h5" />
                                                </svg>
                                                <span className="hidden sm:inline">Relevé annuel</span>
                                                <span className="sm:hidden">Annuel</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Semester cards */}
                                    <div className="flex h-full flex-col space-y-4 bg-slate-50/60 p-5 sm:p-6">
                                        {semesterKeys.map((semester) => {
                                            const semesterResults =
                                                groupedResults[academicLevel][semester];

                                            const academicYears =
                                                getSemesterAcademicYears(semesterResults);

                                            return (
                                                <div
                                                    key={semester}
                                                    className="flex min-h-[112px] flex-col gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition-all duration-200 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-900/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3.5">
                                                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-800">
                                                            <span className="text-[11px] font-semibold uppercase tracking-wider">Sem.</span>
                                                            <span className="text-lg font-bold leading-5">{semester}</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-semibold text-slate-900">
                                                                Semestre {semester}
                                                            </h3>
                                                            {academicYears.length > 0 && (
                                                                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                                                                        <rect x="3" y="5" width="18" height="16" rx="2" />
                                                                        <path d="M16 3v4M8 3v4M3 10h18" />
                                                                    </svg>
                                                                    <span>{academicYears.join(" / ")}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => openSemesterPDF(academicLevel, semester)}
                                                        className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-emerald-800 hover:bg-emerald-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:w-auto"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                                                            <path d="M7 3h8l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                                                            <path d="M15 3v5h5M9 13h7M9 17h5" />
                                                        </svg>
                                                        Voir le PDF
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="ml-0.5 h-3.5 w-3.5" aria-hidden="true">
                                                            <path d="M7 17 17 7M8 7h9v9" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}

                {/* PDF preview modal */}
                {selectedPDF && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
                        <div className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
                            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
                                            <path d="M7 3h8l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                                            <path d="M15 3v5h5M9 13h7M9 17h5" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-base text-lg font-semibold text-slate-900">
                                            Relevé de notes
                                        </h2>
                                        {selectedPDF.academicYear && (
                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                {selectedPDF.academicYear}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedPDF(null)}
                                    aria-label="Fermer le relevé"
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                                        <path d="m6 6 12 12M18 6 6 18" />
                                    </svg>
                                    <span className="hidden sm:inline">Fermer</span>
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 bg-slate-100 p-2 sm:p-3">
                                <div className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-inner">
                                    <PDFViewer
                                        width="100%"
                                        height="100%"
                                        style={{ border: "none", display: "block" }}
                                    >
                                        <AcademicResultPDF
                                            student={selectedPDF.student}
                                            academicYear={selectedPDF.academicYear}
                                            semesters={selectedPDF.semesters}
                                            annualAverage={selectedPDF.annualAverage}
                                            annualDecision={selectedPDF.annualDecision}
                                        />
                                    </PDFViewer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </StudentLayout>
    );
}
