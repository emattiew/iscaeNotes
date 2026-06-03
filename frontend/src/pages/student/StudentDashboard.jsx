import { useEffect, useState } from "react";

import api from "../../services/api";

import StudentLayout from "../../layouts/StudentLayout";


export default function StudentDashboard() {

    const [user, setUser] = useState(null);

    const [notes, setNotes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedNote, setSelectedNote] = useState(null);

    const [showReclamationModal,setShowReclamationModal] = useState(false);

    const [reclamationMessage, setReclamationMessage] = useState('');

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage,
        setErrorMessage] =
        useState('');


    useEffect(() => {

        fetchProfile();

        fetchResults();

    }, []);


    const fetchProfile = async () => {

        try {

            const response = await api.get(
                "/accounts/profile/"
            );

            setUser(response.data);

        } catch (error) {

            console.error(error);
        }
    };


    const fetchResults = async () => {

        try {

            const response = await api.get(
                "/notes/student-notes/"
            );

            setNotes(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };
    const openReclamationModal = (
        note
    ) => {

        setSelectedNote(note);

        setShowReclamationModal(
            true
        );
    };

const createReclamation =
    async () => {

    try {

        await api.post(
            "/notes/reclamations/",
            {
                student_note:
                    selectedNote.id,

                message:
                    reclamationMessage
            }
        );

        setSuccessMessage(
            "Réclamation envoyée avec succès"
        );

        setErrorMessage('');

        setShowReclamationModal(
            false
        );

        setReclamationMessage('');
        
        setSelectedNote(null);

    } catch (error) {

        console.error(error);

        setErrorMessage(
            "Erreur lors de l'envoi"
        );

        setSuccessMessage('');
    }
};

    if (loading || !user) {

        return (

            <StudentLayout>

                <div>

                    Loading...

                </div>

            </StudentLayout>
        );
    }


    return (

    <StudentLayout>

        {
            successMessage && (

                <div className="bg-green-600 text-white p-4 rounded mb-4">

                    {successMessage}

                </div>
            )
        }

        {
            errorMessage && (

                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">

                    {errorMessage}

                </div>
            )
        }

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">

                <h1 className="text-4xl font-bold mb-2">

                    Bonjour {user.username}

                </h1>


                <p className="text-gray-500 text-lg">

                    Bienvenue sur votre espace étudiant

                </p>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                    <div className="bg-gray-100 rounded-xl p-5">

                        <p className="text-gray-500 text-sm mb-2">

                            Filière

                        </p>

                        <h2 className="text-2xl font-bold">

                            {user.filiere_name}

                        </h2>

                    </div>


                    <div className="bg-gray-100 rounded-xl p-5">

                        <p className="text-gray-500 text-sm mb-2">

                            Matricule

                        </p>

                        <h2 className="text-2xl font-bold">

                            {user.matricule}

                        </h2>

                    </div>


                    <div className="bg-gray-100 rounded-xl p-5">

                        <p className="text-gray-500 text-sm mb-2">

                            Année universitaire

                        </p>

                        <h2 className="text-2xl font-bold">

                            2025-2026

                        </h2>

                    </div>

                </div>

            </div>


            <div className="bg-white rounded-2xl shadow-sm p-8">

                <div className="flex items-center justify-between mb-8">

                    <div>

                        <h2 className="text-3xl font-bold">

                            Résultats publiés

                        </h2>

                        <p className="text-gray-500 mt-1">

                            Consultez vos notes publiées

                        </p>

                    </div>

                </div>


                {
                    notes.length === 0 ? (

                        <div className="bg-gray-50 border rounded-xl p-10 text-center">

                            <p className="text-gray-500 text-lg">

                                Aucun résultat publié pour le moment

                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {notes.map((note) => (

                                <div
                                    key={note.id}
                                    className="border rounded-2xl p-6 bg-gray-50"
                                >

                                    <div className="flex items-start justify-between mb-4">

                                        <div>

                                            <h3 className="text-2xl font-bold">

                                                {note.matiere_name}

                                            </h3>

                                            <p className="text-gray-500 mt-1">

                                                {note.teacher_name}

                                            </p>

                                        </div>


                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                                            Publié

                                        </span>

                                    </div>


                                    <div className="grid grid-cols-3 gap-4 mt-6">

                                        <div className="bg-white rounded-xl p-4 text-center">

                                            <p className="text-gray-500 text-sm mb-1">

                                                CC

                                            </p>

                                            <h4 className="text-2xl font-bold">

                                                {note.controle_continu}

                                            </h4>

                                        </div>


                                        <div className="bg-white rounded-xl p-4 text-center">

                                            <p className="text-gray-500 text-sm mb-1">

                                                CF

                                            </p>

                                            <h4 className="text-2xl font-bold">

                                                {note.controle_final}

                                            </h4>

                                        </div>


                                        <div className="bg-black text-white rounded-xl p-4 text-center">

                                            <p className="text-sm mb-1">

                                                Finale

                                            </p>

                                            <h4 className="text-2xl font-bold">

                                                {note.note_finale}

                                            </h4>

                                        </div>

                                    </div>

                                    <button
                                        onClick={() =>
                                            openReclamationModal(note)
                                        }
                                        className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                        Faire une réclamation
                                    </button>
                                    <div className="mt-6 text-sm text-gray-500">

                                        Année universitaire :
                                        {" "}
                                        {note.academic_year}

                                    </div>

                                </div>
                            ))}

                        </div>
                    )
                }

            </div>
            {
    showReclamationModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-xl w-full max-w-lg">

                <h2 className="text-2xl font-bold mb-4">

                    Nouvelle réclamation

                </h2>

                <textarea
                    value={reclamationMessage}
                    onChange={(e) =>
                        setReclamationMessage(
                            e.target.value
                        )
                    }
                    className="border w-full p-3 rounded h-32"
                    placeholder="Expliquez votre réclamation..."
                />

                <div className="flex gap-3 mt-4">

                    <button
                        onClick={createReclamation}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Envoyer
                    </button>

                    <button
                        onClick={() =>
                            setShowReclamationModal(
                                false
                            )
                        }
                        className="bg-gray-300 px-4 py-2 rounded"
                    >
                        Annuler
                    </button>

                </div>

            </div>

        </div>
    )
}
        </StudentLayout>
        
    );
    
}