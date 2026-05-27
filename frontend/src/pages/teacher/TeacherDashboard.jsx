import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import TeacherLayout from "../../layouts/TeacherLayout";


export default function TeacherDashboard() {

    const navigate = useNavigate();

    const [collectes, setCollectes] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        fetchCollectes();

    }, []);


    const fetchCollectes = async () => {

        try {

            const response = await api.get(
                "/notes/collectes/"
            );

            setCollectes(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };


    if (loading) {

        return (

            <TeacherLayout>

                <div>

                    Loading...

                </div>

            </TeacherLayout>
        );
    }


    const preparedCount = collectes.filter(
        c => c.status === 'prepared'
    ).length;


    const validatedCount = collectes.filter(
        c => c.status === 'validated'
    ).length;


    const publishedCount = collectes.filter(
        c => c.status === 'published'
    ).length;


    return (

        <TeacherLayout>

            <h1 className="text-5xl font-bold mb-8">

                Teacher Dashboard

            </h1>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

                <div className="bg-white p-6 rounded-2xl shadow-sm">

                    <p className="text-gray-500 mb-2">
                        Total Collectes
                    </p>

                    <h2 className="text-4xl font-bold">
                        {collectes.length}
                    </h2>

                </div>


                <div className="bg-white p-6 rounded-2xl shadow-sm">

                    <p className="text-gray-500 mb-2">
                        Prepared
                    </p>

                    <h2 className="text-4xl font-bold">
                        {preparedCount}
                    </h2>

                </div>


                <div className="bg-white p-6 rounded-2xl shadow-sm">

                    <p className="text-gray-500 mb-2">
                        Validated
                    </p>

                    <h2 className="text-4xl font-bold">
                        {validatedCount}
                    </h2>

                </div>


                <div className="bg-white p-6 rounded-2xl shadow-sm">

                    <p className="text-gray-500 mb-2">
                        Published
                    </p>

                    <h2 className="text-4xl font-bold">
                        {publishedCount}
                    </h2>

                </div>

            </div>


            <div className="bg-white rounded-2xl shadow-sm p-8">

                <h2 className="text-3xl font-bold mb-6">

                    Actions rapides

                </h2>


                <div className="flex gap-4 flex-wrap">

                    <button
                        onClick={() =>
                            navigate('/teacher/collectes')
                        }
                        className="bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-800"
                    >

                        Voir mes collectes

                    </button>

                </div>

            </div>

        </TeacherLayout>
    );
}