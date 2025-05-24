const Productos = () => {
    return (
        <section className="flex flex-col w-full h-full p-4">
            <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
            <div className="flex flex-row items-center justify-between mt-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Agregar Producto
                </button>
            </div>
            <div className="mt-4">
                {/* Aquí puedes agregar una tabla o lista de productos */}
                <p>Lista de productos aquí...</p>
            </div>
        </section>
    );
}
export default Productos;