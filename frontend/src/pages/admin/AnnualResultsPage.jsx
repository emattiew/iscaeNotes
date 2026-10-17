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
                <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                        <p className="text-sm text-slate-500">Chargement...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 pb-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-medium text-emerald-700">Gestion académique</p>
                        <h1 className="text-2xl font-bold tracking-tight text-[#102c27] sm:text-3xl">
                            Résultats annuels
                        </h1>
                    </div>
                    <div className="flex w-fit items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#102c27] text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 3.75h6l4.25 4.25v12.25H5.75V3.75H8Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.75V8h4.25M8.5 12h7M8.5 15.5h7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-800">Année académique</p>
                            <p className="text-sm font-semibold text-[#102c27]">{selectedYear || "Non sélectionnée"}</p>
                        </div>
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10m-7 6h4" />
                            </svg>
                        </div>
                        <h2 className="font-semibold text-[#102c27]">Filtres</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                        <div className="space-y-2">
                            <label htmlFor="annual-year" className="block text-sm font-medium text-slate-700">Année académique</label>
                            <select id="annual-year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10">
                                <option value="">Sélectionner une année</option>
                                {years.map((year) => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="annual-filiere" className="block text-sm font-medium text-slate-700">Filière</label>
                            <select id="annual-filiere" value={selectedFiliere} onChange={(e) => setSelectedFiliere(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10">
                                <option value="">Sélectionner une filière</option>
                                {filieres.map((filiere) => <option key={filiere.id} value={filiere.id}>{filiere.code}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <h2 className="font-semibold text-[#102c27]">Résultats des étudiants</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            {selectedYear && <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">{selectedYear}</span>}
                            {selectedFiliere && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">{filieres.find((filiere) => String(filiere.id) === String(selectedFiliere))?.code || "Filière"}</span>}
                        </div>
                    </div>

                    {resultsLoading ? (
                        <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8">
                            <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                            <p className="text-sm text-slate-500">Chargement des résultats...</p>
                        </div>
                    ) : !selectedYear || !selectedFiliere ? (
                        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.75A1.75 1.75 0 0 1 5.75 4h12.5A1.75 1.75 0 0 1 20 5.75v12.5A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V5.75Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 12.5h5" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-[#102c27]">Sélectionnez une année et une filière</h3>
                        </div>
                    ) : studentsResults.length === 0 ? (
                        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.75h7l4.25 4.25v12.25H5.75V3.75H7Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.75V8h4.25M8.5 12h7" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-[#102c27]">Aucun étudiant trouvé</h3>
                        </div>
                    ) : (
                        <>
                            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                                <p className="text-sm text-slate-600"><span className="font-semibold text-[#102c27]">{studentsResults.length}</span> étudiant(s)</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max text-left">
                                    <thead className="bg-[#102c27] text-white">
                                        <tr>
                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider">Matricule</th>
                                            <th className="sticky left-0 z-10 min-w-52 bg-[#102c27] px-5 py-4 text-xs font-semibold uppercase tracking-wider">Étudiant</th>
                                            {subjects.map((subject) => <th key={subject.id} className="max-w-48 px-5 py-4 text-xs font-semibold uppercase tracking-wider"><span className="block min-w-28 whitespace-normal leading-5">{subject.name}</span></th>)}
                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {studentsResults.map((student) => (
                                            <tr key={student.id} className="group transition-colors hover:bg-emerald-50/40">
                                                <td className="whitespace-nowrap px-5 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600">{student.matricule || "-"}</span></td>
                                                <td className="sticky left-0 z-[1] bg-white px-5 py-4 transition-colors group-hover:bg-emerald-50/40">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-900">{`${student.first_name || ""} ${student.last_name || ""}`.trim().charAt(0).toUpperCase() || "?"}</div>
                                                        <p className="whitespace-nowrap text-sm font-semibold text-slate-800">{student.first_name} {student.last_name}</p>
                                                    </div>
                                                </td>
                                                {subjects.map((subject) => {
                                                    const collecte = filteredCollectes.find((collecte) => String(collecte.matiere) === String(subject.id));
                                                    const note = student.notes.find((result) => collecte && String(result.collecte) === String(collecte.id));
                                                    const grade = note ? Number(note.note_finale).toFixed(2) : "-";
                                                    return (
                                                        <td key={subject.id} className="px-5 py-4">
                                                            {grade === "-" ? <span className="text-sm text-slate-300">—</span> : <span className={`inline-flex min-w-14 justify-center rounded-lg px-2.5 py-1.5 text-sm font-semibold ${Number(note.note_finale) >= 10 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{grade}</span>}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-5 py-4">
                                                    <button onClick={() => setSelectedStudent(getStudentAnnualPDFData(student))} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#102c27] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.75h7l4.25 4.25v12.25H5.75V3.75H7Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.75V8h4.25M8.5 12h7M8.5 15.5h7" />
                                                        </svg>
                                                        Voir PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onClick={() => setSelectedStudent(null)}>
                    <div className="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                                <h2 className="font-semibold text-[#102c27]">Relevé annuel</h2>
                                <p className="mt-1 text-xs text-slate-500">{selectedStudent.student?.first_name} {selectedStudent.student?.last_name} · {selectedStudent.academicYear}</p>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} aria-label="Fermer le relevé annuel" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" /></svg>
                            </button>
                        </div>
                        <div className="min-h-0 flex-1">
                            <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
                                <AcademicResultPDF student={selectedStudent.student} academicYear={selectedStudent.academicYear} semesters={selectedStudent.semesters} annualAverage={selectedStudent.annualAverage} annualDecision={selectedStudent.annualDecision} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
