import {

    useEffect,

    useState

} from "react";
import { useParams } from "react-router-dom";

import TeacherLayout from "../../layouts/TeacherLayout";

import {

    getPreparationData,

    uploadExamSheet,
    processExamOCR,
    extractQuestions,
    validateQuestions,

    uploadCorrectionSheet,
    processCorrectionOCR,
    extractExpectedAnswers,
    validateExpectedAnswers

} from "../../services/examService";

export default function TeacherPreparationPage() {

    const { id } = useParams();

    const [image, setImage] = useState(null);

    const [questions, setQuestions] = useState([]);

    const [examLoading, setExamLoading] = useState(false);

    const [correctionLoading, setCorrectionLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const [examSheetId, setExamSheetId] = useState(null);
    const [examSheet, setExamSheet] = useState(null);

    const [correctionImage, setCorrectionImage] = useState(null);

    const [correctionSheetId, setCorrectionSheetId] = useState(null);
    const [correctionSheet, setCorrectionSheet] = useState(null);

    const [expectedAnswers, setExpectedAnswers] = useState([]);
    useEffect(() => {

    loadPreparation();

    }, []);
    const loadPreparation = async () => {
    try {

        const response = await getPreparationData(id);

        const data = response.data;

        if (data.exam_sheet) {

            setExamSheetId(

                data.exam_sheet.id

            );

            setExamSheet(

                data.exam_sheet

            );

        }

        if (data.correction_sheet) {

            setCorrectionSheetId(

                data.correction_sheet.id

            );

            setCorrectionSheet(

                data.correction_sheet

            );

        }
        if (data.questions.length > 0) {

            setQuestions(

                data.questions

            );

        }

        if (data.expected_answers.length > 0) {

            setExpectedAnswers(

                data.expected_answers

            );

        }

    }

    catch (error) {

        console.error(error);

    }

};
    const handleUpload = async () => {

        if (!image) {

            setErrorMessage(
                "Veuillez choisir une image."
            );

            return;

        }

        try {

            setExamLoading(true);

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

            setExamLoading(false);

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
        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });
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
const handleCorrectionUpload = async () => {

    if (!correctionImage) {

        setErrorMessage(
            "Veuillez choisir une correction."
        );

        return;

    }

    try {

        setCorrectionLoading(true);

        setSuccessMessage("");

        setErrorMessage("");

        const formData = new FormData();

        formData.append(
            "exam",
            id
        );

        formData.append(
            "image",
            correctionImage
        );

        const uploadResponse =
            await uploadCorrectionSheet(formData);

        const uploadedCorrectionSheetId =
            uploadResponse.data.id;

        setCorrectionSheetId(
            uploadedCorrectionSheetId
        );

        await processCorrectionOCR(
            uploadedCorrectionSheetId
        );

        const response =
            await extractExpectedAnswers(
                uploadedCorrectionSheetId
            );

        setExpectedAnswers(
            response.data.expected_answers
        );

        setSuccessMessage(
            "Réponses attendues détectées avec succès."
        );

    }

    catch (error) {

        console.error(error);

        setErrorMessage(
            "Erreur pendant le traitement de la correction."
        );

    }

    finally {

        setCorrectionLoading(false);

    }

};
const handleValidateExpectedAnswers = async () => {

    try {

        await validateExpectedAnswers(

            correctionSheetId,

            {

                expected_answers:
                    expectedAnswers

            }

        );

        setSuccessMessage(

            "Réponses attendues enregistrées avec succès."

        );
        window.scrollTo({

            top: 0,

            behavior: "smooth"

        })
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
console.log(examSheet);

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

                {

                    examSheet ? (

                        <>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">

                                <p className="text-green-700 font-medium">

                                     Sujet déjà importé

                                </p>

                                <a

                                    href={`http://127.0.0.1:8000${examSheet.image}`}

                                    target="_blank"

                                    rel="noreferrer"

                                    className="text-blue-600 underline"

                                >

                                    Voir le sujet

                                </a>

                            </div>

                            <input

                                type="file"

                                accept="image/*"
                                multiple
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

                                disabled={examLoading}

                                className="bg-yellow-600 text-white px-6 py-3 rounded hover:bg-yellow-700"

                            >

                                {

                                    examLoading

                                    ?

                                    "Remplacement..."

                                    :

                                    "Remplacer le sujet"

                                }

                            </button>

                        </>

                    ) : (

                        <>

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

                                disabled={examLoading}

                                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"

                            >

                                {

                                    examLoading

                                    ?

                                    "Traitement..."

                                    :

                                    "Uploader et détecter"

                                }

                            </button>

                        </>

                    )

                }

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
            <div className="bg-white rounded-2xl shadow-sm p-8 mt-10">

                <h2 className="text-2xl font-semibold mb-6">

                    Correction officielle

                </h2>

                {

                    correctionSheet ? (

                        <>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">

                                <p className="text-green-700 font-medium">

                                    Correction déjà importée

                                </p>

                                <a

                                    href={`http://127.0.0.1:8000${correctionSheet.image}`}

                                    target="_blank"

                                    rel="noreferrer"

                                    className="text-blue-600 underline"

                                >

                                    Voir la correction

                                </a>

                            </div>

                            <input

                                type="file"

                                accept="image/*"

                                onChange={(e) =>

                                    setCorrectionImage(

                                        e.target.files[0]

                                    )

                                }

                                className="mb-6"

                            />

                            <br />

                            <button

                                onClick={handleCorrectionUpload}

                                disabled={correctionLoading}

                                className="bg-yellow-600 text-white px-6 py-3 rounded hover:bg-yellow-700"

                            >

                                {

                                    correctionLoading

                                    ?

                                    "Remplacement..."

                                    :

                                    "Remplacer la correction"

                                }

                            </button>

                        </>

                    ) : (

                        <>

                            <input

                                type="file"

                                accept="image/*"

                                onChange={(e) =>

                                    setCorrectionImage(

                                        e.target.files[0]

                                    )

                                }

                                className="mb-6"

                            />

                            <br />

                            <button

                                onClick={handleCorrectionUpload}

                                disabled={correctionLoading}

                                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"

                            >

                                {

                                    correctionLoading

                                    ?

                                    "Traitement..."

                                    :

                                    "Uploader et détecter"

                                }

                            </button>

                        </>

                    )

                }

            </div>
            <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">

                <h2 className="text-2xl font-semibold mb-6">

                    Réponses attendues

                </h2>

                {

                    expectedAnswers.length === 0

                    ?

                    (

                        <p className="text-gray-500">

                            Aucune réponse détectée.

                        </p>

                    )
                    :

                    (

                        <>

                            {

                                expectedAnswers.map((answer, index) => (

                                    <div

                                        key={answer.question_number}

                                        className="border rounded-xl p-5 mb-5"

                                    >

                                        <h3 className="text-xl font-semibold mb-4">

                                            Question {answer.question_number}

                                        </h3>

                                        <label className="block font-medium mb-2">

                                            Réponse attendue

                                        </label>

                                        <textarea

                                            rows={6}

                                            value={answer.expected_answer}

                                            onChange={(e) => {

                                                const updated = [...expectedAnswers];

                                                updated[index].expected_answer =
                                                    e.target.value;

                                                setExpectedAnswers(updated);

                                            }}

                                            className="w-full border rounded-lg p-3"

                                        />

                                    </div>

                                ))

                            }

                            <div className="flex justify-end mt-8">

                                <button

                                    onClick={handleValidateExpectedAnswers}

                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"

                                >

                                    Valider les réponses attendues

                                </button>

                            </div>

                        </>

                    )

                }

            </div>

        </TeacherLayout>

    );

}