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

    evaluateExamCopy

} from "../../services/examService";
import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherEvaluationPage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState("");

    const [image, setImage] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

const [successMessage, setSuccessMessage] = useState("");

const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {

    loadStudents();

}, []);

const loadStudents = async () => {

    try {

        const response = await getExamStudents(id);

        setStudents(response.data);

    }

    catch (error) {

        console.error(error);

    }

};
const handleCorrection = async () => {

    if (!selectedStudent || !image) {

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

        formData.append(

            "image",

            image

        );

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

                    <input

                        type="file"

                        accept="image/*"

                        onChange={(e) =>

                            setImage(
                                e.target.files[0]
                            )

                        }

                    />

                </div>

                <div className="flex justify-end">

                    <button

                        onClick={handleCorrection}

                        disabled={

                            !selectedStudent ||

                            !image

                        }

                        className={`px-6 py-3 rounded-lg text-white ${
                            !selectedStudent || !image
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                        }`}

                    >

                        {

                            loading

                                ?

                                "Correction..."

                                :

                                "Lancer la correction"

                        }

                    </button>

                </div>

            </div>

        </TeacherLayout>

    );

}