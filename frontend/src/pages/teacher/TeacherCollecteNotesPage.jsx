import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../../services/api";

import TeacherLayout from "../../layouts/TeacherLayout";


export default function TeacherCollecteNotesPage() {

    const { id } = useParams();

    const [students, setStudents] = useState([]);

    const [collecte, setCollecte] = useState(null);

    const [loading, setLoading] = useState(true);

    const [notes, setNotes] = useState({});

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [ocrFile, setOcrFile] = useState(null);

    const [ocrMatches, setOcrMatches] = useState([]);

    const [ocrLoading, setOcrLoading] = useState(false);
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

    const analyzeOCR = async () => {

            if (!ocrFile) {

        setErrorMessage(
            "Veuillez sélectionner une image"
        );

        setTimeout(() => {

            setErrorMessage('');

        }, 1500);

        return;
    }

        try {

            setOcrLoading(true);

            const formData = new FormData();

            formData.append(
                "image",
                ocrFile
            );

            const response = await api.post(
                "/ocr/upload/",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            setOcrMatches(
                response.data.matches
            );

            setSuccessMessage(
                "Analyse OCR terminée"
            );

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur OCR"
            );

        } finally {

            setOcrLoading(false);
        }
    };
    const importOCR = async () => {

        try {

            const response = await api.post(
                "/ocr/import/",
                {
                    collecte_id: parseInt(id),
                    matches: ocrMatches
                }
            );

            setSuccessMessage(
                `${response.data.imported_notes} notes importées`
            );

            setErrorMessage('');

            fetchNotes();

            setOcrMatches([]);

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de l'import"
            );
        }
    };
    const validateCollecte = async () => {

        try {

            await api.post(
                `/notes/collectes/${id}/validate/`
            );

            setSuccessMessage(
                "Collecte validée avec succès"
            );

            setErrorMessage('');

            fetchCollecte();

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la validation"
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

                Gestion des notes

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
                            Statut
                        </p>

                        <p className="font-semibold text-lg capitalize">
                            {collecte.status}
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

            {collecte.status === 'prepared' && (

                    <div className="bg-white rounded shadow p-6 mb-6">

                        <h2 className="text-xl font-semibold mb-4">

                            Import OCR

                        </h2>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setOcrFile(
                                    e.target.files[0]
                                )
                            }
                            className="mb-4"
                        />

                        <div>

                            <button
                                onClick={analyzeOCR}
                                disabled={ocrLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >

                                {
                                    ocrLoading
                                        ? 'Analyse...'
                                        : 'Analyser OCR'
                                }

                            </button>

                        </div>

                        {
                            ocrMatches.length > 0 && (

                                <div className="mt-6">

                                    <h3 className="text-lg font-semibold mb-4">

                                        Résultats OCR

                                    </h3>

                                    {
                                        ocrMatches.map((match) => (

                                            <div
                                                key={match.matricule}
                                                className="border rounded p-3 mb-3"
                                            >

                                                <p>
                                                    <strong>Matricule:</strong>
                                                    {" "}
                                                    {match.matricule}
                                                </p>

                                                <p>
                                                    <strong>Étudiant:</strong>
                                                    {" "}
                                                    {match.student_name}
                                                </p>

                                                <p>
                                                    <strong>CC:</strong>
                                                    {" "}
                                                    {match.cc}
                                                </p>

                                                <p>
                                                    <strong>CF:</strong>
                                                    {" "}
                                                    {match.cf}
                                                </p>

                                                <p>
                                                    <strong>Trouvé:</strong>
                                                    {" "}
                                                    {
                                                        match.found
                                                            ? "Oui"
                                                            : "Non"
                                                    }
                                                </p>

                                            </div>
                                        ))
                                        
                                    }
                                    <div className="mt-4">

                                        <button
                                            onClick={importOCR}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >

                                            Importer les notes

                                        </button>

                                    </div>
                                </div>
                            )
                        }

                    </div>
                )
            }

            {
                collecte.status !== 'prepared' && (

                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">

                        Cette collecte est verrouillée.
                        Les notes ne peuvent plus être modifiées.

                    </div>
                )
            }


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
                                        className="border p-2 rounded w-24"
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
                                        className="border p-2 rounded w-24"
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

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>


            {
                collecte.status === 'prepared' && (

                    <div className="mt-6 flex gap-4">

                        <button
                            onClick={saveNotes}
                            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
                        >

                            Enregistrer les notes

                        </button>


                        <button
                            onClick={validateCollecte}
                            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
                        >

                            Valider la collecte

                        </button>

                    </div>
                )
            }

        </TeacherLayout>
    );
}