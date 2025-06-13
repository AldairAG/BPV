import { useState } from "react";
import type { ProductoType } from "../../types/ProductoType";

const ItemFilaProducto = ({ producto, handleModificarProducto }: { producto: ProductoType, handleModificarProducto: (index: number, value: number, name: string) => void }) => {

    const [descuento, setDescuento] = useState<number>(0);
    const [cantidad, setCantidad] = useState<number>(1);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        console.log(`onChange: ${e.target.name} = ${e.target.value} for producto ID ${producto.productoId}`);
        
        if (e.target.name === "descuento") {        
            setDescuento(Number(e.target.value));
        } else if (e.target.name === "cantidad") {
            setCantidad(Number(e.target.value));
        }
        handleModificarProducto(producto.productoId, Number(e.target.value), e.target.name);
    }; 

    return (
        <tr className="hover:bg-blue-100/60 print:hover:bg-white">
            <td className="px-2 py-1">
                <input type="text"
                    value={producto?.nombre}
                    placeholder="Nombre del producto"
                    className="text-blue-900 bg-transparent border-b border-blue-100 focus:outline-none focus:border-blue-500 transition w-full px-1 py-0.5 print:bg-whitez"
                />
            </td>
            <td className="px-2 py-1">
                <input
                    type="number"
                    min={1}
                    name="cantidad"
                    className="w-14 border-b border-blue-100 bg-transparent px-1 py-0.5 focus:outline-none focus:border-blue-500 transition text-right text-blue-900 print:bg-white"
                    value={cantidad}
                    onChange={e => onChange(e)}
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
                    name="descuento"
                    className="w-full border-b border-blue-100 bg-transparent px-1 py-0.5 focus:outline-none focus:border-blue-500 transition text-blue-900 print:bg-white"
                    value={descuento|| 0}
                    onChange={e => onChange(e)}
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
                    (cantidad*producto.precio)-((descuento/100)*(producto?.precio*cantidad))
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