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
        tipoGranel?: 'volumen' | 'peso'; // Se mantiene para compatibilidad pero solo usamos 'volumen'
    };
    onConfirm: (cantidad: number, tipoCantidad: 'volumen' | 'precio') => Promise<void>;
}

const ModalProductoGranel: React.FC<ModalProductoGranelProps> = ({
    isOpen,
    onClose,
    producto,
    onConfirm
}) => {
    // Tipo de venta: por volumen o precio (eliminamos 'peso')
    const [tipoVenta, setTipoVenta] = useState<'volumen' | 'precio'>('volumen');
    const [unidad, setUnidad] = useState<'ml' | 'l' | '$'>('ml');
    const [cantidad, setCantidad] = useState<number>(500);
    const [cantidadInput, setCantidadInput] = useState<string>("500");
    const [loading, setLoading] = useState(false);

    // Reiniciar valores cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            // Siempre usamos volumen como tipo de granel predeterminado
            setTipoVenta('volumen');
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

    const seleccionarCantidadPredefinida = (cantidad: number, unidad: 'ml' | 'l' | '$') => {
        setCantidad(cantidad);
        setCantidadInput(cantidad.toString());
        setUnidad(unidad);
    };

    const cambiarTipoVenta = (tipo: 'volumen' | 'precio') => {
        setTipoVenta(tipo);
        
        // Resetear valores según el tipo seleccionado
        if (tipo === 'volumen') {
            setCantidad(500);
            setCantidadInput("500");
            setUnidad('ml');
        } else { // precio
            setCantidad(100);
            setCantidadInput("100");
            setUnidad('$');
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            let cantidadFinal;
            
            if (tipoVenta === 'precio') {
                // Para venta por precio, pasamos el monto y el sistema calculará internamente
                cantidadFinal = Number((cantidad/producto.precioVenta).toFixed(3)); // Convertir a litros
                console.log(`Confirmando ${cantidadFinal*producto.precioVenta} pesos del producto`);
            } else { // volumen
                cantidadFinal = unidad === 'l' ? cantidad : cantidad/1000;
                console.log(`Confirmando ${cantidadFinal} litros del producto`);
            }
            
            await onConfirm(cantidadFinal, tipoVenta);
            onClose();
        } catch (error) {
            console.error("Error al confirmar cantidad:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cálculos de conversiones y subtotal
    let subtotal = 0;
    let cantidadProducto = '';
    
    if (tipoVenta === 'precio') {
        subtotal = cantidad;
        // Calcular cuánto producto se recibirá por ese precio
        const cantidadPorPrecio = cantidad / producto.precioVenta;
        
        // Siempre calculamos en volumen
        if (cantidadPorPrecio >= 1) {
            cantidadProducto = `${cantidadPorPrecio.toFixed(3)} L`;
        } else {
            cantidadProducto = `${(cantidadPorPrecio * 1000).toFixed(0)} ml`;
        }
    } else { // volumen
        const cantidadEnLitros = unidad === 'l' ? cantidad : cantidad / 1000;
        subtotal = producto.precioVenta * cantidadEnLitros;
    }

    // Configurar opciones según el tipo de venta
    let unidadesDisponibles = [];
    let cantidadesPredefinidas = [];
    
    if (tipoVenta === 'precio') {
        unidadesDisponibles = [{ value: '$', label: '$' }];
        cantidadesPredefinidas = [
            { cantidad: 50, unidad: '$', label: '$50' },
            { cantidad: 100, unidad: '$', label: '$100' },
            { cantidad: 200, unidad: '$', label: '$200' },
            { cantidad: 500, unidad: '$', label: '$500' },
            { cantidad: 1000, unidad: '$', label: '$1000' }
        ];
    } else { // volumen
        unidadesDisponibles = [{ value: 'ml', label: 'ml' }, { value: 'l', label: 'L' }];
        cantidadesPredefinidas = [
            { cantidad: 100, unidad: 'ml', label: '100ml' },
            { cantidad: 250, unidad: 'ml', label: '250ml' },
            { cantidad: 500, unidad: 'ml', label: '500ml' },
            { cantidad: 750, unidad: 'ml', label: '750ml' },
            { cantidad: 1, unidad: 'l', label: '1 Litro' }
        ];
    }

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

                {/* Selector de tipo de venta - solo volumen y precio */}
                <div className="flex justify-center gap-2 mb-2">
                    <Button
                        onClick={() => cambiarTipoVenta('volumen')} 
                        className={`${tipoVenta === 'volumen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} flex-1`}
                    >
                        Por volumen
                    </Button>
                    <Button
                        onClick={() => cambiarTipoVenta('precio')}
                        className={`${tipoVenta === 'precio' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} flex-1`}
                    >
                        Por precio
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <label className="w-24 text-gray-700 dark:text-gray-300">
                        {tipoVenta === 'precio' ? 'Monto:' : 'Cantidad:'}
                    </label>
                    <input
                        type="text"
                        min="0"
                        step="0.01"
                        value={cantidadInput}
                        onChange={handleCantidadChange}
                        className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {tipoVenta !== 'precio' && (
                        <select
                            value={unidad}
                            onChange={(e) => setUnidad(e.target.value as any)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {unidadesDisponibles.map(opcion => (
                                <option key={opcion.value} value={opcion.value}>
                                    {opcion.label}
                                </option>
                            ))}
                        </select>
                    )}
                    {tipoVenta === 'precio' && (
                        <span className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            $
                        </span>
                    )}
                </div>

                {/* Cantidades predefinidas */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {cantidadesPredefinidas.slice(0, 4).map((opcion, index) => (
                        <Button
                            key={index}
                            onClick={() => seleccionarCantidadPredefinida(opcion.cantidad, opcion.unidad as any)}
                        >
                            {opcion.label}
                        </Button>
                    ))}
                    <Button
                        onClick={() => seleccionarCantidadPredefinida(cantidadesPredefinidas[4].cantidad, cantidadesPredefinidas[4].unidad as any)}
                        className='col-span-4'
                    >
                        {cantidadesPredefinidas[4].label}
                    </Button>
                </div>

                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Subtotal:</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${subtotal.toFixed(2)}
                        </span>
                    </div>
                    
                    {/* Mostrar cantidad equivalente cuando se vende por precio */}
                    {tipoVenta === 'precio' && (
                        <div className="flex justify-between items-center mt-2">
                            <span className="font-medium text-gray-800 dark:text-gray-200">Cantidad:</span>
                            <span className="text-lg text-green-600 dark:text-green-400">
                                {cantidadProducto}
                            </span>
                        </div>
                    )}
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