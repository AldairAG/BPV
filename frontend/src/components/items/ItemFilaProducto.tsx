import { useState } from "react";
import ProductoService from "../../service/ProductoService";
import type { ProductoType } from "../../types/ProductoType";

const ItemFilaProducto = () => {

    const [producto, setProducto] = useState<ProductoType>();
    const [cantidad, setCantidad] = useState<number>(1);
    const [descuento, setDescuento] = useState<number>(0);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        findProducto(e.target.value);
    };

    const findProducto = async (texto: string) => {
        const response = await ProductoService.buscarProductos(texto);
        if (Array.isArray(response)) {
            setProducto(response[0]);
        }
    }

    return (
        <tr className="hover:bg-blue-100/60 print:hover:bg-white">
            <td className="px-2 py-1">
                <input type="text"
                    value={producto?.nombre}
                    onChange={e => onChange(e)}
                    placeholder="Nombre del producto"
                    className="text-blue-900 bg-transparent border-b border-blue-100 focus:outline-none focus:border-blue-500 transition w-full px-1 py-0.5 print:bg-whitez"
                />
            </td>
            <td className="px-2 py-1">
                <input
                    type="number"
                    min={1}
                    className="w-14 border-b border-blue-100 bg-transparent px-1 py-0.5 focus:outline-none focus:border-blue-500 transition text-right text-blue-900 print:bg-white"
                    value={cantidad}
                    onChange={e => setCantidad(Number(e.target.value))}
                />
            </td>
            <td className="px-2 py-1">
                <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-16 border-b border-blue-100 bg-transparent px-1 py-0.5 focus:outline-none focus:border-blue-500 transition text-right text-blue-900 print:bg-white"
                    value={producto?.precio}
                />
            </td>
            <td className="px-2 py-1">
                <select
                    className="w-full border-b border-blue-100 bg-transparent px-1 py-0.5 focus:outline-none focus:border-blue-500 transition text-blue-900 print:bg-white"
                    value={producto?.descuentos?.[0] || 0}
                    onChange={e => setDescuento(Number(e.target.value))}
                >
                    {producto?.descuentos?.map((desc, idx) => (
                        <option key={idx} value={desc}>
                            {desc}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-2 py-1 text-right font-mono bg-blue-100 text-blue-900 print:bg-white">
                {(
                    cantidad *
                    (producto?.precio||0 - (producto?.precio||0 * descuento) / 100)
                ).toFixed(2)}
            </td>
            <td className="px-2 py-1 text-center">
                {/*                 {showRemove && (
                    <button
                        className="text-red-500 font-bold px-2 hover:text-red-700 print:hidden"
                        onClick={onRemove}
                        type="button"
                        title="Quitar producto"
                    >
                        ×
                    </button>
                )} */}
            </td>
        </tr>
    );
}

export default ItemFilaProducto;