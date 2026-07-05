import { useState } from "react";
import { useParams } from "react-router-dom";

import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherEvaluationPage() {

    const { id } = useParams();

    const [selectedStudent, setSelectedStudent] = useState("");

    const [image, setImage] = useState(null);

    return (

        <TeacherLayout>

            <h1 className="text-5xl font-bold mb-8">

                Correction assistée par IA

            </h1>

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

                        Lancer la correction

                    </button>

                </div>

            </div>

        </TeacherLayout>

    );

}