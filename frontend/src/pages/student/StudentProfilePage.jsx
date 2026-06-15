import { useEffect, useState } from "react";

import api from "../../services/api";

import StudentLayout from "../../layouts/StudentLayout";

export default function StudentProfilePage() {

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [passwordData, setPasswordData] = useState({

        old_password: '',

        new_password: '',

        confirm_password: '',
    });

    useEffect(() => {

        fetchProfile();

    }, []);

    useEffect(() => {

        if (successMessage) {

            const timer = setTimeout(() => {

                setSuccessMessage('');

            }, 2000);

            return () => clearTimeout(timer);
        }

    }, [successMessage]);

    useEffect(() => {

        if (errorMessage) {

            const timer = setTimeout(() => {

                setErrorMessage('');

            }, 2000);

            return () => clearTimeout(timer);
        }

    }, [errorMessage]);

    const fetchProfile = async () => {

        try {

            const response = await api.get(
                "/accounts/profile/"
            );

            setProfile(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {

        setProfile({

            ...profile,

            [e.target.name]: e.target.value
        });
    };

    const saveProfile = async () => {

        try {

            await api.put(
                "/accounts/profile/",
                {
                    first_name:
                        profile.first_name,

                    last_name:
                        profile.last_name,

                    email:
                        profile.email
                }
            );

            setSuccessMessage(
                "Profil mis à jour avec succès"
            );

            setErrorMessage('');

        } catch (error) {

            console.error(error);

            setErrorMessage(
                "Erreur lors de la mise à jour"
            );
        }
    };

    const handlePasswordChange = (e) => {

        setPasswordData({

            ...passwordData,

            [e.target.name]:
                e.target.value
        });
    };

    const changePassword = async () => {

        if (

            passwordData.new_password !==
            passwordData.confirm_password

        ) {

            setErrorMessage(
                "Les mots de passe ne correspondent pas"
            );

            return;
        }

        try {

            await api.post(
                "/accounts/change-password/",
                {
                    old_password:
                        passwordData.old_password,

                    new_password:
                        passwordData.new_password
                }
            );

            setSuccessMessage(
                "Mot de passe modifié avec succès"
            );

            setErrorMessage('');

            setPasswordData({

                old_password: '',

                new_password: '',

                confirm_password: '',
            });

        } catch (error) {

            console.error(error);

            setErrorMessage(
                error.response?.data?.error ||
                "Erreur lors du changement du mot de passe"
            );
        }
    };

    if (loading || !profile) {

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

            <h1 className="text-4xl font-bold mb-8">

                Mon Profil

            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="bg-white p-8 rounded-2xl shadow-sm">

                    <h2 className="text-2xl font-bold mb-6">

                        Informations personnelles

                    </h2>

                    <div className="space-y-4">

                        <input
                            type="text"
                            name="first_name"
                            value={profile.first_name || ''}
                            onChange={handleProfileChange}
                            placeholder="Prénom"
                            className="w-full border p-3 rounded"
                        />

                        <input
                            type="text"
                            name="last_name"
                            value={profile.last_name || ''}
                            onChange={handleProfileChange}
                            placeholder="Nom"
                            className="w-full border p-3 rounded"
                        />

                        <input
                            type="email"
                            name="email"
                            value={profile.email || ''}
                            onChange={handleProfileChange}
                            placeholder="Email"
                            className="w-full border p-3 rounded"
                        />

                        <input
                            type="text"
                            value={profile.matricule || ''}
                            disabled
                            className="w-full border p-3 rounded bg-gray-100"
                        />

                        <input
                            type="text"
                            value={profile.filiere_name || ''}
                            disabled
                            className="w-full border p-3 rounded bg-gray-100"
                        />

                        <button
                            onClick={saveProfile}
                            className="bg-black text-white px-5 py-3 rounded hover:bg-gray-800"
                        >

                            Enregistrer

                        </button>

                    </div>

                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm">

                    <h2 className="text-2xl font-bold mb-6">

                        Changer le mot de passe

                    </h2>

                    <div className="space-y-4">

                        <input
                            type="password"
                            name="old_password"
                            value={passwordData.old_password}
                            onChange={handlePasswordChange}
                            placeholder="Mot de passe actuel"
                            className="w-full border p-3 rounded"
                        />

                        <input
                            type="password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            placeholder="Nouveau mot de passe"
                            className="w-full border p-3 rounded"
                        />

                        <input
                            type="password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            placeholder="Confirmer le mot de passe"
                            className="w-full border p-3 rounded"
                        />

                        <button
                            onClick={changePassword}
                            className="bg-green-600 text-white px-5 py-3 rounded hover:bg-green-700"
                        >

                            Changer le mot de passe

                        </button>

                    </div>

                </div>

            </div>

        </StudentLayout>
    );
}