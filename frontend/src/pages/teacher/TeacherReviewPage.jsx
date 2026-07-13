import {

    useEffect,

    useState

} from "react";

import {

    useParams

} from "react-router-dom";

import TeacherLayout from "../../layouts/TeacherLayout";

import {

    getCorrections,

    validateCorrections

} from "../../services/examService";

export default function TeacherReviewPage() {

    const { copyId } = useParams();

    const [

        corrections,

        setCorrections

    ] = useState([]);

    const [

        loading,

        setLoading

    ] = useState(true);

    useEffect(() => {

        loadCorrections();

    }, []);

    const loadCorrections = async () => {

        try {

            const response = await getCorrections(

                copyId

            );
            console.log(response.data);
            setCorrections(

                response.data.map((correction) => ({

                    ...correction,

                    teacher_score:

                        correction.teacher_score ??

                        correction.suggested_score

                }))

            );

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };
    const handleValidation = async () => {

    try {

        await validateCorrections({

            corrections: corrections.map((correction) => ({

                id: correction.id,

                teacher_score: correction.teacher_score

            }))

        });

        alert(

            "Correction validée avec succès."

        );
        loadCorrections();

    }

    catch (error) {

        console.error(error);

        alert(

            "Erreur lors de la validation."

        );

    }

};
    if (loading) {

        return (

            <TeacherLayout>

                <div className="text-center py-20">

                    Chargement...

                </div>

            </TeacherLayout>

        );

    }

    return (

        <TeacherLayout>

            <h1 className="text-4xl font-bold mb-8">

                Révision de la correction

            </h1>

            <div className="space-y-6">

                {

                    corrections.map((correction) => (

                        <div

                            key={correction.id}

                            className="bg-white rounded-xl shadow-sm p-6"

                        >

                            <h2 className="text-xl font-semibold mb-4">

                                Question {correction.question_number}

                            </h2>

                            <div className="mb-4">

                                <strong>

                                    Question

                                </strong>

                                <p>

                                    {correction.question_text}

                                </p>

                            </div>

                            <div className="mb-4">

                                <strong>

                                    Note 

                                </strong>

                                <div className="flex items-center gap-3">

                                    <input

                                        type="number"

                                        step="0.25"

                                        min="0"

                                        max={correction.max_score}

                                        value={correction.teacher_score}

                                        onChange={(e) => {

                                            const value =

                                                e.target.value === ""

                                                    ? ""

                                                     : parseFloat(e.target.value);

                                            setCorrections((previous) =>

                                                previous.map((c) =>

                                                    c.id === correction.id

                                                        ? {

                                                            ...c,

                                                            teacher_score: value

                                                        }

                                                        : c

                                                )

                                            );

                                        }}
                                        className="border rounded-lg px-3 py-2 w-24"

                                    />

                                    <span>

                                        / {correction.max_score}

                                    </span>

                                </div>

                            </div>

                            <div>

                                <strong>

                                    Feedback IA

                                </strong>

                                <p>

                                    {correction.feedback}

                                </p>

                            </div>

                        </div>

                    ))

                }

            </div>
                <div className="flex justify-end mt-8">

                    <button

                        onClick={handleValidation}

                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"

                    >

                        Valider la correction

                    </button>

                </div>
        </TeacherLayout>

    );

}