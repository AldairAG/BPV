import { CreditCardIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { Input } from "../components/ui/Input";
import { Badge, Card, CardContent, CardHead } from "../components/ui/Card";
import ItemProductoCajero from "../components/items/ItemProducto";
import Carrito from "../components/carrito/Carrito";

const UserLayout = () => {
  return (
    <section>
      <header className="flex items-center justify-between h-16 bg-gray-900 
          text-white px-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-sky-500">
          La Borbuja Feliz Manager
        </h1>
      </header>

      <main className="grid max-w-[1600px] w-full p-6">

        <div className="flex items-center  justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Modulo de ventas</h1>
          <div className="flex items-center gap-4">
            <button className="flex text-sm items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-md mt-4">
              <CreditCardIcon className="h-5 w-5 text-white" />
              Tarjetas
            </button>

            <button className="flex items-center text-sm gap-2 bg-gray-700 text-white px-4 py-2 rounded-md mt-4">
              <ListBulletIcon className="h-5 w-5 text-white" />
              Lista
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="w-full flex flex-col col-span-2  gap-4">
            <Input
              className="w-full col-span-2 "
              placeholder="Buscar producto"
              id="search"
              name="search"
              type="search"
              variant="search"
            />

            <Card className="w-full col-span-2 bg-gray-800 p-4">
              <CardHead className="flex items-center justify-between">
                <Badge>Todos</Badge>
                <Badge>Limpiadores</Badge>
                <Badge>Utensilios</Badge>
                <Badge>Desinfectantes</Badge>
                <Badge>Accesorios</Badge>
                <Badge>Ambientadores</Badge>
              </CardHead>

              <CardContent>

                <ItemProductoCajero />

              </CardContent>

            </Card>
          </div>

          <aside className="col-span-1">
            <Carrito />
          </aside>

        </div>
      </main>

    </section>
  );
}



export default UserLayout;
