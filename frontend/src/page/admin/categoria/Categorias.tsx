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
        <section className="flex flex-col w-full h-full p-4">
            <ModalTemplate 
                isOpen={isOpen} 
                onClose={closeModal} 
                title={editMode ? "Editar Categoría" : "Nueva Categoría"}
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={CategoriaSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, handleChange, handleBlur, values }) => (
                        <Form className="flex flex-col gap-4">
                            <div>
                                <Input
                                    id="nombre"
                                    label="Nombre de la categoría"
                                    name="nombre"
                                    type="text"
                                    required
                                    placeholder="Ej: Electrónica"
                                    // Integración con Formik
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
                                    // Integración con Formik
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
                                className="mt-2"
                            >
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </ModalTemplate>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de categorías</h1>
                <div className="flex items-center space-x-4">
                    <Button onClick={handleOpenCreateModal}>
                        <Plus className={"w-5 h-5 mr-2"} />
                        Nueva categoría
                    </Button>
                </div>
            </div>
            
            <div className="rounded-lg border shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&amp;_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Categoría</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">Color</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="[&amp;_tr:last-child]:border-0">
                            {categorias.length > 0 ? (
                                categorias.map((categoria) => (
                                    <tr 
                                        key={categoria.categoriaId} 
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle">{categoria.nombre}</td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-6 h-6 rounded-full" 
                                                    style={{ backgroundColor: categoria.color }}
                                                ></div>
                                                <span>{categoria.color}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    onClick={() => handleOpenEditModal(categoria)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDelete(categoria.categoriaId)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">
                                        No hay categorías registradas
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

export default Categorias;