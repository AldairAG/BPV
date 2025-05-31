import { useState, useEffect } from "react";
import { Trash2, MinusCircle, PlusCircle, ShoppingCart, Percent, CheckCircle } from "lucide-react";
import type { CarritoItem } from "../../hooks/useCarrito";
import { Card, CardContent, CardHead, CardTittle } from "../ui/Card";
import { Button } from "../ui/Button";

interface CarritoProps {
    items: CarritoItem[];
    total: number;
    loading: boolean;
    onRemoveItem: (productoId: number) => void;
    onUpdateQuantity: (productoId: number, cantidad: number) => Promise<boolean>;
    onClearCart: () => void;
    onProcessPurchase: () => Promise<void>;
}


const Carrito: React.FC<CarritoProps> = ({
    items,
    loading,
    onRemoveItem,
    onUpdateQuantity,
    onClearCart,
    onProcessPurchase,
}) => {
    const [includeIVA, setIncludeIVA] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [descuentos, setDescuentos] = useState<Record<number, number>>({});
    const [ventaCompletada, setVentaCompletada] = useState(false);
    const [detallesVenta, setDetallesVenta] = useState({
        total: 0,
        timestamp: ""
    });
    const isEmpty = items.length === 0;

    // Restablecer el mensaje de venta completada cuando cambien los items
    useEffect(() => {
        if (items.length > 0) {
            setVentaCompletada(false);
        }
    }, [items]);

    // Calcular el total con descuentos aplicados
    const calcularTotalConDescuentos = () => {
        let totalConDescuentos = 0;
        items.forEach(item => {
            const descuento = descuentos[item.producto.productoId] || 0;
            const precioConDescuento = item.producto.precioVenta * (1 - descuento / 100);
            totalConDescuentos += precioConDescuento * item.cantidad;
        });
        return totalConDescuentos;
    };

    const totalFinal = calcularTotalConDescuentos();
    
    // Calcular montos
    const subtotal = includeIVA ? totalFinal / 1.16 : totalFinal;
    const iva = includeIVA ? totalFinal - subtotal : 0;

    // Manejar cambios en la cantidad
    const handleQuantityChange = async (productoId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            onRemoveItem(productoId);
            return;
        }

        setUpdatingId(productoId);
        try {
            await onUpdateQuantity(productoId, newQuantity);
        } finally {
            setUpdatingId(null);
        }
    };

    // Manejar cambios en el descuento
    const handleDescuentoChange = (productoId: number, value: string) => {
        const descuento = parseInt(value, 10) || 0;
        // Limitar el descuento entre 0 y 100%
        const descuentoLimitado = Math.min(Math.max(0, descuento), 100);
        
        setDescuentos(prev => ({
            ...prev,
            [productoId]: descuentoLimitado
        }));
    };

    // Procesar la compra
    const handleProcessPurchase = async () => {
        if (!isEmpty && !loading) {
            try {
                await onProcessPurchase();
                // Guardar detalles para mostrar en la confirmación
                setDetallesVenta({
                    total: totalFinal,
                    timestamp: new Date().toLocaleString()
                });
                // Mostrar mensaje de éxito
                setVentaCompletada(true);
            } catch (error) {
                console.error("Error al procesar la venta:", error);
            }
        }
    };

    return (
        <Card className="w-full bg-gray-800 text-white">
            <CardHead className="border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <CardTittle className="text-xl flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Carrito de compra
                    </CardTittle>
                    {!isEmpty && !ventaCompletada && (
                        <Button
                            onClick={onClearCart}
                            className="text-gray-400 hover:text-white flex items-center gap-1"
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Vaciar
                        </Button>
                    )}
                </div>
            </CardHead>

            <CardContent className="flex flex-col gap-4 p-4">
                {/* Mensaje de venta completada */}
                {ventaCompletada && (
                    <div className="flex flex-col items-center justify-center py-8 text-center border border-green-500 bg-green-900/20 rounded-lg mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-green-400">¡Venta completada con éxito!</h3>
                        <p className="text-gray-300 mt-2">
                            Total: <span className="font-bold">${detallesVenta.total.toFixed(2)}</span>
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            {detallesVenta.timestamp}
                        </p>
                        <Button 
                            className="mt-6 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                                setVentaCompletada(false);
                                // Esto es opcional, por si quieres comenzar una nueva venta
                                onClearCart();
                            }}
                        >
                            Realizar nueva venta
                        </Button>
                    </div>
                )}

                {isEmpty && !ventaCompletada ? (
                    <div className="h-full border-b border-b-gray-700 w-full py-12">
                        <div className="flex flex-col items-center justify-center pb-4 gap-2">
                            <ShoppingCart className="h-16 w-16 text-gray-500" />
                            <h3 className="text-gray-400 font-medium">El carrito está vacío</h3>
                            <p className="text-gray-500 text-sm text-center">
                                Agrega productos para comenzar una venta
                            </p>
                        </div>
                    </div>
                ) : !ventaCompletada ? (
                    <div className="max-h-[400px] overflow-y-auto border-b border-b-gray-700 pb-4">
                        {items.map((item) => {
                            const descuento = descuentos[item.producto.productoId] || 0;
                            const precioConDescuento = item.producto.precioVenta * (1 - descuento / 100);
                            const subtotalItem = precioConDescuento * item.cantidad;
                            
                            return (
                                <div key={item.producto.productoId} className="flex flex-col py-3 border-b border-gray-700 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">{item.producto.nombre}</h4>
                                            <div className="flex items-center text-sm text-gray-400 mt-1">
                                                <span className={descuento > 0 ? "line-through text-gray-500" : ""}>
                                                    ${item.producto.precioVenta.toFixed(2)} c/u
                                                </span>
                                                {descuento > 0 && (
                                                    <span className="ml-2 text-green-400">
                                                        ${precioConDescuento.toFixed(2)} c/u
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                <button
                                                    className="text-gray-400 hover:text-white disabled:opacity-50"
                                                    onClick={() => handleQuantityChange(item.producto.productoId, item.cantidad - 1)}
                                                    disabled={loading || updatingId === item.producto.productoId}
                                                >
                                                    <MinusCircle className="h-5 w-5" />
                                                </button>
                                                <span className="mx-2 min-w-[24px] text-center">
                                                    {item.cantidad}
                                                </span>
                                                <button
                                                    className="text-gray-400 hover:text-white disabled:opacity-50"
                                                    onClick={() => handleQuantityChange(item.producto.productoId, item.cantidad + 1)}
                                                    disabled={loading || updatingId === item.producto.productoId || item.cantidad >= item.producto.stock}
                                                >
                                                    <PlusCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <button
                                                className="text-red-400 hover:text-red-300 ml-2"
                                                onClick={() => onRemoveItem(item.producto.productoId)}
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Sección para descuento por producto */}
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-gray-700 rounded px-2 py-1">
                                            <Percent className="h-3 w-3 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="0"
                                                className="bg-transparent w-12 text-sm text-white border-0 focus:outline-none focus:ring-0 p-0"
                                                value={descuento || ""}
                                                onChange={(e) => handleDescuentoChange(item.producto.productoId, e.target.value)}
                                                disabled={loading}
                                            />
                                            <span className="text-xs text-gray-400">%</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-medium">
                                                {descuento > 0 ? (
                                                    <span className="text-green-400">${subtotalItem.toFixed(2)}</span>
                                                ) : (
                                                    <span>${subtotalItem.toFixed(2)}</span>
                                                )}
                                            </span>
                                            {descuento > 0 && (
                                                <span className="text-xs text-green-400 ml-1">
                                                    (-{descuento}%)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                {!ventaCompletada && (
                    <div className="grid grid-cols-2 grid-rows-3 text-white text-lg gap-2 mt-2">
                        <span className="text-gray-300">Subtotal</span>
                        <span className="text-right">${subtotal.toFixed(2)}</span>
                        <span className="text-gray-300">IVA (16%)</span>
                        <span className="text-right">${iva.toFixed(2)}</span>
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-right font-bold text-xl text-blue-400">${totalFinal.toFixed(2)}</span>

                        <div className="col-span-2 text-sm flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="iva"
                                name="iva"
                                className="mr-2 h-4 w-4 rounded-sm border-gray-700 bg-gray-700 text-blue-600 focus:ring-blue-600"
                                checked={includeIVA}
                                onChange={(e) => setIncludeIVA(e.target.checked)}
                                disabled={loading}
                            />
                            <label htmlFor="iva">Incluir IVA en la venta</label>
                        </div>

                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium 
                                    inline-flex items-center col-span-2 mt-4 justify-center 
                                    gap-2 whitespace-nowrap rounded-md text-sm
                                    transition-colors focus-visible:outline-none
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    h-10 px-4 py-2 w-full"
                            onClick={handleProcessPurchase}
                            disabled={isEmpty || loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando venta...
                                </>
                            ) : (
                                "Completar venta"
                            )}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default Carrito;