import { useState } from "react";

export default function CreateExamModal({

    show,
    onClose,
    onCreate,
    matieres

}) {

    const [title, setTitle] = useState("");

    const [matiere, setMatiere] = useState("");

    if (!show) {

        return null;

    }

    const submit = () => {

        if (!title.trim()) {

            alert("Veuillez saisir un titre.");

            return;

        }

        if (!matiere) {

            alert("Veuillez choisir une matière.");

            return;

        }

        onCreate({

            title,

            matiere

        });

        setTitle("");

        setMatiere("");

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

                            Matière

                        </label>

                        <select

                            value={matiere}

                            onChange={(e) =>

                                setMatiere(e.target.value)

                            }

                            className="w-full border rounded-lg px-4 py-3"

                        >

                            <option value="">

                                Choisir une matière

                            </option>

                            {matieres.map((m) => (

                                <option

                                    key={m.id}

                                    value={m.id}

                                >

                                    {m.name}

                                </option>

                            ))}

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