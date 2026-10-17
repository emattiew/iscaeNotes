import {

    useEffect,

    useState

} from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    

    const [questions, setQuestions] = useState([]);

    const [examLoading, setExamLoading] = useState(false);

    const [correctionLoading, setCorrectionLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const [examSheetId, setExamSheetId] = useState(null);
    const [examSheet, setExamSheet] = useState(null);

    const [examImages, setExamImages] = useState([]);

    const [correctionImages, setCorrectionImages] = useState([]);

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
    const addExamImages = (e) => {

        const files = Array.from(e.target.files);

        setExamImages((previous) => [

            ...previous,

            ...files

        ]);

        e.target.value = "";

    };

    const removeExamImage = (index) => {

        setExamImages(

            examImages.filter((_, i) => i !== index)

        );

    };

    const addCorrectionImages = (e) => {

        const files = Array.from(e.target.files);

        setCorrectionImages((previous) => [

            ...previous,

            ...files

        ]);

        e.target.value = "";

    };

    const removeCorrectionImage = (index) => {

        setCorrectionImages(

            correctionImages.filter((_, i) => i !== index)

        );

    };
    const handleUpload = async () => {

        if (examImages.length === 0) {

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

            examImages.forEach((image) => {

                formData.append(
                    "images",
                    image
                );

            });

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
            setExamImages([]);
            
            await loadPreparation();
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

    if (correctionImages.length === 0) {

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

        correctionImages.forEach((image) => {

            formData.append(
                "images",
                image
            );

        });

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
        setCorrectionImages([]);

        await loadPreparation();
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

            <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 rounded-lg bg-[#102c27] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
                ← Retour à la correction IA
            </button>

            <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">

                Préparation de l'examen

            </h1>

            {successMessage && (

                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 font-medium text-emerald-800 shadow-sm">

                    {successMessage}

                </div>

            )}

            {errorMessage && (

                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 font-medium text-red-700 shadow-sm">

                    {errorMessage}

                </div>

            )}

            <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">

                    Sujet d'examen

                </h2>

                {

                    examSheet ? (

                        <>

                            <div className="mb-5 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                                <p className="mb-1 font-semibold text-emerald-800">

                                     Sujet déjà importé

                                </p>

                                <a

                                    href={`http://127.0.0.1:8000${examSheet.image}`}

                                    target="_blank"

                                    rel="noreferrer"

                                    className="inline-flex items-center font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-900"

                                >

                                    Voir le sujet

                                </a>

                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={addExamImages}
                                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
                            />

                            {
                                examImages.length > 0 && (

                                    <div className="mt-4 space-y-2">

                                        <p className="mb-3 text-sm font-semibold text-slate-700">

                                            Pages sélectionnées

                                        </p>

                                        {

                                            examImages.map((image, index) => (

                                                <div
                                                    key={index}
                                                    className="mb-2 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <span>

                                                        Page {index + 1} — {image.name}

                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeExamImage(index)}
                                                        className="self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 sm:self-auto"
                                                    >

                                                        Supprimer

                                                    </button>

                                                </div>

                                            ))

                                        }

                                    </div>

                                )
                            }
                            <br />
                            <button

                                onClick={handleUpload}

                                disabled={examLoading}

                                className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"

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
                                onChange={addExamImages}
                                className="mb-5 block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
                            />

                            {
                                examImages.length > 0 && (

                                    <div className="mt-4 space-y-2">

                                        <p className="mb-3 text-sm font-semibold text-slate-700">

                                            Pages sélectionnées

                                        </p>

                                        {

                                            examImages.map((image, index) => (

                                                <div
                                                    key={index}
                                                    className="mb-2 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <span>

                                                        Page {index + 1} — {image.name}

                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeExamImage(index)}
                                                        className="self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 sm:self-auto"
                                                    >

                                                        Supprimer

                                                    </button>

                                                </div>

                                            ))

                                        }

                                    </div>

                                )
                            }

                            <br />

                            <button

                                onClick={handleUpload}

                                disabled={examLoading}

                                className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"

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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">

                    Questions détectées

                </h2>

                {

                    questions.length === 0 ?

                    (

                        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">

                            Aucune question détectée.

                        </p>

                    )

                    :

                    (

                        questions.map((question, index) => (

                         <div
                            key={question.question_number}
                            className="mb-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                        >

                            <h3 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">

                                Question {question.question_number}

                            </h3>

                            <div className="mb-5">

                                <label className="mb-2 block text-sm font-semibold text-slate-700">

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

                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"

                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">

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

                                    className="w-full max-w-32 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"

                                />

                            </div>

                    </div>
                        
                        ))

                    )

                }

            </div>

            <div className="mt-6 flex justify-end">

                <button
                    onClick={handleValidateQuestions}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                >

                    Valider les questions

                </button>

            </div>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">

                    Correction officielle

                </h2>

                {

                    correctionSheet ? (

                        <>

                            <div className="mb-5 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                                <p className="mb-1 font-semibold text-emerald-800">

                                    Correction déjà importée

                                </p>

                                <a

                                    href={`http://127.0.0.1:8000${correctionSheet.image}`}

                                    target="_blank"

                                    rel="noreferrer"

                                    className="inline-flex items-center font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-900"

                                >

                                    Voir la correction

                                </a>

                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={addCorrectionImages}
                                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
                            />

                            {
                                correctionImages.length > 0 && (

                                    <div className="mt-4 space-y-2">

                                        <p className="mb-3 text-sm font-semibold text-slate-700">

                                            Pages sélectionnées

                                        </p>

                                        {

                                            correctionImages.map((image, index) => (

                                                <div
                                                    key={index}
                                                    className="mb-2 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <span>

                                                        Page {index + 1} — {image.name}

                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeCorrectionImage(index)}
                                                        className="self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 sm:self-auto"
                                                    >

                                                        Supprimer

                                                    </button>

                                                </div>

                                            ))

                                        }

                                    </div>

                                )
                            }

                            <br />

                            <button

                                onClick={handleCorrectionUpload}

                                disabled={correctionLoading}

                                className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"

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
                                onChange={addCorrectionImages}
                                className="mb-5 block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
                            />

                            {
                                correctionImages.length > 0 && (

                                    <div className="mt-4 space-y-2">

                                        <p className="mb-3 text-sm font-semibold text-slate-700">

                                            Pages sélectionnées

                                        </p>

                                        {

                                            correctionImages.map((image, index) => (

                                                <div
                                                    key={index}
                                                    className="mb-2 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <span>

                                                        Page {index + 1} — {image.name}

                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeCorrectionImage(index)}
                                                        className="self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 sm:self-auto"
                                                    >

                                                        Supprimer

                                                    </button>

                                                </div>

                                            ))

                                        }

                                    </div>

                                )
                            }
                            <br />

                            <button

                                onClick={handleCorrectionUpload}

                                disabled={correctionLoading}

                                className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"

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
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                <h2 className="mb-5 text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">

                    Réponses attendues

                </h2>

                {

                    expectedAnswers.length === 0

                    ?

                    (

                        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">

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

                                        className="mb-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"

                                    >

                                        <h3 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">

                                            Question {answer.question_number}

                                        </h3>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">

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

                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"

                                        />

                                    </div>

                                ))

                            }

                            <div className="mt-6 flex justify-end">

                                <button

                                    onClick={handleValidateExpectedAnswers}

                                    className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"

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