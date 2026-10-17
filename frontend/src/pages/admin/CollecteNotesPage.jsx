import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../../services/api";

import AdminLayout from "../../layouts/AdminLayout";


export default function CollecteNotesPage() {

    const { id } = useParams();

    const [students, setStudents] = useState([]);

    const [collecte, setCollecte] = useState(null);

    const [loading, setLoading] = useState(true);

    const [notes, setNotes] = useState({});

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {

        fetchCollecte();

        fetchNotes();

    }, []);


    useEffect(() => {

        if (successMessage) {

            const timer = setTimeout(() => {

                setSuccessMessage('');

            }, 1500);

            return () => clearTimeout(timer);
        }

    }, [successMessage]);


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
        }
    };


    const fetchStudents = async (
        filiereId
    ) => {

        try {

            const response = await api.get(
                `/accounts/students/?filiere=${filiereId}`
            );

            setStudents(response.data);

        } catch (error) {

            console.error(error);

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
                        note.note_finale ?? 0,
                };
            });

            setNotes(formattedNotes);

        } catch (error) {

            console.error(error);
        }
    };


    const handleNoteChange = (
        studentId,
        field,
        value
    ) => {

        setNotes((prev) => ({

            ...prev,

            [studentId]: {

                ...prev[studentId],

                [field]: value,
            },
        }));
    };


    const saveNotes = async () => {

        try {

            for (const studentId in notes) {

                const noteData = {

                    collecte: id,

                    student: studentId,

                    controle_continu:
                        notes[studentId]
                            .controle_continu || 0,

                    controle_final:
                        notes[studentId]
                            .controle_final || 0,
                };

                await api.post(
                    "/notes/student-notes/",
                    noteData
                );
            }

            setSuccessMessage(
                "Notes enregistrées avec succès"
            );

            setErrorMessage('');

            fetchNotes();

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de l'enregistrement"
            );

            setSuccessMessage('');
        }
    };


    if (loading || !collecte) {

        return (

            <AdminLayout>

                <div>

                    Loading...

                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <h1 className="text-3xl font-bold mb-6 text-slate-800">

                Gestion des notes

            </h1>


            <div className="bg-white rounded shadow-sm border border-slate-200 p-6 mb-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>

                        <p className="text-slate-500 text-sm">
                            Matière
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.matiere_name}
                        </p>

                    </div>


                    <div>

                        <p className="text-slate-500 text-sm">
                            Filière
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.filiere_name}
                        </p>

                    </div>


                    <div>

                        <p className="text-slate-500 text-sm">
                            Enseignant
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.teacher_name}
                        </p>

                    </div>


                    <div>

                        <p className="text-slate-500 text-sm">
                            Année universitaire
                        </p>

                        <p className="font-semibold text-lg">
                            {collecte.academic_year}
                        </p>

                    </div>


                    <div>

                        <p className="text-slate-500 text-sm">
                            Statut
                        </p>

                        <p className="font-semibold text-lg capitalize">
                            {collecte.status}
                        </p>

                    </div>

                </div>

            </div>


            {successMessage && (

                <div className="bg-emerald-700 text-white p-4 rounded mb-4">

                    {successMessage}

                </div>
            )}


            {errorMessage && (

                <div className="bg-red-700 text-white p-4 rounded mb-4">

                    {errorMessage}

                </div>
            )}


            {
                collecte.status !== 'prepared' && (

                    <div className="bg-amber-700 text-white p-4 rounded mb-4">

                        Cette collecte est verrouillée.
                        Les notes ne peuvent plus être modifiées.

                    </div>
                )
            }


            <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">

                <table className="w-full">

                    <thead className="bg-slate-100">

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
                            <th className="p-4 text-left">
                                Note finale
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {students.map((student) => (

                            <tr
                                key={student.id}
                                className="border-t border-slate-200"
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
                                        className="border border-slate-300 p-2 rounded w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="CC"
                                        disabled={
                                            collecte.status !== 'prepared'
                                        }
                                        value={
                                            notes[student.id]?.controle_continu || ''
                                        }
                                        onChange={(e) =>
                                            handleNoteChange(
                                                student.id,
                                                'controle_continu',
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                                <td className="p-4">

                                    <input
                                        type="number"
                                        className="border border-slate-300 p-2 rounded w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="CF"
                                        disabled={
                                            collecte.status !== 'prepared'
                                        }
                                        value={
                                            notes[student.id]?.controle_final || ''
                                        }
                                        onChange={(e) =>
                                            handleNoteChange(
                                                student.id,
                                                'controle_final',
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>
                                <td className="p-4">

                                    <input
                                        type="number"
                                        className="border border-slate-300 p-2 rounded w-24 bg-slate-100 text-slate-600"
                                        value={
                                            notes[student.id]?.rattrapage ?? ''
                                        }
                                        disabled
                                    />

                                </td>
                                <td className="p-4">

                                    <input
                                        type="number"
                                        className="border border-slate-300 p-2 rounded w-24 bg-slate-100 text-slate-600"
                                        value={
                                            notes[student.id]?.note_finale ?? ''
                                        }
                                        disabled
                                    />

                                </td>
                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {
                collecte.status === 'prepared' && (

                    <div className="mt-6">

                        <button
                            onClick={saveNotes}
                            className="bg-[#102c27] text-white px-6 py-3 rounded hover:bg-[#1b453d]"
                        >

                            Enregistrer les notes

                        </button>

                    </div>
                )
            }

        </AdminLayout>
    );
}