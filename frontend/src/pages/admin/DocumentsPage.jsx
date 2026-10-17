
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
            const response = await api.get("/notes/filieres/");
            setFilieres(response.data);
        } catch (error) {
            console.error(error);
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
                        matiere_name: collecte.matiere_name,
                        filiere_name: collecte.filiere_name,
                        academic_year: collecte.academic_year,
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
                String(collecte.filiere) !== String(selectedFiliere)
            ) {
                return false;
            }

            if (
                selectedYear &&
                collecte.academic_year !== selectedYear
            ) {
                return false;
            }

            if (selectedSemester) {
                const matiere = matieres.find(
                    (m) => String(m.id) === String(collecte.matiere)
                );

                if (!matiere) {
                    return false;
                }

                const module = modules.find(
                    (m) => String(m.id) === String(matiere.module)
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
                    String(subject.id) === String(collecte.matiere)
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
                String(result.student) === String(student.id)
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
                        String(result.collecte) === String(collecte.id)
                );

                if (!note) {
                    return null;
                }

                const matiere = matieres.find(
                    (m) => String(m.id) === String(collecte.matiere)
                );

                const noteFinale = Number(note.note_finale);

                return {
                    id: note.id,
                    name: collecte.matiere_name,
                    controle_continu: note.controle_continu ?? "-",
                    controle_final: note.controle_final ?? "-",
                    note: Number.isNaN(noteFinale)
                        ? "-"
                        : noteFinale.toFixed(2),
                    credit: matiere?.credit ?? "-",
                    coefficient: matiere?.coefficient ?? 1,
                    decision: !Number.isNaN(noteFinale)
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
            average !== null ? average.toFixed(2) : "-";

        const semesterDecision =
            average !== null
                ? average >= 10
                    ? "Validé"
                    : "Rattrapage"
                : "-";

        return {
            student: {
                ...student,
                filiere_name: student.filiere_name || ""
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
                <div className="flex min-h-[320px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-[#102c27]" />
                        <p className="text-sm font-medium text-slate-500">
                            Chargement des données...
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">

                {/* Page heading */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-1.5 w-7 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                                Gestion académique
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-[#102c27] sm:text-4xl">
                            Résultats
                        </h1>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        PV semestriel
                    </div>
                </div>

                {/* Filters */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102c27] text-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 5h16M7 12h10m-7 7h4"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="font-bold text-[#102c27]">
                                Filtres des résultats
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Année universitaire
                            </label>

                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                            >
                                <option value="">
                                    Sélectionner une année
                                </option>

                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Filière
                            </label>

                            <select
                                value={selectedFiliere}
                                onChange={(e) =>
                                    setSelectedFiliere(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
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

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Semestre
                            </label>

                            <select
                                value={selectedSemester}
                                onChange={(e) =>
                                    setSelectedSemester(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                            >
                                <option value="">
                                    Sélectionner un semestre
                                </option>
                                <option value="1">Semestre 1</option>
                                <option value="2">Semestre 2</option>
                                <option value="3">Semestre 3</option>
                                <option value="4">Semestre 4</option>
                                <option value="5">Semestre 5</option>
                                <option value="6">Semestre 6</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Results table */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-[#102c27]">
                                Tableau des résultats
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {studentsResults.length} étudiant
                                {studentsResults.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse text-left">
                            <thead>
                                <tr className="bg-[#102c27] text-white">
                                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Matricule
                                    </th>

                                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Étudiant
                                    </th>

                                    {subjects.map((subject) => (
                                        <th
                                            key={subject.id}
                                            className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                                        >
                                            {subject.name}
                                        </th>
                                    ))}

                                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {studentsResults.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className={`transition-colors hover:bg-emerald-50/40 ${
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-slate-50/50"
                                        }`}
                                    >
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-sm text-slate-600">
                                                {student.matricule || "-"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-[#102c27]">
                                                    {`${student.first_name || ""} ${student.last_name || ""}`
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase() || "?"}
                                                </div>

                                                <span className="font-semibold text-slate-800">
                                                    {student.first_name}{" "}
                                                    {student.last_name}
                                                </span>
                                            </div>
                                        </td>

                                        {subjects.map((subject) => {
                                            const collecte =
                                                filteredCollectes.find(
                                                    (collecte) =>
                                                        String(collecte.matiere) ===
                                                        String(subject.id)
                                                );

                                            const note =
                                                student.notes.find(
                                                    (result) =>
                                                        collecte &&
                                                        String(result.collecte) ===
                                                        String(collecte.id)
                                                );

                                            return (
                                                <td
                                                    key={subject.id}
                                                    className="whitespace-nowrap px-5 py-4"
                                                >
                                                    <span
                                                        className={`inline-flex min-w-14 justify-center rounded-lg px-3 py-1.5 text-sm font-bold ${
                                                            note
                                                                ? Number(note.note_finale) >= 10
                                                                    ? "bg-emerald-50 text-emerald-800"
                                                                    : "bg-rose-50 text-rose-700"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        {note
                                                            ? Number(
                                                                  note.note_finale
                                                              ).toFixed(2)
                                                            : "-"}
                                                    </span>
                                                </td>
                                            );
                                        })}

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <button
                                                onClick={() =>
                                                    setSelectedStudent(
                                                        getStudentPDFData(student)
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg bg-[#102c27] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b453d] focus:outline-none focus:ring-4 focus:ring-emerald-800/20"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M7 3h7l5 5v13H5V3h2Zm7 0v5h5M8 13h8M8 17h8"
                                                    />
                                                </svg>
                                                Voir PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {studentsResults.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={subjects.length + 3}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        className="h-7 w-7"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                                                        />
                                                    </svg>
                                                </div>

                                                <p className="font-semibold text-slate-700">
                                                    Aucun résultat à afficher
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Sélectionnez une année, une filière et un semestre.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* PDF preview */}
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
                        <div className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
                                <div>
                                    <h2 className="font-bold text-[#102c27]">
                                        Relevé de notes
                                    </h2>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {selectedStudent.student?.first_name}{" "}
                                        {selectedStudent.student?.last_name}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-800/10"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m6 6 12 12M18 6 6 18"
                                        />
                                    </svg>
                                    Fermer
                                </button>
                            </div>

                            <div className="min-h-0 flex-1">
                                <PDFViewer width="100%" height="100%">
                                    <AcademicResultPDF
                                        student={selectedStudent.student}
                                        academicYear={selectedStudent.academicYear}
                                        semesters={selectedStudent.semesters}
                                    />
                                </PDFViewer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
