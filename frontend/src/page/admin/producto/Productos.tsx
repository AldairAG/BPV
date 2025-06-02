/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import ModalTemplate, { useModal } from "../../../components/modal/ModalTemplate";
import { ErrorMessage, Formik, Form } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import useProducto from "../../../hooks/useProducto";
import useCategoria from "../../../hooks/useCategoria";
import type { ProductoType } from "../../../types/ProductoType";
import type { CategoriaType } from "../../../types/CategoriaType";
import { TIPOS_PRODUCTO } from "../../../constants/tipoProducto";

// Tipos de unidades disponibles
const TIPOS_UNIDAD = [
    { value: TIPOS_PRODUCTO.PIEZA, label: "Por pieza/unidad" },
    { value: TIPOS_PRODUCTO.GRANEL, label: "A granel (litros)" },
];

// Esquema de validación para el formulario de producto
const ProductoSchema = Yup.object().shape({
    nombre: Yup.string()
        .required("El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    precioVenta: Yup.number()
        .required("El precio de venta es obligatorio")
        .positive("El precio debe ser positivo"),
    precioCosto: Yup.number()
        .required("El precio de costo es obligatorio")
        .positive("El precio debe ser positivo"),
    stock: Yup.number()
        .required("El stock es obligatorio")
        .min(0, "El stock no puede ser negativo"),
    stockMinimo: Yup.number()
        .required("El stock mínimo es obligatorio")
        .min(0, "El stock mínimo no puede ser negativo"),
    categoria: Yup.object()
        .required("La categoría es obligatoria"),
    tipo: Yup.string()
        .required("El tipo de unidad es obligatorio")
        .oneOf(TIPOS_UNIDAD.map(t => t.value), "Tipo de unidad no válido"),
});

const Productos = () => {
    // Modal para crear/editar producto
    const { isOpen, openModal, closeModal } = useModal();
    
    // Estado para manejar la edición
    const [editMode, setEditMode] = useState(false);
    const [initialValues, setInitialValues] = useState<{
        nombre: string;
        precioVenta: number|string;
        precioCosto: number|string;
        stock: number|string;
        stockMinimo: number|string;
        codigoBarras: string;
        categoria: CategoriaType | null;
        activo: boolean;
        tipo: string; 
        productoId: number;
    }>({
        nombre: "",
        precioVenta: "",
        precioCosto: "",
        stock: "",
        stockMinimo: "",
        codigoBarras: "",
        categoria: null,
        activo: true,
        productoId: 0,
        tipo: 'Unidad'
    });
    
    const [searchTerm, setSearchTerm] = useState("");
    
    // Obtener los métodos y estados de useProducto
    const { 
        productosFiltrados,
        fetchProductos, 
        createProducto,
        updateProductoById,
        deleteProducto,
        seleccionarProducto,
        filtrarPorNombre
    } = useProducto();

    // Obtener categorías para el selector
    const { categorias, fetchCategorias } = useCategoria();

    // Cargar productos y categorías al montar el componente
    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, []);

    // Función para manejar el cambio en el campo de búsqueda
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        filtrarPorNombre(value);
    };

    // Función para abrir el modal de creación
    const handleOpenCreateModal = () => {
        setEditMode(false);
        setInitialValues({
            nombre: "",
            precioVenta: "",
            precioCosto: "",
            stock: "",
            stockMinimo: "",
            codigoBarras: "",
            categoria: null,
            activo: true,
            tipo: "Unidad",
            productoId: 0
        });
        openModal();
    };

    // Función para abrir el modal de edición
    const handleOpenEditModal = (producto: ProductoType) => {
        setEditMode(true);
        setInitialValues({
            ...producto,
            codigoBarras: producto.codigoBarras ?? "",
            // Si el tipo no está definido, usar 'Unidad' como valor predeterminado
            tipo: producto.tipo || "Unidad"
        });
        seleccionarProducto(producto);
        openModal();
    };

    // Función para eliminar un producto
    const handleDelete = async (id: number) => {
        if (window.confirm("¿Está seguro que desea eliminar este producto?")) {
            await deleteProducto(id);
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (values: any) => {
        try {
            if (editMode && values.productoId) {
                await updateProductoById(values.productoId, values);
            } else {
                await createProducto(values);
            }
            closeModal();
            fetchProductos(); // Recargar la lista después de crear/editar
        } catch (error) {
            console.error("Error al guardar producto:", error);
        }
    };

    // Función para formatear precio
    const formatPrice = (price: number) => {
        return price.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS'
        });
    };

    return (
        <section className="flex flex-col w-full h-full p-4">
            <ModalTemplate 
                isOpen={isOpen} 
                onClose={closeModal} 
                title={editMode ? "Editar Producto" : "Nuevo Producto"}
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={ProductoSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, handleChange, handleBlur, values, setFieldValue }) => (
                        <Form className="flex flex-col gap-4">
                            <div>
                                <Input
                                    id="nombre"
                                    label="Nombre del producto"
                                    name="nombre"
                                    type="text"
                                    required
                                    placeholder="Ej: Detergente líquido"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.nombre}
                                />
                                <ErrorMessage
                                    name="nombre"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>

                            {/* Selector de tipo de unidad */}
                            <div>
                                <label htmlFor="tipo" className="block text-sm font-medium mb-1">
                                    Tipo de unidad
                                </label>
                                <select
                                    id="tipo"
                                    name="tipo"
                                    className="w-full p-2 border rounded-md"
                                    value={values.tipo}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                >
                                    {TIPOS_UNIDAD.map((tipo) => (
                                        <option key={tipo.value} value={tipo.value} className="text-gray-500">
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMessage
                                    name="tipo"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                                <p className="text-gray-500 text-xs mt-1">
                                    {values.tipo === 'Unidad' && 'El stock se medirá en unidades/piezas.'}
                                    {values.tipo === 'Líquido' && 'El stock se medirá en litros.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        id="precioVenta"
                                        label="Precio de venta"
                                        name="precioVenta"
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.precioVenta}
                                    />
                                    <ErrorMessage
                                        name="precioVenta"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <div>
                                    <Input
                                        id="precioCosto"
                                        label="Precio de costo"
                                        name="precioCosto"
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.precioCosto}
                                    />
                                    <ErrorMessage
                                        name="precioCosto"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        id="stock"
                                        label={`Stock actual (${values.tipo === 'Unidad' ? 'unidades' : values.tipo === 'Líquido' ? 'litros' : 'kilos'})`}
                                        name="stock"
                                        type="number"
                                        required
                                        placeholder="0"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.stock}
                                        step={values.tipo !== 'Unidad' ? '0.01' : '1'}
                                    />
                                    <ErrorMessage
                                        name="stock"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <div>
                                    <Input
                                        id="stockMinimo"
                                        label={`Stock mínimo (${values.tipo === 'Unidad' ? 'unidades' : values.tipo === 'Líquido' ? 'litros' : 'kilos'})`}
                                        name="stockMinimo"
                                        type="number"
                                        required
                                        placeholder="0"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.stockMinimo}
                                        step={values.tipo !== 'Unidad' ? '0.01' : '1'}
                                    />
                                    <ErrorMessage
                                        name="stockMinimo"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Input
                                    id="codigoBarras"
                                    label="Código de barras (opcional)"
                                    name="codigoBarras"
                                    type="text"
                                    placeholder="Ej: 7790001001234"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.codigoBarras || ""}
                                />
                            </div>

                            <div>
                                <label htmlFor="categoria" className="block text-sm font-medium mb-1">
                                    Categoría
                                </label>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    className="w-full p-2 border rounded-md"
                                    value={values.categoria?.categoriaId || ""}
                                    onChange={(e) => {
                                        const categoriaId = parseInt(e.target.value);
                                        const categoriaSeleccionada = categorias.find(
                                            (cat) => cat.categoriaId === categoriaId
                                        );
                                        setFieldValue("categoria", categoriaSeleccionada || null);
                                    }}
                                    onBlur={handleBlur}
                                    required
                                >
                                    <option value="" disabled>
                                        Seleccione una categoría
                                    </option>
                                    {categorias.map((categoria) => (
                                        <option
                                            className="text-gray-500" 
                                            key={categoria.categoriaId} 
                                            value={categoria.categoriaId}
                                        >
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMessage
                                    name="categoria"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    id="activo"
                                    name="activo"
                                    type="checkbox"
                                    className="w-4 h-4"
                                    checked={values.activo}
                                    onChange={handleChange}
                                />
                                <label htmlFor="activo" className="text-sm font-medium">
                                    Producto activo
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Guardando..." : "Guardar producto"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </ModalTemplate>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Productos</h1>
                <div className="flex items-center space-x-4">
                    <Input
                        id="search"
                        className="w-xs"
                        placeholder="Buscar productos..."
                        type="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button onClick={handleOpenCreateModal}>
                        <Plus className={"w-5 h-5 mr-2"} />
                        Nuevo Producto
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border shadow-sm overflow-hidden">
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
                            {productosFiltrados.length > 0 ? (
                                productosFiltrados.map((producto) => (
                                    <tr 
                                        key={producto.productoId} 
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle">
                                            <div>
                                                <p className="font-medium">{producto.nombre}</p>
                                                {producto.codigoBarras && (
                                                    <p className="text-xs text-gray-500">Código: {producto.codigoBarras}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                {producto.categoria && (
                                                    <>
                                                        <div 
                                                            className="w-3 h-3 rounded-full" 
                                                            style={{ backgroundColor: producto.categoria.color }}
                                                        ></div>
                                                        <span>{producto.categoria.nombre}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {producto.tipo || "Unidad"}
                                        </td>
                                        <td className="p-4 align-middle text-right">{formatPrice(producto.precioVenta)}</td>
                                        <td className="p-4 align-middle text-right">
                                            <span className={`${producto.stock <= producto.stockMinimo ? 'text-red-500 font-bold' : ''}`}>
                                                {producto.tipo === 'Unidad' 
                                                    ? producto.stock 
                                                    : producto.stock.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                {producto.tipo === 'Unidad' ? 'pz' : producto.tipo === 'Líquido' ? 'lt' : 'pz'}
                                            </span>
                                            {producto.stock <= producto.stockMinimo && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                                    Stock bajo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    onClick={() => handleOpenEditModal(producto)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDelete(producto.productoId)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-gray-500">
                                        {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default Productos;