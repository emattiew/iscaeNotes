import {

    useEffect,

    useState

} from "react";

import {

    useParams

} from "react-router-dom";

import TeacherLayout from "../../layouts/TeacherLayout";

import {

    getCorrections

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

                response.data

            );

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

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

                                    Note IA

                                </strong>

                                <p>

                                    {correction.suggested_score} / {correction.max_score}

                                </p>

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

        </TeacherLayout>

    );

}