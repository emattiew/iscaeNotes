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


    if (examCopy && aiDone) {

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

            <h1 className="text-5xl font-bold mb-8">

                Correction assistée par IA

            </h1>
            {

                successMessage && (

                    <div className="bg-green-600 text-white p-4 rounded mb-5">

                        {successMessage}

                    </div>

                )

            }

            {

                errorMessage && (

                    <div className="bg-red-100 text-red-700 p-4 rounded mb-5">

                        {errorMessage}

                    </div>

                )

            }
            <div className="bg-white rounded-2xl shadow-sm p-8">

                <div className="mb-8">

                    <label className="block font-medium mb-3">

                        Étudiant

                    </label>

                    <select

                        value={selectedStudent}

                        onChange={(e) =>

                            setSelectedStudent(
                                e.target.value
                            )

                        }

                        className="w-full border rounded-lg p-3"

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

                <div className="mb-8">

                    <label className="block font-medium mb-3">

                        Copie d'examen

                    </label>

                    {

                        examCopy ? (

                            <>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">

                                    <p className="text-green-700 font-medium">

                                        ✓ Copie déjà importée

                                    </p>

                                    <a

                                        href={`http://127.0.0.1:8000${examCopy.image}`}

                                        target="_blank"

                                        rel="noreferrer"

                                        className="text-blue-600 underline"

                                    >

                                        Voir la copie

                                    </a>

                                </div>

                                <input

                                    type="file"

                                    accept="image/*"
                                    multiple

                                    onChange={addImages}

                                />
                                
                            </>

                        ) : (

                            <input

                                type="file"

                                accept="image/*"
                                multiple
                                onChange={addImages}
                            />

                        )
                        
                    }
                    {
                        images.length > 0 && (

                            <div className="mt-4">

                                <p className="font-medium mb-2">

                                    Pages sélectionnées

                                </p>

                                {

                                    images.map((image, index) => (

                                        <div

                                            key={index}

                                            className="flex justify-between items-center border rounded-lg p-3 mb-2"

                                        >

                                            <span>

                                                Page {index + 1} — {image.name}

                                            </span>

                                            <button

                                                type="button"

                                                onClick={() => removeImage(index)}

                                                className="text-red-600 hover:text-red-800"

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

                <div className="flex justify-end">

                    <button

                    onClick={handleCorrection}

                    disabled={
                        !selectedStudent ||
                        (images.length === 0 && !aiDone)
                    }

                    className={`px-6 py-3 rounded-lg text-white ${
                        !selectedStudent || (images.length === 0 && !aiDone)
                            ? "bg-gray-400 cursor-not-allowed"
                            : aiDone
                                ? "bg-blue-600 hover:bg-blue-700"
                                : examCopy
                                    ? "bg-yellow-600 hover:bg-yellow-700"
                                    : "bg-green-600 hover:bg-green-700"
                    }`}

                >

                    {
                        loading
                            ? "Correction..."
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