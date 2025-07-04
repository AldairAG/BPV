/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Trash2, MinusCircle, PlusCircle, ShoppingCart, Percent, CheckCircle, Printer, UserPlus, User, X, WifiOff } from "lucide-react";
import { type CarritoItem } from "../../hooks/useCarrito";
import { Card, CardContent, CardHead, CardTittle } from "../ui/Card";
import { Button } from "../ui/Button";
import useUser from "../../hooks/useUser";
import ModalTemplate, { useModal } from "../modal/ModalTemplate";
import ModalCliente from "../modal/ModalCliente";
import useCliente from "../../hooks/useCliente";
import type { ClienteType } from "../../types/ClienteType";
import { useConnectionStatus } from "../../service/ConnectionService";
import TicketPrint from "../../service/TicketPrint";

interface CarritoProps {
    items: CarritoItem[];
    total: number;
    loading: boolean;
    onRemoveItem: (productoId: number) => void;
    onUpdateQuantity: (productoId: number, cantidad: number) => Promise<boolean>;
    onClearCart: () => void;
    onProcessPurchase: (conIva:boolean,cliente:ClienteType|null,descuenos:Record<number, number>) => Promise<void>;
}

const Carrito: React.FC<CarritoProps> = (props) => {
    const {
        items,
        loading,
        onRemoveItem,
        onUpdateQuantity,
        onClearCart,
        onProcessPurchase
    } = props;

    const [includeIVA, setIncludeIVA] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [descuentos, setDescuentos] = useState<Record<number, number>>({});
    const [ventaParaImprimir, setVentaParaImprimir] = useState<any>(null);
    const [ventaCompletada, setVentaCompletada] = useState(false);
    const [detallesVenta, setDetallesVenta] = useState({ total: 0, timestamp: "" });
    const [errorImpresion, setErrorImpresion] = useState<string | null>(null);
    const [mostrarTicket, setMostrarTicket] = useState(true);
    const isOnline = useConnectionStatus();

    const { isOpen, openModal, closeModal } = useModal();
    const { user } = useUser();
    const { 
        clienteSeleccionado, 
        seleccionarCliente,
        clearSeleccion, 
    } = useCliente();

    const printAreaRef = useRef<HTMLDivElement>(null);
    const isEmpty = items.length === 0;

    // Calcular el total con descuentos aplicados
    const calcularTotalConDescuentos = () => {
        let totalConDescuentos = 0;
        items.forEach(item => {
            const descuento = descuentos[item.producto.productoId] || 0;
            const precioConDescuento = item.producto.precio * (1 - descuento / 100);
            totalConDescuentos += precioConDescuento * item.cantidad;
        });
        return totalConDescuentos;
    };

    const totalFinal = calcularTotalConDescuentos();
    const subtotal = totalFinal.toFixed(2).endsWith('.99') 
        ? Math.ceil(totalFinal) 
        : totalFinal;
    const iva = includeIVA ? subtotal * 0.16 : 0;

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

    const handleDescuentoChange = (productoId: number, value: string) => {
        const descuento = parseFloat(value) || 0;
        setDescuentos(prev => ({
            ...prev,
            [productoId]: descuento
        }));
    };

    const handleRemoveCliente = () => {
        clearSeleccion();
    };

    // PROCESAR VENTA
    const handleProcessPurchase = async () => {
        if (!isEmpty && !loading) {
            try {

               await onProcessPurchase(includeIVA,clienteSeleccionado,descuentos);

                /*Guardar detalles para mostrar en la confirmación
                setDetallesVenta({
                    total: totalFinal+iva,
                    timestamp: new Date().toLocaleString()
                });
                
                // Procesar la venta
                await procesarVenta(includeIVA,clienteSeleccionado);  */

                const fechaVenta = new Date().toLocaleString();
                const totalVenta = Number((totalFinal + iva).toFixed(2));
                const ventaData = {
                    fecha: fechaVenta,
                    ticketNumber: `${Date.now().toString().slice(-6)}`,
                    vendedor: user?.nombre || 'Usuario Sistema',
                    cliente: clienteSeleccionado ? { nombre: clienteSeleccionado.nombre } : undefined,
                    items: items.map(item => ({
                        producto: {
                            nombre: item.producto.nombre,
                            precioVenta: Number(item.producto.precio)
                        },
                        cantidad: Number(item.cantidad),
                        descuento: descuentos[item.producto.productoId] || 0 // <--- descuento aplicado
                    })),
                    subtotal: Number(totalFinal.toFixed(2)),
                    iva: Number(iva.toFixed(2)),
                    total: Number((totalFinal + iva).toFixed(2)),
                    conIva: includeIVA
                };
                // Validar que haya productos en la venta  

                if (!ventaData.items || ventaData.items.length === 0) {
                    setErrorImpresion("No hay productos en la venta.");
                    return;
                }

                // Al completar la venta:
                setVentaParaImprimir(ventaData);
                localStorage.setItem("ventaParaImprimir", JSON.stringify(ventaData));
                setVentaCompletada(true);
                localStorage.setItem("ventaCompletada", "true");
                setDetallesVenta({ total: totalVenta, timestamp: fechaVenta });
                localStorage.setItem("detallesVenta", JSON.stringify({ total: totalVenta, timestamp: fechaVenta }));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setErrorImpresion("Error al procesar la venta.");
            }
        }
    };

    const handleSelectCliente = (cliente:ClienteType) => {
        seleccionarCliente(cliente);
    };

    // SOLO muestra el ticket cuando el usuario da click en imprimir
    const handlePrint = () => {
        if (!ventaParaImprimir || !ventaParaImprimir.items || ventaParaImprimir.items.length === 0) {
            setErrorImpresion("No hay datos para imprimir el ticket.");
            return;
        }
        setMostrarTicket(true);
        window.print()
        setMostrarTicket(true);

    };

    // LIMPIAR CARRITO 
    const handleNuevaVenta = () => {
        setVentaCompletada(false);
        setVentaParaImprimir(null);
        setDetallesVenta({ total: 0, timestamp: "" });
        setDescuentos({}); // ELIMINA DESCUENTOS
        clearSeleccion();   // ELIMINA AL CLIENTE
        localStorage.removeItem("ventaParaImprimir");
        localStorage.removeItem("ventaCompletada");
        localStorage.removeItem("detallesVenta");
        onClearCart();
    };

    // Restaura ventaParaImprimir y ventaCompletada al montar
    useEffect(() => {
        const ventaGuardada = localStorage.getItem("ventaParaImprimir");
        const ventaCompletadaGuardada = localStorage.getItem("ventaCompletada");
        const detallesVentaGuardados = localStorage.getItem("detallesVenta");
        if (ventaGuardada) {
            setVentaParaImprimir(JSON.parse(ventaGuardada));
        }
        if (ventaCompletadaGuardada === "true") {
            setVentaCompletada(true);
        }
        if (detallesVentaGuardados) {
            setDetallesVenta(JSON.parse(detallesVentaGuardados));
        }
    }, []);

    return (
        <>
            <Card className="w-full bg-gray-800 text-white">
                <CardHead className="border-b border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <CardTittle className="text-xl flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Carrito de compra
                        </CardTittle>
                        <div className="flex items-center gap-2">
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
                    </div>
                </CardHead>

                <CardContent className="flex flex-col gap-4 p-4">
                    {/* Mostrar mensaje de modo offline */}
                    {!isOnline && !ventaCompletada && (
                        <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-3 flex items-center gap-3 mb-2">
                            <WifiOff className="h-5 w-5 text-yellow-500" />
                            <div className="text-sm text-yellow-200">
                                Modo sin conexión. Las ventas se guardarán localmente y se sincronizarán cuando vuelva la conexión a internet.
                            </div>
                        </div>
                    )}

                    {/* Sección para mostrar cliente seleccionado */}
                    {!ventaCompletada && !isEmpty && (
                        <div className="bg-gray-700/50 rounded-md p-3 border border-gray-700">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-medium flex items-center gap-1 text-gray-300">
                                    <User className="h-4 w-4" />
                                    Cliente
                                </h3>
                                {clienteSeleccionado && (
                                    <Button
                                        onClick={handleRemoveCliente}
                                        className="text-gray-400 hover:text-red-300 p-0 h-auto"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {clienteSeleccionado?.idCliente != null ? (
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">{clienteSeleccionado.nombre}</span>
                                    <span className="text-xs text-gray-400">ID: {clienteSeleccionado.idCliente}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">No hay cliente seleccionado</span>
                                    <Button
                                        onClick={openModal}
                                        className="text-blue-400 hover:text-blue-300 text-xs py-0 h-6"
                                    >
                                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                                        Seleccionar
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mensaje de venta completada con botón de impresión */}
                    {ventaCompletada && ventaParaImprimir && (
                        <div className="flex flex-col items-center justify-center py-8 text-center border border-green-500 bg-green-900/20 rounded-lg mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-green-400">¡Venta completada con éxito!</h3>
                            <p className="text-gray-300 mt-2">
                                Total: <span className="font-bold">${detallesVenta.total.toFixed(2)}</span>
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                {detallesVenta.timestamp}
                            </p>
                            <div className="flex flex-col gap-2 w-full max-w-xs mt-6">
                                <Button
                                    onClick={handlePrint}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimir ticket
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleNuevaVenta}
                                >
                                    Realizar nueva venta
                                </Button>
                            </div>
                            {errorImpresion && (
                                <div className="text-red-400 mt-2">{errorImpresion}</div>
                            )}
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
                                const precioConDescuento = item.producto.precio * (1 - descuento / 100);
                                const rawSubtotal = precioConDescuento * item.cantidad;
                                const subtotalItem = rawSubtotal.toFixed(2).endsWith('.99') 
                                    ? Math.ceil(rawSubtotal) 
                                    : rawSubtotal;


                                return (
                                    <div key={item.producto.productoId} className="flex flex-col py-3 border-b border-gray-700 last:border-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium">{item.producto.nombre}</h4>
                                                <div className="flex items-center text-sm text-gray-400 mt-1">
                                                    <span className={descuento > 0 ? "line-through text-gray-500" : ""}>
                                                        ${item.producto.precio.toFixed(2)} c/u
                                                    </span>
                                                    {descuento > 0 && (
                                                        <span className="ml-2 text-green-400">
                                                            ${descuento < 1 
                                                                ? precioConDescuento.toFixed(3) 
                                                                : precioConDescuento.toFixed(2)} c/u
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
                                                {item.producto.descuentos && item.producto.descuentos.length > 0 ? (
                                                    <select
                                                        className="bg-gray-700 text-sm text-white border-0 focus:outline-none focus:ring-0 p-0 appearance-none cursor-pointer min-w-[120px]"
                                                        style={{
                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                                                            backgroundRepeat: "no-repeat",
                                                            backgroundPosition: "right 0.25rem center",
                                                            backgroundSize: "16px 16px",
                                                            paddingRight: "1.5rem"
                                                        }}
                                                        value={descuento || "0"}
                                                        onChange={(e) => handleDescuentoChange(item.producto.productoId, e.target.value)}
                                                        disabled={loading}
                                                    >
                                                        <option value="0">Sin descuento</option>
                                                        {item.producto.descuentos.map((desc, index) => (
                                                            <option key={index} value={desc}>
                                                                {desc}% de descuento
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Sin descuentos disponibles</span>
                                                )}
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
                            <span className="text-right font-bold text-xl text-blue-400">${(totalFinal+iva).toFixed(2)}</span>

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

            {/* Modal para agregar cliente */}
            <ModalTemplate
                isOpen={isOpen}
                onClose={closeModal}
                title="Agregar Cliente a la Venta"
            >
                <ModalCliente 
                    onSelectCliente={handleSelectCliente}
                    onClose={closeModal} 
                />
            </ModalTemplate>

            {/* Área oculta para impresión */}
            {mostrarTicket && ventaParaImprimir && (
              <div className="print-area" id="ticket-print-area" ref={printAreaRef}>
                <TicketPrint venta={ventaParaImprimir} />
              </div>
            )}
        </>
    );
}

export default Carrito;



