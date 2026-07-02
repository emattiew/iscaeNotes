import { useState } from "react";
import { useParams } from "react-router-dom";

import TeacherLayout from "../../layouts/TeacherLayout";

import {
    uploadExamSheet,
    processExamOCR,
    extractQuestions,
    validateQuestions
} from "../../services/examService";

export default function TeacherPreparationPage() {

    const { id } = useParams();

    const [image, setImage] = useState(null);

    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const [examSheetId, setExamSheetId] = useState(null);

    const handleUpload = async () => {

        if (!image) {

            setErrorMessage(
                "Veuillez choisir une image."
            );

            return;

        }

        try {

            setLoading(true);

            setSuccessMessage("");

            setErrorMessage("");

            const formData = new FormData();

            formData.append(
                "exam",
                id
            );

            formData.append(
                "image",
                image
            );

            const uploadResponse =
                await uploadExamSheet(formData);

            const uploadedExamSheetId =
                uploadResponse.data.id;

            setExamSheetId(
                uploadedExamSheetId
            );

                await processExamOCR(
                uploadedExamSheetId
            );

            const response =
                await extractQuestions(
                uploadedExamSheetId
            );

            setQuestions(
                response.data.questions
            );

            setSuccessMessage(
                "Questions détectées avec succès."
            );

        }

        catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur pendant le traitement."
            );

        }

        finally {

            setLoading(false);

        }

    };
    const handleValidateQuestions = async () => {

    try {

        await validateQuestions(

            examSheetId,

            {

                questions: questions

            }

        );

        setSuccessMessage(

            "Questions enregistrées avec succès."

        );

        setErrorMessage("");

    }

    catch (error) {

        console.error(error);

        setErrorMessage(

            "Erreur lors de l'enregistrement."

        );

        setSuccessMessage("");

    }

};

    return (

        <TeacherLayout>

            <h1 className="text-5xl font-bold mb-8">

                Préparation de l'examen

            </h1>

            {successMessage && (

                <div className="bg-green-600 text-white p-4 rounded mb-5">

                    {successMessage}

                </div>

            )}

            {errorMessage && (

                <div className="bg-red-100 text-red-700 p-4 rounded mb-5">

                    {errorMessage}

                </div>

            )}

            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">

                <h2 className="text-2xl font-semibold mb-6">

                    Sujet d'examen

                </h2>

                <input

                    type="file"

                    accept="image/*"

                    onChange={(e) =>
                        setImage(
                            e.target.files[0]
                        )
                    }

                    className="mb-6"

                />

                <br />

                <button

                    onClick={handleUpload}

                    disabled={loading}

                    className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"

                >

                    {

                        loading

                        ?

                        "Traitement..."

                        :

                        "Uploader et détecter"

                    }

                </button>

            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">

                <h2 className="text-2xl font-semibold mb-6">

                    Questions détectées

                </h2>

                {

                    questions.length === 0 ?

                    (

                        <p className="text-gray-500">

                            Aucune question détectée.

                        </p>

                    )

                    :

                    (

                        questions.map((question, index) => (

                         <div
                            key={question.question_number}
                            className="border rounded-xl p-5 mb-5"
                        >

                            <h3 className="text-xl font-semibold mb-5">

                                Question {question.question_number}

                            </h3>

                            <div className="mb-5">

                                <label className="block font-medium mb-2">

                                    Question

                                </label>

                                <textarea

                                    value={question.question_text}

                                    rows={3}

                                    onChange={(e) => {

                                        const updated = [...questions];

                                        updated[index].question_text =
                                            e.target.value;

                                        setQuestions(updated);

                                    }}

                                    className="w-full border rounded-lg p-3"

                                />

                            </div>

                            <div>

                                <label className="block font-medium mb-2">

                                    Points

                                </label>

                                <input

                                    type="number"

                                    min="0"

                                    value={question.max_score || ""}

                                    onChange={(e) => {

                                        const updated = [...questions];

                                        updated[index].max_score =
                                            Number(e.target.value);

                                        setQuestions(updated);

                                    }}

                                    className="w-32 border rounded-lg p-2"

                                />

                            </div>

                    </div>
                        
                        ))

                    )

                }

            </div>

            <div className="flex justify-end mt-8">

                <button
                    onClick={handleValidateQuestions}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >

                    Valider les questions

                </button>

            </div>
        </TeacherLayout>

    );

}