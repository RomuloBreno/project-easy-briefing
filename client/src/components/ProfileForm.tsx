// src/components/ProfileForm.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProfileFormProps {
    onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onCancel }) => {
    const { user, updateProfile, isLoading, error } = useAuth();
    const [nameUser, setNameUser] = useState(user?.nameUser || '');
    const [email, setEmail] = useState(user?.email || '');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Sincroniza o estado local com o contexto, caso o usuário mude
    useEffect(() => {
        if (user) {
            setNameUser(user.nameUser);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        try {
            await updateProfile(nameUser, email);
            setSuccessMessage('Perfil atualizado com sucesso!');
        } catch (err) {
            // O erro já é tratado e definido no contexto
        }
    };

    return (
        <div className="profile-form-container p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="nameUser">
                        Nome
                    </label>
                    <input
                        type="text"
                        id="nameUser"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={nameUser}
                        onChange={(e) => setNameUser(e.target.value)}
                        required
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="flex justify-between items-center">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-600 hover:underline"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};