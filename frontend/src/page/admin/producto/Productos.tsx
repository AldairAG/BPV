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
    precio: Yup.number()
        .required("El precio de venta es obligatorio")
        .positive("El precio debe ser positivo"),
    precioCompra: Yup.number()
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
    descuentos: Yup.array().of(
        Yup.number()
            .transform((value, originalValue) =>
                originalValue === "" ? undefined : value)
            .nullable()
            .min(0, "El descuento no puede ser negativo")
            .max(100, "El descuento no puede ser mayor a 100%")
    )
});

const Productos = () => {
    // Modal para crear/editar producto
    const { isOpen, openModal, closeModal } = useModal();

    // Estado para manejar la edición
    const [editMode, setEditMode] = useState(false);
    const [initialValues, setInitialValues] = useState<{
        nombre: string;
        precio: string | number;
        precioCompra: string | number;
        stock: string | number;
        stockMinimo: string | number;
        codigoBarras: string;
        categoria: CategoriaType | null;
        activo: boolean;
        productoId: number;
        tipo: string;
        descuentos: (string | number)[];
    }>({
        nombre: "",
        precio: "",
        precioCompra: "", // <--- aquí
        stock: "",
        stockMinimo: "",
        codigoBarras: "",
        categoria: null,
        activo: true,
        productoId: 0,
        tipo: TIPOS_PRODUCTO.PIEZA,
        descuentos: ["", "", "", ""]
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
            precio: "",
            precioCompra: "",
            stock: "",
            stockMinimo: "",
            codigoBarras: "",
            categoria: null,
            activo: true,
            tipo: TIPOS_PRODUCTO.PIEZA, // Valor por defecto
            productoId: 0,
            descuentos: ["", "", "", ""]
        });
        openModal();
    };

    // Función para abrir el modal de edición
    const handleOpenEditModal = (producto: ProductoType) => {
        console.log("Producto a editar:", producto);
        
        setEditMode(true);
        setInitialValues({
                    nombre: producto.nombre || "",
                    precio: producto.precio !== undefined ? producto.precio : "",
                    precioCompra: producto.precioCompra !== undefined
                        ? producto.precioCompra
                        : "",
                    stock: producto.stock !== undefined ?producto.stock : "",
                    stockMinimo: producto.stockMinimo !== undefined ? producto.stockMinimo : "",
                    codigoBarras: producto.codigoBarras ?? "",
                    categoria: producto.categoria || null,
                    activo: producto.activo ?? true,
                    productoId: producto.productoId ?? producto.id ?? 0,
                    tipo: producto.tipo || TIPOS_PRODUCTO.PIEZA,
                    descuentos: producto.descuentos?.length
                        ? [...producto.descuentos.map(d => d === null || d === undefined ? "" : String(d)), ...Array(4 - producto.descuentos.length).fill("")]
                        : ["", "", "", ""]
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
        console.log("Submit ejecutado", values); // <-- Agrega esto
        try {
            // Limpiar descuentos, eliminar valores vacíos y convertir a números
            const descuentos = values.descuentos
                .map((d: string | number) => d === "" ? null : Number(d))
                .filter((d: number | null) => d !== null && d > 0);

            const productData = {
                ...values,
                descuentos
            };

            if (editMode && values.productoId) {
                await updateProductoById(values.productoId, productData);
            } else {
                await createProducto(productData);
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
        <section className="flex flex-col w-full h-full p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 dark:text-blue-200 tracking-tight mb-1">Gestión de Productos</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Administra tu catálogo, controla stock y precios de manera eficiente.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input
                        id="search"
                        className="w-64"
                        placeholder="Buscar productos..."
                        type="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Producto
                    </Button>
                </div>
            </div>

            {/* Modal de producto */}
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
                                        id="precio"
                                        label="Precio de venta"
                                        name="precio"
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.precio}
                                    />
                                    <ErrorMessage
                                        name="precio"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <div>
                                    <Input
                                        id="precioCompra"
                                        label="Precio de costo"
                                        name="precioCompra" // <--- aquí
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.precioCompra}
                                    />
                                    <ErrorMessage
                                        name="precioCompra"
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

                            {/* Agregar después del campo "activo" y antes del botón de Guardar */}
                            <div className="mt-4 border-t pt-4">
                                <h3 className="text-sm font-medium mb-2">Descuentos por cantidad (opcional)</h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    Define hasta 4 niveles de descuento en porcentaje según la cantidad comprada
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div key={index} className="flex flex-col">
                                            <label htmlFor={`descuentos[${index}]`} className="text-xs font-medium mb-1">
                                                Descuento {index + 1} (%)
                                            </label>
                                            <Input
                                                id={`descuentos[${index}]`}
                                                name={`descuentos[${index}]`}
                                                type="number"
                                                placeholder={`Ej: ${(index + 1) * 5}`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.descuentos[index]}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                            />
                                            <ErrorMessage
                                                name={`descuentos[${index}]`}
                                                component="div"
                                                className="text-red-500 text-xs mt-1"
                                            />
                                        </div>
                                    ))}
                                </div>
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

            {/* Tabla de productos */}
            <div className="rounded-xl border border-blue-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 overflow-auto">
                <table className="w-full min-w-[900px] text-sm">
                    <thead>
                        <tr className="bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100">
                            <th className="h-12 px-4 text-left font-bold">Producto</th>
                            <th className="h-12 px-4 text-left font-bold">Categoría</th>
                            <th className="h-12 px-4 text-left font-bold">Tipo</th>
                            <th className="h-12 px-4 text-right font-bold">Precio</th>
                            <th className="h-12 px-4 text-right font-bold">Stock</th>
                            <th className="h-12 px-4 text-right font-bold">Descuentos</th>
                            <th className="h-12 px-4 text-right font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.length > 0 ? (
                            productosFiltrados.map((producto, idx) => (
                                <tr
                                    key={producto.productoId}
                                    className={`transition-colors ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-blue-50 dark:bg-gray-800"} hover:bg-blue-50/70 dark:hover:bg-blue-900/40`}
                                >
                                    <td className="p-4 align-middle">
                                        <div>
                                            <p className="font-semibold">{producto.nombre}</p>
                                            {producto.codigoBarras && (
                                                <p className="text-xs text-gray-500">Código: {producto.codigoBarras}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            {producto.categoria && (
                                                <>
                                                    <span
                                                        className="w-3 h-3 rounded-full inline-block"
                                                        style={{ backgroundColor: producto.categoria.color }}
                                                    ></span>
                                                    <span className="text-xs font-medium">{producto.categoria.nombre}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold">
                                            {producto.tipo || "Unidad"}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right font-bold text-blue-700 dark:text-blue-200">
                                        {formatPrice(producto.precio || 0)}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <span className={`${producto.stock <= producto.stockMinimo ? 'text-red-600 font-bold' : 'text-green-700 dark:text-green-300 font-semibold'}`}>
                                            {producto.tipo === 'Unidad'
                                              ? producto.stock
                                              : producto.stock.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">
                                            {producto.tipo === 'Unidad' ? 'pz' : producto.tipo === 'Líquido' ? 'lt' : 'pz'}
                                        </span>
                                        {producto.stock <= producto.stockMinimo && (
                                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-bold">
                                              Stock bajo
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        {producto.descuentos && producto.descuentos.some(d => d > 0) ? (
                                            <div className="flex flex-col items-end gap-1">
                                                {producto.descuentos
                                                  .filter(d => d > 0)
                                                  .map((descuento, idx) => (
                                                    <span key={idx} className="text-xs text-green-600 font-semibold bg-green-50 rounded px-2">
                                                      {descuento}%
                                                    </span>
                                                  ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin descuentos</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => handleOpenEditModal(producto)}
                                                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 py-1 rounded shadow"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(producto.productoId)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                    {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default Productos;