import { useState } from "react";
import { Droplets, Package, ShoppingCart, Plus, Check, SquarePen, Trash2, Home } from "lucide-react";
import { Badge, Card } from "../ui/Card";
import type { ProductoType } from "../../types/ProductoType";
import ModalProductoGranel from "../carrito/ModalProductoGranel";
import { TIPOS_PRODUCTO } from "../../constants/tipoProducto";

interface ItemProductoCajeroProps {
    producto: ProductoType;
    onAddToCart: (cantidad?: number) => void;
    inCart?: boolean;
    quantity?: number;
}

const ItemProductoCajero: React.FC<ItemProductoCajeroProps> = ({
    producto,
    onAddToCart,
    inCart = false,
    quantity = 0
}) => {
    // Estado para controlar el modal de productos a granel
    const [modalGranelOpen, setModalGranelOpen] = useState(false);

    // Verificar si hay stock disponible
    const outOfStock = producto.stock <= 0;
    const lowStock = producto.stock <= producto.stockMinimo;
    const esLiquido = producto.tipo === TIPOS_PRODUCTO.GRANEL;

    // Manejador para agregar al carrito
    const handleAddToCart = () => {

        if (esLiquido) {
            // Si es líquido, mostrar el modal
            setModalGranelOpen(true);
        } else {
            // Si no es líquido, agregar directamente al carrito
            onAddToCart();
        }
    };

    // Confirmar cantidad seleccionada en el modal
    const handleConfirmGranel = async (cantidad: number) => {
        console.log(`Cantidad seleccionada para ${producto.nombre}:`, cantidad);
        await onAddToCart(cantidad);
    };

    return (
        <>
            <Card className={`rounded-lg text-card-foreground shadow-sm 
                overflow-hidden transition-all bg-gray-700 border-0
                ${inCart ? 'border-t-green-500 hover:shadow-green-600/20' : 'border-t-blue-500 hover:shadow-blue-600/20'} 
                p-2 border-t-2 hover:shadow-lg relative`}
            >
                {inCart && (
                    <div className="absolute -top-2 -right-2 rounded-full bg-green-500 p-1">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                )}

                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-full ${outOfStock ? 'bg-red-100' : 'bg-white'}`}>
                            {producto.tipo === TIPOS_PRODUCTO.PIEZA ? (
                                <Package className={`w-5 h-5 ${outOfStock ? 'text-red-700' : 'text-blue-700'}`} />
                            ) : (
                                <Droplets className={`w-5 h-5 ${outOfStock ? 'text-red-700' : 'text-blue-700'}`} />
                            )}
                        </div>

                        {inCart && quantity > 0 && (
                            <div className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold">
                                {quantity}
                            </div>
                        )}
                    </div>

                    <h3 className="font-medium text-lg mb-1 line-clamp-2 text-white">
                        {producto.nombre || "sin nombre"}
                    </h3>

                    <div className="flex justify-between items-center mb-2">
                        <Badge
                            className="bg-blue-100 text-blue-700"
                            style={{ backgroundColor: producto.categoria?.color, color: '#fff' }}
                        >
                            {producto.categoria?.nombre || "Sin Categoría"}
                        </Badge>
                        <p className="font-bold text-blue-300">
                            ${producto.precio.toFixed(2) || "0.00"}
                        </p>
                    </div>

                    <div className="text-xs text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Package className="w-3 h-3 text-gray-300" />
                            <span className="text-sm">
                                {producto.tipo || "sin unidad"}
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                            <Home className="w-3 h-3 text-gray-300" />
                            <span className="text-sm">
                                {producto.sucursal || "sin sucursal"}
                            </span>
                        </div>
                    </div>

                    <div className={`text-xs mb-3 ${lowStock ? 'text-red-400' : 'text-gray-300'}`}>
                        Stock: {producto.stock || "0"} {producto.tipo === TIPOS_PRODUCTO.PIEZA ? "pz" : "lt"}
                        {lowStock && producto.stock > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded-full">
                                Stock bajo
                            </span>
                        )}
                        {outOfStock && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded-full">
                                Sin stock
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center p-3 pt-0">
                    {inCart ? (
                        <button
                            onClick={handleAddToCart}
                            className="text-white inline-flex items-center 
                                justify-center gap-2 whitespace-nowrap text-sm 
                                font-medium transition-colors 
                                focus-visible:outline-none
                                bg-green-600 hover:bg-green-700
                                h-9 rounded-md px-3 w-full"
                            title="Agregar más unidades"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar más
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            disabled={outOfStock}
                            className="text-white inline-flex items-center 
                                justify-center gap-2 whitespace-nowrap text-sm 
                                font-medium transition-colors 
                                focus-visible:outline-none
                                bg-blue-700 hover:bg-blue-800
                                disabled:bg-gray-600 disabled:text-gray-400
                                h-9 rounded-md px-3 w-full"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {outOfStock ? "Sin stock" : esLiquido ? "Seleccionar cantidad" : "Agregar"}
                        </button>
                    )}
                </div>
            </Card>

            {/* Modal para productos líquidos */}
            {producto.tipo === TIPOS_PRODUCTO.GRANEL && (
                <ModalProductoGranel
                    isOpen={modalGranelOpen}
                    onClose={() => setModalGranelOpen(false)}
                    producto={{
                        productoId: producto.productoId,
                        nombre: producto.nombre,
                        precioVenta: producto.precio,
                        esGranel: true
                    }}
                    onConfirm={handleConfirmGranel}
                />
            )}
        </>
    );
}

export default ItemProductoCajero;

export const ItemProducto = () => {
    return (
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">

            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                <div className="flex items-center">
                    <div className="p-2 rounded-full mr-3 bg-blue-50 text-blue-800">
                        <Package className={'w-5 h-5 text-gray-900'} />
                    </div>
                    <div>
                        <div className="font-medium">Detergente Multiusos</div>
                        <div className="text-xs text-gray-500">
                        </div>
                    </div>

                </div>
            </td>

            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-blue-50 text-blue-800">Limpiadores</div>
            </td>

            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">Unidad</td>
            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-right font-medium">$45.99</td>
            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-right">25</td>
            <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-right">
                <div className="flex justify-end space-x-2">
                    <button className="bg-sky-600 hover:cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                        <SquarePen className="w-4 h-4 text-white" />
                        Editar
                    </button>
                    <button className="bg-red-600 hover:cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 rounded-md px-3">
                        <Trash2 className="w-4 h-4 text-white" />
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    )
}