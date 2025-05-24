import { Droplets, Package } from "lucide-react";
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