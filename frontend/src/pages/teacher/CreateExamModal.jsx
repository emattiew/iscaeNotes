import { useState } from "react";

export default function CreateExamModal({

    show,
    onClose,
    onCreate,
    collectes

}) {

    const [title, setTitle] = useState("");

    const [collecte, setCollecte] = useState("");

    if (!show) {

        return null;

    }

    const submit = () => {

        if (!title.trim()) {

            alert("Veuillez saisir un titre.");

            return;

        }

        if (!collecte) {

            alert("Veuillez choisir une collecte.");

            return;

        }

        onCreate({

            title,

            collecte

        });

        setTitle("");

        setCollecte("");

    };

    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">

                <h2 className="text-2xl font-bold mb-6">

                    Nouvel examen

                </h2>

                <div className="space-y-5">

                    <div>

                        <label className="block mb-2 font-medium">

                            Titre

                        </label>

                        <input

                            type="text"

                            value={title}

                            onChange={(e) =>

                                setTitle(e.target.value)

                            }

                            className="w-full border rounded-lg px-4 py-3"

                            placeholder="Ex : Examen Final Bases de Données"

                        />

                    </div>

                    <div>

                        <label className="block mb-2 font-medium">

                            Collecte

                        </label>

                        <select

                            value={collecte}

                            onChange={(e) =>

                                setCollecte(e.target.value)

                            }

                            className="w-full border rounded-lg px-4 py-3"

                        >

                            <option value="">

                                Choisir une collecte

                            </option>

                            {

                                collectes.map((collecte) => (

                                    <option

                                        key={collecte.id}

                                        value={collecte.id}

                                    >

                                        {collecte.matiere_name} - {collecte.filiere_name} - {collecte.academic_year}

                                    </option>

                                ))

                            }

                        </select>

                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-8">

                    <button

                        onClick={onClose}

                        className="px-5 py-3 rounded-lg border"

                    >

                        Annuler

                    </button>

                    <button

                        onClick={submit}

                        className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800"

                    >

                        Créer

                    </button>

                </div>

            </div>

        </div>

    );

}