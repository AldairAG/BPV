import { Plus } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { ADMIN_ROUTES } from "../../../constants/routes";

const Productos = () => {
    return (
        <section className="flex flex-col w-full h-full p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Productos</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Input
                            id="search"
                            className="w-xs "
                            placeholder="Buscar productos..."
                            type="search"
                            value="" />
                    </div>
                    <Button onClick={() => { window.location.href = ADMIN_ROUTES.CREAR_PRODUCTO; }}>
                        <Plus className={"w-5 h-5 text-blue-700"} />
                        Nuevo Producto
                    </Button>
                </div>
            </div>
            <div className=" rounded-lg border shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&amp;_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Producto</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Categoría</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Tipo</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 text-right">Precio</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 text-right">Stock</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="[&amp;_tr:last-child]:border-0">
                            {/*itemProducto */}
                        </tbody>
                    </table>
                </div>
            </div>

        </section>
    );
}
export default Productos;