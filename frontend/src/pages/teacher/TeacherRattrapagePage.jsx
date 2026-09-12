import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../../services/api";
import TeacherLayout from "../../layouts/TeacherLayout";

export default function TeacherRattrapagePage() {

    const { id } = useParams();

    const [students, setStudents] = useState([]);
    const [collecte, setCollecte] = useState(null);
    const [notes, setNotes] = useState({});
    const [loading, setLoading] = useState(true);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");


    useEffect(() => {
        fetchCollecte();
        fetchNotes();
    }, []);


    const fetchCollecte = async () => {

        try {

            const response = await api.get(
                `/notes/collectes/${id}/`
            );

            setCollecte(response.data);

            fetchStudents(
                response.data.filiere
            );

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors du chargement de la collecte."
            );

        }
    };


    const fetchStudents = async (filiereId) => {

        try {

            const response = await api.get(
                `/accounts/students/?filiere=${filiereId}`
            );

            setStudents(response.data);

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors du chargement des étudiants."
            );

        } finally {

            setLoading(false);

        }
    };


    const fetchNotes = async () => {

        try {

            const response = await api.get(
                `/notes/student-notes/?collecte=${id}`
            );

            const formattedNotes = {};

            response.data.forEach((note) => {

                formattedNotes[note.student] = {

                    controle_continu:
                        note.controle_continu,

                    controle_final:
                        note.controle_final,

                    rattrapage:
                        note.rattrapage ?? 0,

                    note_finale:
                        note.note_finale,

                };

            });

            setNotes(formattedNotes);

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors du chargement des notes."
            );

        }
    };


    const handleRattrapageChange = (
        studentId,
        value
    ) => {

        setNotes((prev) => ({

            ...prev,

            [studentId]: {

                ...prev[studentId],

                rattrapage: value,

            },

        }));

    };


    const saveRattrapage = async () => {

        try {

            const notesData = Object.keys(notes)
                .filter((studentId) => {

                    const value =
                        notes[studentId]?.rattrapage;

                    return (
                        value !== '' &&
                        value !== null &&
                        value !== undefined
                    );

                })
                .map((studentId) => ({

                    student: studentId,

                    rattrapage:
                        notes[studentId].rattrapage,

                }));


            await api.post(
                `/notes/collectes/${id}/save_rattrapage/`,
                {
                    notes: notesData,
                }
            );


            setSuccessMessage(
                "Notes de rattrapage enregistrées avec succès."
            );

            setErrorMessage('');

            fetchNotes();

        } catch (error) {

            console.error(error);

            setErrorMessage(
                error.response?.data?.error ||
                "Erreur lors de l'enregistrement du rattrapage."
            );

            setSuccessMessage('');

        }

    };


    if (loading || !collecte) {

        return (

            <TeacherLayout>

                <div>
                    Loading...
                </div>

            </TeacherLayout>

        );

    }


    return (

        <TeacherLayout>

            <h1 className="text-3xl font-bold mb-6">
                Gestion du Rattrapage
            </h1>


            <div className="bg-white rounded shadow p-6 mb-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                        <p className="text-gray-500 text-sm">
                            Matière
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.matiere_name}
                        </p>

                    </div>


                    <div>

                        <p className="text-gray-500 text-sm">
                            Filière
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.filiere_name}
                        </p>

                    </div>


                    <div>

                        <p className="text-gray-500 text-sm">
                            Enseignant
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.teacher_name}
                        </p>

                    </div>


                    <div>

                        <p className="text-gray-500 text-sm">
                            Année universitaire
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.academic_year}
                        </p>

                    </div>


                    <div>

                        <p className="text-gray-500 text-sm">
                            Statut de la collecte
                        </p>

                        <p className="font-semibold text-lg capitalize">
                            {collecte.status}
                        </p>

                    </div>


                    <div>

                        <p className="text-gray-500 text-sm">
                            Statut du rattrapage
                        </p>

                        <p className="font-semibold text-lg capitalize">
                            {collecte.rattrapage_status}
                        </p>

                    </div>

                </div>

            </div>


            {successMessage && (

                <div className="bg-green-600 text-white p-4 rounded mb-4">

                    {successMessage}

                </div>

            )}


            {errorMessage && (

                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">

                    {errorMessage}

                </div>

            )}


            {collecte.rattrapage_status !== "opened" && (

                <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">

                    Le rattrapage n'est pas ouvert pour cette collecte.

                </div>

            )}


            <div className="bg-white rounded shadow overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-200">

                        <tr>

                            <th className="p-4 text-left">
                                Étudiant
                            </th>

                            <th className="p-4 text-left">
                                Matricule
                            </th>

                            <th className="p-4 text-left">
                                Contrôle Continu
                            </th>

                            <th className="p-4 text-left">
                                Contrôle Final
                            </th>

                            <th className="p-4 text-left">
                                Rattrapage
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {students.map((student) => (

                            <tr
                                key={student.id}
                                className="border-t"
                            >

                                <td className="p-4">
                                    {student.username}
                                </td>


                                <td className="p-4">
                                    {student.matricule}
                                </td>


                                <td className="p-4">

                                    <input
                                        type="number"
                                        className="border p-2 rounded w-24 bg-gray-100"
                                        value={
                                            notes[student.id]?.controle_continu ?? ""
                                        }
                                        disabled
                                    />

                                </td>


                                <td className="p-4">

                                    <input
                                        type="number"
                                        className="border p-2 rounded w-24 bg-gray-100"
                                        value={
                                            notes[student.id]?.controle_final ?? ""
                                        }
                                        disabled
                                    />

                                </td>


                                <td className="p-4">

                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        step="0.01"
                                        className="border p-2 rounded w-24"
                                        placeholder="Rattrapage"
                                        value={
                                            notes[student.id]?.rattrapage ?? ""
                                        }
                                        disabled={
                                            collecte.rattrapage_status !== "opened"
                                        }
                                        onChange={(e) =>
                                            handleRattrapageChange(
                                                student.id,
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {collecte.rattrapage_status === "opened" && (

                <div className="mt-6 flex justify-end gap-3">

                    <button
                        onClick={saveRattrapage}
                        className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
                    >
                        Enregistrer les notes de rattrapage
                    </button>

                    <button
                        onClick={async () => {

                            try {

                                await api.post(
                                    `/notes/collectes/${id}/validate_rattrapage/`
                                );

                                setSuccessMessage(
                                    "Rattrapage validé avec succès."
                                );

                                setErrorMessage('');

                                const response = await api.get(
                                    `/notes/collectes/${id}/`
                                );

                                setCollecte(response.data);

                            } catch (error) {

                                console.error(error);

                                setErrorMessage(
                                    error.response?.data?.error ||
                                    "Erreur lors de la validation du rattrapage."
                                );

                                setSuccessMessage('');

                            }

                        }}
                        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
                    >
                        Valider le Rattrapage
                    </button>

                </div>

            )}
        </TeacherLayout>

    );

}