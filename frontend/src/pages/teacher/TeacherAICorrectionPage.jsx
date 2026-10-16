import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TeacherLayout from "../../layouts/TeacherLayout";
import CreateExamModal from "./CreateExamModal";

import {
    getExams,
    createExam,
    getCollectes
} from "../../services/examService";

export default function TeacherAICorrectionPage() {

    const navigate = useNavigate();

    const [exams, setExams] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [collectes, setCollectes] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {

        fetchExams();

    }, []);
    useEffect(() => {

    if (errorMessage) {

        const timer = setTimeout(() => {

            setErrorMessage("");

        }, 2000);

        return () => clearTimeout(timer);

    }

}, [errorMessage]);
    useEffect(() => {

    if (successMessage) {

        const timer = setTimeout(() => {

            setSuccessMessage("");

        }, 1500);

        return () => clearTimeout(timer);

    }

}, [successMessage]);
    const fetchExams = async () => {

        try {

            const response = await getExams();

            setExams(response.data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };

    const openModal = async () => {

    try {

        const response = await getCollectes();

        setCollectes(response.data);

        setShowModal(true);

    }

    catch (error) {

        console.error(error);

    }

};

   const handleCreateExam = async (data) => {

    try {

        await createExam(data);

        setSuccessMessage(
            "Examen créé avec succès."
        );

        setErrorMessage("");

        setShowModal(false);

        fetchExams();

    }

    catch (error) {

        console.error(error);

        setErrorMessage(
            "Erreur lors de la création de l'examen."
        );

        setSuccessMessage("");

    }

};

    if (loading) {

        return (

            <TeacherLayout>

                <div className="flex min-h-[45vh] items-center justify-center">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                        Chargement...
                    </div>
                </div>

            </TeacherLayout>

        );

    }

    return (

        <TeacherLayout>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                        Espace enseignant
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                        Correction assistée par IA
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Gérez vos examens et lancez la correction automatique.
                    </p>
                </div>
            </div>

            {successMessage && (
                <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">✓</span>
                    <span className="pt-0.5">{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">!</span>
                    <span className="pt-0.5">{errorMessage}</span>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Mes examens</h2>
                        <p className="mt-1 text-sm text-slate-500">Consultez et gérez la préparation et la correction de vos examens.</p>
                    </div>
                    <button
                        onClick={openModal}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                    >
                        <span className="text-lg leading-none">+</span>
                        Nouvel examen
                    </button>
                </div>

                {

                    exams.length === 0 ?

                    (

                        <div className="px-5 py-14 text-center sm:px-6">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.75h6.5L19 9.25v10A1.75 1.75 0 0 1 17.25 21h-9.5A1.75 1.75 0 0 1 6 19.25v-12A2.5 2.5 0 0 1 8.5 4.75Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5v5h5M9 14h6M9 17h6" />
                                </svg>
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">Aucun examen</h3>
                            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">Les examens que vous créez apparaîtront ici.</p>
                        </div>

                    )

                    :

                    (

                        <div className="space-y-3 p-4 sm:p-6">

                            {

                                exams.map((exam) => {

                                    const isLocked =

                                        exam.collecte_status === "validated" ||

                                        exam.collecte_status === "published";

                                    return (

                                        <div

                                            key={exam.id}

                                            className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"

                                        >

                                            <div className="min-w-0">

                                                <h3 className="break-words text-base font-bold text-slate-800 sm:text-lg">

                                                    {exam.title}

                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">

                                                    {exam.collecte_name}

                                                </p>

                                                {

                                                    isLocked && (

                                                        <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                                                                <rect x="5" y="10" width="14" height="11" rx="2" />
                                                                <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
                                                            </svg>
                                                            Collecte validée
                                                        </span>

                                                    )

                                                }

                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0 sm:gap-3">

                                                <button

                                                    disabled={isLocked}

                                                    onClick={() =>

                                                        navigate(

                                                            `/teacher/exams/${exam.id}/preparation`

                                                        )

                                                    }

                                                    className={`min-h-10 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${

                                                        isLocked

                                                            ? "cursor-not-allowed bg-slate-100 text-slate-400"

                                                            : "bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600"

                                                    }`}

                                                >

                                                    Préparer

                                                </button>

                                                <button

                                                    disabled={isLocked}

                                                    onClick={() =>

                                                        navigate(

                                                            `/teacher/exams/${exam.id}/evaluation`

                                                        )

                                                    }

                                                    className={`min-h-10 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${

                                                        isLocked

                                                            ? "cursor-not-allowed bg-slate-100 text-slate-400"

                                                            : "bg-[#102c27] text-white hover:bg-[#19453d] focus:ring-emerald-700"

                                                    }`}

                                                >

                                                    Corriger

                                                </button>

                                            </div>

                                        </div>

                                    );

                                })

                            }

                        </div>

                    )

                }

            </div>

            <CreateExamModal

                show={showModal}

                onClose={() =>
                    setShowModal(false)
                }

                onCreate={handleCreateExam}

                collectes={collectes}

            />

        </TeacherLayout>

    );

}
