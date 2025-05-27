import { Droplets, Package, SquarePen, Trash2 } from "lucide-react";
import { Badge, Card } from "../ui/Card";

const ItemProductoCajero = () => {
    return (
        <Card className="rounded-lg border text-card-foreground shadow-sm 
            overflow-hidden hover:shadow-md transition-shadow bg-gray-700
            border-t-blue-500 p-2 border-t-5"
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded-full bg-white">
                        <Droplets className="w-5 h-5 text-blue-700" />
                    </div>
                </div>

                <h3 className="font-medium text-lg mb-1 
                    line-clamp-2">
                    Detergente Multiusos
                </h3>

                <div className="flex justify-between items-center mb-2">
                    <Badge className="bg-blue-100 text-blue-700">
                        Limpiadores
                    </Badge>
                    <p className="font-bold text-blue-700">
                        $45.99
                    </p>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-2">
                        <Package className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">
                            Unidad
                        </span>
                    </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                    Stock: 25 unidad
                </div>

            </div>
            <div className="flex items-center p-3 pt-0">
                <button className="text-white inline-flex items-center 
                    justify-center gap-2 whitespace-nowrap text-sm 
                    font-medium ring-offset-background transition-colors 
                    focus-visible:outline-none focus-visible:ring-2 
                    focus-visible:ring-ring focus-visible:ring-offset-2 
                    disabled:pointer-events-none disabled:opacity-50 
                    [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 
                    [&amp;_svg]:shrink-0 bg-blue-700 text-primary-foreground 
                    hover:bg-primary/90 h-9 rounded-md px-3 w-full">
                    Agregar
                </button>
            </div>
        </Card>
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