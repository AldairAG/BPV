import { Card, CardContent, CardHead, CardTittle } from "../ui/Card";

const Carrito = () => {
    return (
        <Card >
            <CardHead >
                <CardTittle className="text-xl">Carrito de compra</CardTittle>
            </CardHead>

            <CardContent className="flex flex-col gap-4">

                <div className="h-full border-b border-b-gray-500 w-full">
                    <div className="flex items-center justify-center pb-4">
                        <h3 className="text-gray-300 font-bold">El carrito está vacío</h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 grid-rows-3 text-white text-lg gap-2">
                    <span>Subtotal</span>
                    <span className="text-right">$0.00</span>
                    <span>IVA(16%)</span>
                    <span className="text-right">$0.00</span>
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-right font-bold text-xl">$0.00</span>

                    <div className="col-span-2 text-sm">
                        <label htmlFor="iva">¿Desea incluir IVA?</label>
                        <input type="checkbox" id="iva" name="iva" className="ml-2 rounded-lg" />
                    </div>

                    <button className="bg-sky-600 text-white inline-flex items-center col-span-2 mt-4
                            justify-center 
                            gap-2 whitespace-nowrap rounded-md text-sm font-medium 
                            ring-offset-background transition-colors 
                            focus-visible:outline-none focus-visible:ring-2 
                            focus-visible:ring-ring focus-visible:ring-offset-2 
                            disabled:pointer-events-none disabled:opacity-50 
                            [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 
                            [&amp;_svg]:shrink-0 bg-primary text-primary-foreground 
                            hover:bg-primary/90 h-10 px-4 py-2 w-full">
                        Completar venta
                    </button>
                </div>

            </CardContent>
        </Card>
    );
}
export default Carrito;