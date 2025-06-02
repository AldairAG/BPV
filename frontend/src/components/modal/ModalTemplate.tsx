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
 * @returns {Object} Métodos y estado para controlar el modal
 */
export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);
    
    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);
    
    const toggleModal = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);
    
    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal
    };
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
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    // Si el modal no está abierto, no renderizamos nada
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-auto p-6 shadow-lg relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label="Cerrar modal"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                {title && (
                    <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                )}
                
                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalTemplate;