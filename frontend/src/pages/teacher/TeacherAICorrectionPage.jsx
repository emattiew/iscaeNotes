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

                <div className="text-center py-20 text-gray-500">

                    Chargement...

                </div>

            </TeacherLayout>

        );

    }

    return (

        <TeacherLayout>

            <div className="mb-8">

                <h1 className="text-4xl font-bold">

                    Correction assistée par IA

                </h1>

                <p className="text-gray-500 mt-2">

                    Gérez vos examens et lancez la correction automatique.

                </p>

            </div>
            {successMessage && (

                <div className="bg-green-600 text-white p-4 rounded mb-4">

                    {successMessage}

                </div>

            )}

            {errorMessage && (

                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">

                    {errorMessage}

                </div>

            )}
            <div className="bg-white rounded-2xl shadow-sm p-6">

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-xl font-semibold">

                        Mes examens

                    </h2>

                    <button

                        onClick={openModal}

                        className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800"

                    >

                        + Nouvel examen

                    </button>

                </div>

                {

                    exams.length === 0 ?

                    (

                        <div className="text-center py-10 text-gray-500">

                            Aucun examen.

                        </div>

                    )

                    :

                    (

                        <div className="space-y-4">

                            {

                                exams.map((exam) => (

                                    <div

                                        key={exam.id}

                                        className="border rounded-xl p-5 flex justify-between items-center"

                                    >

                                        <div>

                                            <h3 className="text-lg font-semibold">

                                                {exam.title}

                                            </h3>

                                            <p className="text-gray-500">

                                                {exam.collecte_name}

                                            </p>

                                        </div>

                                        <div className="flex gap-3">

                                            <button

                                                onClick={() =>
                                                    navigate(
                                                        `/teacher/exams/${exam.id}/preparation`
                                                    )
                                                }

                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"

                                            >

                                                Préparer

                                            </button>

                                            <button

                                                onClick={() =>
                                                    navigate(
                                                        `/teacher/exams/${exam.id}/evaluation`
                                                    )
                                                }

                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"

                                            >

                                                Corriger

                                            </button>

                                        </div>

                                    </div>

                                ))

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