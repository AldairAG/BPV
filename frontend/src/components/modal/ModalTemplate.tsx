import React, { type ReactNode, useCallback, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalTemplateProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

/**
 * Hook personalizado para gestionar el estado de un modal
 */
export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);
    const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

    return { isOpen, openModal, closeModal, toggleModal };
};

/**
 * Componente de modal reutilizable con estilos de Tailwind
 */
const ModalTemplate: React.FC<ModalTemplateProps> = ({
    isOpen,
    onClose,
    children,
    title
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/70 backdrop-blur-sm px-2 py-4"
        >
            <div
                className="
                    relative w-full max-w-lg md:max-w-xl lg:max-w-2xl
                    bg-gray-800
                    rounded-2xl shadow-2xl border border-blue-400
                    p-4 sm:p-8
                    max-h-[90vh] overflow-y-auto
                    animate-fade-in
                    text-white
                "
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-blue-200 bg-blue-700 hover:bg-blue-600 rounded-full p-1 transition-colors shadow"
                    aria-label="Cerrar modal"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {title && (
                    <div className="mb-6 pb-2 border-b border-blue-400">
                        <h3 className="text-2xl font-bold text-white tracking-wide">{title}</h3>
                    </div>
                )}

                <div className="mt-2 text-white">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalTemplate;