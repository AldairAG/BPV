import { Plus, SquarePen, Trash2 } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

const Usuarios = () => {
    return (
        <main className="flex-1 container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <div className="flex items-center space-x-4">
                    <Input 
                        id="search"
                        className="w-md"
                        placeholder="Buscar usuarios..."
                        type="search"
                    />
                    <Button
                    >
                        <Plus className={'w-5 h-5 text-white'} />
                        Nuevo Usuario
                    </Button>
                </div>
            </div>
            <div className=" rounded-lg border shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&amp;_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Usuario</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Rol</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Sucursal</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Último Acceso</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Estado</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="[&amp;_tr:last-child]:border-0">

                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                    <div>
                                        <div className="font-medium">Ana Martínez</div>
                                        <div className="text-sm text-gray-500">@cajero2</div>
                                    </div>
                                </td>
                                <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-indigo-100 text-indigo-800">Cajero</div>
                                </td>
                                <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">ana@cleanpos.com</td>
                                <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">Norte</td>
                                <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">12/05/2025 10:15</td>
                                <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                    <div className="flex items-center">
                                        <button type="button" role="switch" aria-checked="true" data-state="checked" value="on" className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input">
                                            <span data-state="checked" className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0">
                                            </span>
                                        </button>
                                        <span className="ml-2">
                                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-green-50 text-green-700 border-green-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-check h-3 w-3 mr-1">
                                                    <path d="M20 6 9 17l-5-5">
                                                    </path>
                                                </svg>Activo</div>
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                            <SquarePen className={'w-5 h-5 text-white'} />
                                        </button>
                                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                            <Trash2 className={'w-5 h-5 text-red-600'} />
                                        </button>
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

export default Usuarios;