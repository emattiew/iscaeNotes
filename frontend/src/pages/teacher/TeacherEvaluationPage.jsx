import { useEffect, useState } from "react";
import {

    useParams,

    useNavigate

} from "react-router-dom";
import {

    getExamStudents,

    uploadExamCopy,

    processExamCopyOCR,

    extractAnswers,

    evaluateExamCopy,
    getStudentCopy

} from "../../services/examService";
import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherEvaluationPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState("");

    const [images, setImages] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [examCopy, setExamCopy] = useState(null);

    const [copyProcessed, setCopyProcessed] = useState(false);

    const [answersExtracted, setAnswersExtracted] = useState(false);

    const [aiDone, setAiDone] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {

    loadStudents();

    }, []);
    useEffect(() => {
    setImages([]);
    setSuccessMessage("");
    setErrorMessage("");
    if (!selectedStudent) {

    setExamCopy(null);

    setCopyProcessed(false);

    setAnswersExtracted(false);

    setAiDone(false);
    
    return;

}
    loadStudentCopy();

    }, [selectedStudent]);
    const loadStudents = async () => {

    try {

        const response = await getExamStudents(id);

        setStudents(response.data);

    }

    catch (error) {

        console.error(error);

    }

};
const loadStudentCopy = async () => {

    try {

        const response = await getStudentCopy(

            id,

            selectedStudent

        );

        const data = response.data;

        setExamCopy(

            data.copy

        );

        setCopyProcessed(

            data.ocr_done

        );

        setAnswersExtracted(

            data.answers_extracted

        );

        setAiDone(

            data.ai_done

        );

    }

    catch (error) {

    console.error(error);

    setExamCopy(null);

    setCopyProcessed(false);

    setAnswersExtracted(false);

    setAiDone(false);

}

};
const addImages = (e) => {

    const files = Array.from(e.target.files);

    setImages((previous) => [

        ...previous,

        ...files

    ]);

    e.target.value = "";

};

const removeImage = (index) => {

    setImages(

        images.filter((_, i) => i !== index)

    );

};
const handleCorrection = async () => {

    if (!selectedStudent) {

        return;

    }


    if (examCopy && aiDone && images.length === 0) {
    navigate(
        `/teacher/copies/${examCopy.id}/review`
    );

    return;
    }

    
    if (images.length === 0) {

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

            "student",

            selectedStudent

        );

        images.forEach((image) => {

            formData.append(
                "images",
                image
            );

        });

        const uploadResponse = await uploadExamCopy(

            formData

        );

        const copyId = uploadResponse.data.id;

        await processExamCopyOCR(

            copyId

        );

        await extractAnswers(

            copyId

        );

        await evaluateExamCopy(

            copyId

        );

        navigate(

            `/teacher/copies/${copyId}/review`

        );

    }

    catch (error) {

        console.error(error);

        setErrorMessage(

            "Erreur pendant la correction."

        );

    }

    finally {

        setLoading(false);

    }

};
    return (

        <TeacherLayout>
            <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 rounded-lg bg-[#102c27] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
                ← Retour à la correction IA
            </button>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 mb-6">

                Correction assistée par IA

            </h1>
            {

                successMessage && (

                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">

                        {successMessage}

                    </div>

                )

            }

            {

                errorMessage && (

                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                        {errorMessage}

                    </div>

                )

            }
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">

                <div className="mb-7">

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                        Étudiant

                    </label>

                    <select

                        value={selectedStudent}

                        onChange={(e) =>

                            setSelectedStudent(
                                e.target.value
                            )

                        }

                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"

                    >

                        <option value="">

                            Sélectionner un étudiant

                        </option>

                        {

                            students.map((student) => (

                                <option

                                    key={student.id}

                                    value={student.id}

                                >

                                    {student.matricule} - {student.first_name} {student.last_name}

                                </option>

                            ))

                        }

                    </select>

                </div>

                <div className="mb-7">

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                        Copie d'examen

                    </label>

                    {

                        examCopy ? (

                            <>

                                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                                    <p className="mb-2 text-sm font-semibold text-emerald-800">

                                        ✓ Copie déjà importée

                                    </p>

                                    <a

                                        href={`http://127.0.0.1:8000${examCopy.image}`}

                                        target="_blank"

                                        rel="noreferrer"

                                        className="text-sm font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800"

                                    >

                                        Voir la copie

                                    </a>

                                </div>

                                <input

                                    type="file"

                                    accept="image/*"
                                    multiple

                                    onChange={addImages}
                                    className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-semibold file:text-emerald-700 hover:border-emerald-400"

                                />
                                
                            </>

                        ) : (

                            <input

                                type="file"

                                accept="image/*"
                                multiple
                                onChange={addImages}
                                className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-semibold file:text-emerald-700 hover:border-emerald-400"
                            />

                        )
                        
                    }
                    {
                        images.length > 0 && (

                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <p className="mb-3 text-sm font-semibold text-slate-700">

                                    Pages sélectionnées

                                </p>

                                {

                                    images.map((image, index) => (

                                        <div

                                            key={index}

                                            className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"

                                        >

                                            <span>

                                                Page {index + 1} — {image.name}

                                            </span>

                                            <button

                                                type="button"

                                                onClick={() => removeImage(index)}

                                                className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"

                                            >

                                                Supprimer

                                            </button>

                                        </div>

                                    ))

                                }

                            </div>

                        )
                    }
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">

                    <button

                    onClick={handleCorrection}

                    disabled={
                        !selectedStudent ||
                        (images.length === 0 && !aiDone)
                    }

                    className={`rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        !selectedStudent || (images.length === 0 && !aiDone)
                            ? "cursor-not-allowed bg-slate-300"
                            : images.length > 0
                                ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300"
                                : aiDone
                                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
                                    : examCopy
                                        ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300"
                                        : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300"
                    }`}

                >
                {
                    loading
                        ? "Correction..."
                        : images.length > 0
                            ? "Remplacer la copie"
                            : aiDone
                                ? "Reprendre la correction"
                                : examCopy
                                    ? "Remplacer la copie"
                                    : "Lancer la correction"
                }

                </button>

                </div>

            </div>

        </TeacherLayout>

    );

}