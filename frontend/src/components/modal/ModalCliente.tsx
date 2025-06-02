import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, UserPlus, CheckCircle, X } from 'lucide-react';
import useCliente from '../../hooks/useCliente';
import type { ClienteType } from '../../types/ClienteType';

interface ModalClienteProps {
    onClose: () => void;
}

const ModalCliente: React.FC<ModalClienteProps> = ({ onClose }) => {
    // Estados para controlar el modo de vista
    const [modo, setModo] = useState<'buscar' | 'crear'>('buscar');
    const [busqueda, setBusqueda] = useState('');
    const [buscando, setBuscando] = useState(false);

    // Estado para el formulario de nuevo cliente
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: ''
    });

    // Usar el hook de cliente
    const {
        clientesFiltrados,
        clienteSeleccionado,
        loading,
        error,
        buscarClientesPorNombre,
        seleccionarCliente,
        createCliente,
        fetchClientes,
        clearSeleccion
    } = useCliente();

    // Cargar clientes al inicio
    useEffect(() => {
        fetchClientes();
        return () => clearSeleccion();
    }, [fetchClientes, clearSeleccion]);

    // Manejar búsqueda de clientes
    const handleBuscarCliente = async () => {
        if (!busqueda.trim()) return;

        setBuscando(true);
        try {
            await buscarClientesPorNombre(busqueda);
        } finally {
            setBuscando(false);
        }
    };


    // Manejar selección de cliente
    const handleSeleccionarCliente = (cliente: ClienteType) => {
        seleccionarCliente(cliente);

        seleccionarCliente(cliente);

        // Cerrar el modal después de seleccionar
        onClose();
    };

    // Manejar cambios en el formulario de nuevo cliente
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNuevoCliente(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Crear nuevo cliente
    const handleCrearCliente = async () => {
        if (!nuevoCliente.nombre.trim()) return;

        setBuscando(true);
        try {
            const clienteCreado = await createCliente({
                nombre: nuevoCliente.nombre,
            });

            seleccionarCliente(clienteCreado);


            // Cerrar el modal después de crear
            onClose();
        } catch (err) {
            console.error("Error al crear cliente:", err);
        } finally {
            setBuscando(false);
        }
    };

    return (
        <div className="text-gray-900 dark:text-white">
            {/* Navegación entre modos */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    className={`py-2 px-4 flex-1 text-center ${modo === 'buscar'
                            ? 'border-b-2 border-blue-500 font-medium text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    onClick={() => setModo('buscar')}
                >
                    Buscar cliente
                </button>
                <button
                    className={`py-2 px-4 flex-1 text-center ${modo === 'crear'
                            ? 'border-b-2 border-blue-500 font-medium text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    onClick={() => setModo('crear')}
                >
                    Nuevo cliente
                </button>
            </div>

            {/* Contenido basado en el modo */}
            {modo === 'buscar' ? (
                <div className="space-y-4">
                    {/* Buscador */}
                    <div className="flex gap-2">
                        <Input
                            id="busqueda"
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleBuscarCliente();
                            }}
                        />
                        <Button
                            onClick={handleBuscarCliente}
                            disabled={buscando || !busqueda.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {buscando ? (
                                <span className="flex items-center gap-1">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Mostrar error si existe */}
                    {error && (
                        <div className="text-red-500 text-sm p-2 bg-red-100 dark:bg-red-900/20 rounded">
                            {error}
                        </div>
                    )}

                    {/* Lista de resultados */}
                    <div className="max-h-[300px] overflow-y-auto border dark:border-gray-700 rounded-md">
                        {loading ? (
                            <div className="flex justify-center items-center h-20">
                                <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : clientesFiltrados.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                {busqueda ?
                                    "No se encontraron clientes con ese nombre" :
                                    "Busca clientes por nombre para ver resultados"}
                            </div>
                        ) : (
                            clientesFiltrados.map(cliente => (
                                <div
                                    key={cliente.idCliente}
                                    className={`p-3 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center ${clienteSeleccionado?.idCliente === cliente.idCliente ?
                                            'bg-blue-50 dark:bg-blue-900/20' : ''
                                        }`}
                                >
                                    <div>
                                        <div className="font-medium">{cliente.nombre}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            ID: {cliente.idCliente}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleSeleccionarCliente(cliente)}
                                        className={
                                            clienteSeleccionado?.idCliente === cliente.idCliente
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        }
                                    >
                                        {clienteSeleccionado?.idCliente === cliente.idCliente ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            "Seleccionar"
                                        )}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-blue-500" />
                        Crear nuevo cliente
                    </h3>

                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                            Nombre completo *
                        </label>
                        <Input
                            id="nombre"
                            name="nombre"
                            type="text"
                            placeholder="Nombre del cliente"
                            value={nuevoCliente.nombre}
                            onChange={handleInputChange}
                            className="w-full"
                            required
                        />
                    </div>
                </div>
            )}

            {/* Botones de acción en footer */}
            <div className="flex justify-end gap-2 mt-6">
                <Button
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                </Button>

                {modo === 'crear' && (
                    <Button
                        onClick={handleCrearCliente}
                        disabled={buscando || !nuevoCliente.nombre.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {buscando ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </span>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Guardar Cliente
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ModalCliente;