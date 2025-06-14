import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import ModalTemplate, { useModal } from "../../../components/modal/ModalTemplate";
import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/Input";
import useCategoria from "../../../hooks/useCategoria";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import type { CategoriaType } from "../../../types/CategoriaType";

// Esquema de validación para el formulario de categoría
const CategoriaSchema = Yup.object().shape({
    nombre: Yup.string()
        .required("El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    color: Yup.string()
        .required("El color es obligatorio")
});

const Categorias = () => {
    // Modal para crear/editar categoría
    const { isOpen, openModal, closeModal } = useModal();
    
    // Estado para manejar la edición
    const [editMode, setEditMode] = useState(false);
    const [initialValues, setInitialValues] = useState({ nombre: "", color: "#000000", categoriaId: 0 });
    
    // Obtener los métodos y estados de useCategoria
    const { 
        categorias, 
        fetchCategorias, 
        createCategoria, 
        updateCategoriaById, 
        deleteCategoria,
        seleccionarCategoria,
    } = useCategoria();

    // Cargar categorías al montar el componente
    useEffect(() => {
        fetchCategorias();
    }, []);

    // Función para abrir el modal de creación
    const handleOpenCreateModal = () => {
        setEditMode(false);
        setInitialValues({ nombre: "", color: "#000000", categoriaId: 0 });
        openModal();
    };

    // Función para abrir el modal de edición
    const handleOpenEditModal = (categoria: CategoriaType) => {
        setEditMode(true);
        setInitialValues(categoria);
        seleccionarCategoria(categoria);
        openModal();
    };

    // Función para eliminar una categoría
    const handleDelete = async (id: number) => {
        if (window.confirm("¿Está seguro que desea eliminar esta categoría?")) {
            await deleteCategoria(id);
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (values: { nombre: string; color: string; categoriaId?: number }) => {
        try {
            if (editMode && values.categoriaId) {
                await updateCategoriaById(values.categoriaId, {
                    nombre: values.nombre,
                    color: values.color
                });
            } else {
                await createCategoria({
                    nombre: values.nombre,
                    color: values.color,
                    productos: []
                });
            }
            closeModal();
        } catch (error) {
            console.error("Error al guardar categoría:", error);
        }
    };

    return (
        <section className="flex flex-col w-full h-full p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            {/* Modal de categoría */}
            <ModalTemplate
                isOpen={isOpen}
                onClose={closeModal}
                title={editMode ? "Editar Categoría" : "Nueva Categoría"}
            >
                <div className="max-h-[60vh] overflow-y-auto px-1">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={CategoriaSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting, handleChange, handleBlur, values }) => (
                            <Form className="flex flex-col gap-6">
                                <div>
                                    <Input
                                        id="nombre"
                                        label="Nombre de la categoría"
                                        name="nombre"
                                        type="text"
                                        required
                                        placeholder="Ej: Electrónica"
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
                                <div>
                                    <Input
                                        id="color"
                                        label="Color"
                                        name="color"
                                        type="color"
                                        required
                                        classNameInput="p-0 border-none h-10"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.color}
                                    />
                                    <ErrorMessage
                                        name="color"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded shadow"
                                >
                                    {isSubmitting ? "Guardando..." : "Guardar"}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </ModalTemplate>

            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Gestión de Categorías</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Organiza tus productos por categorías y colores personalizados.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold shadow"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Categoría
                    </Button>
                </div>
            </div>

            {/* Tabla de categorías */}
            <div className="rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 overflow-auto">
                <table className="w-full min-w-[600px] text-sm">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <th className="h-12 px-4 text-left font-bold">Categoría</th>
                            <th className="h-12 px-4 text-left font-bold">Color</th>
                            <th className="h-12 px-4 text-right font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.length > 0 ? (
                            categorias.map((categoria) => (
                                <tr
                                    key={categoria.categoriaId}
                                    className="transition-colors even:bg-gray-100 dark:even:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <td className="p-4 align-middle font-semibold text-gray-900 dark:text-white">{categoria.nombre}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-700"
                                                style={{ backgroundColor: categoria.color }}
                                            ></div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{categoria.color}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => handleOpenEditModal(categoria)}
                                                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 py-1 rounded shadow"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(categoria.categoriaId)}
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
                                <td colSpan={3} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                    No hay categorías registradas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default Categorias;