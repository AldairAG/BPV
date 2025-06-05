import React, { useState, useEffect } from 'react';
import ModalTemplate from '../modal/ModalTemplate';
import { Button } from '../ui/Button';

interface ModalProductoGranelProps {
    isOpen: boolean;
    onClose: () => void;
    producto: {
        productoId: number;
        nombre: string;
        precioVenta: number;
        esGranel: boolean;
    };
    onConfirm: (cantidad: number) => Promise<void>;
}

const ModalProductoGranel: React.FC<ModalProductoGranelProps> = ({
    isOpen,
    onClose,
    producto,
    onConfirm
}) => {
    const [unidad, setUnidad] = useState<'ml' | 'l'>('ml');
    const [cantidad, setCantidad] = useState<number>(500);
    const [cantidadInput, setCantidadInput] = useState<string>("500");
    const [loading, setLoading] = useState(false);

    // Reiniciar valores cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setCantidad(500);
            setCantidadInput("500");
            setUnidad('ml');
        }
    }, [isOpen]);

    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setCantidadInput(inputValue);
        
        // Convertir a número con decimales
        const valor = parseFloat(inputValue);
        if (!isNaN(valor) && valor >= 0) {
            setCantidad(valor);
        }
    };

    const seleccionarCantidadPredefinida = (ml: number) => {
        setCantidad(ml);
        setCantidadInput(ml.toString());
        setUnidad('ml');
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            // Convertir a litros si es necesario para el cálculo
            const cantidadFinal = unidad === 'l' ? cantidad : cantidad / 1000;
            console.log(`Confirmando ${cantidadFinal} litros del producto ${cantidad}`);
            
            await onConfirm(cantidadFinal);
            onClose();
        } catch (error) {
            console.error("Error al confirmar cantidad:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calcular subtotal
    const cantidadEnLitros = unidad === 'l' ? cantidad : cantidad / 1000;
    const subtotal = producto.precioVenta * cantidadEnLitros;

    return (
        <ModalTemplate
            isOpen={isOpen}
            onClose={onClose}
            title="Producto a granel"
        >
            <div className="flex flex-col gap-4">
                <div className="text-center mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {producto.nombre}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Precio: ${producto.precioVenta.toFixed(2)} por litro
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <label className="w-24 text-gray-700 dark:text-gray-300">Cantidad:</label>
                    <input
                        type="text"
                        min="0"
                        step="0.01"
                        value={cantidadInput}
                        onChange={handleCantidadChange}
                        className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <select
                        value={unidad}
                        onChange={(e) => setUnidad(e.target.value as 'ml' | 'l')}
                        className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="ml">ml</option>
                        <option value="l">L</option>
                    </select>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                    <Button
                        onClick={() => seleccionarCantidadPredefinida(100)}
                    >
                        100ml
                    </Button>
                    <Button
                        onClick={() => seleccionarCantidadPredefinida(250)}
                    >
                        250ml
                    </Button>
                    <Button
                        onClick={() => seleccionarCantidadPredefinida(500)}
                    >
                        500ml
                    </Button>
                    <Button
                        onClick={() => seleccionarCantidadPredefinida(750)}
                    >
                        750ml
                    </Button>
                    <Button
                        onClick={() => {
                            setCantidad(1);
                            setCantidadInput("1");
                            setUnidad('l');
                        }}
                        className='col-span-4'
                    >
                        1 Litro
                    </Button>
                </div>

                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Subtotal:</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${subtotal.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading || cantidad <= 0}
                    >
                        {loading ? "Agregando..." : "Confirmar"}
                    </Button>
                </div>
            </div>
        </ModalTemplate>
    );
};

export default ModalProductoGranel;