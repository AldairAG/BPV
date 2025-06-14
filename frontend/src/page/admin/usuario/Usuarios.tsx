/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useEffect, useState } from "react";
import ModalTemplate, { useModal } from "../../../components/modal/ModalTemplate";
import { ErrorMessage, Formik, Form } from "formik";
import * as Yup from "yup";
import useUser from "../../../hooks/useUser";
import type { UsuarioType } from "../../../types/UsuarioType";
import { ROLES } from "../../../constants/roles";

// Roles disponibles para seleccionar
const ROLES_DISPONIBLES = [
    { value: ROLES.ADMIN, label: "Administrador" },
    { value: ROLES.USER, label: "Cajero" },
];

// Esquema de validación para el formulario de usuario
const UsuarioSchema = Yup.object().shape({
    nombre: Yup.string()
        .required("El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres"),
    username: Yup.string()
        .required("El nombre de usuario es obligatorio")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    /*     email: Yup.string()
            .required("El email es obligatorio")
            .email("Email no válido"), */
    contrasena: Yup.string()
        .when('id', {
            is: (id: number) => !id, // Solo requerido si es nuevo usuario (sin ID)
            then: (schema) => schema.required("La contraseña es obligatoria")
                .min(6, "La contraseña debe tener al menos 6 caracteres"),
            otherwise: (schema) => schema // Opcional en edición
        }),
    rol: Yup.string()
        .required("El rol es obligatorio")
        .oneOf(ROLES_DISPONIBLES.map(r => r.value), "Rol no válido"),
    sucursal: Yup.string()
        .required("La sucursal es obligatoria"),
    activo: Yup.boolean()
});

const Usuarios = () => {
    // Modal para crear/editar usuario
    const { isOpen, openModal, closeModal } = useModal();

    // Estado para manejar la edición
    const [editMode, setEditMode] = useState(false);
    const [initialValues, setInitialValues] = useState<{
        id: number;
        nombre: string;
        username: string;
        contrasena: string;
        email: string;
        rol: string;
        sucursal: string;
        activo: boolean;
    }>({
        id: 0,
        nombre: "",
        username: "",
        contrasena: "",
        email: "",
        rol: "",
        sucursal: "",
        activo: true
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<UsuarioType[]>([]);

    // Obtener los métodos del hook useUser
    const { getAllUsers, createUser, updateUser, deleteUser } = useUser();

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Función para cargar usuarios
    const fetchUsuarios = async () => {
        const data = await getAllUsers();
        setUsuarios(data);
        setUsuariosFiltrados(data);
    };

    // Función para filtrar usuarios por nombre
    const filtrarPorNombre = (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setUsuariosFiltrados(usuarios);
            return;
        }

        const filtrados = usuarios.filter(usuario =>
            usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setUsuariosFiltrados(filtrados);
    };

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
            id: 0,
            nombre: "",
            username: "",
            contrasena: "",
            email: "",
            rol: "",
            sucursal: "",
            activo: true
        });
        openModal();
    };

    // Función para abrir el modal de edición
    const handleOpenEditModal = (usuario: UsuarioType) => {
        setEditMode(true);
        setInitialValues({
            ...usuario,
            id: usuario.id ?? 0,
            contrasena: usuario.contrasena ?? "", // No incluir contraseña en edición
            sucursal: usuario.sucursal || "" // Manejar caso donde sucursal no existe
        });
        openModal();
    };

    // Función para eliminar un usuario
    const handleDelete = async (id: number) => {
        if (window.confirm("¿Está seguro que desea eliminar este usuario?")) {

            await deleteUser(id);

            await fetchUsuarios();
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        try {
            if (editMode && values.id) {
                await updateUser(values.id, values);
            } else {
                await createUser(values);
            }
            closeModal();
            await fetchUsuarios(); // Recargar la lista después de crear/editar
        } catch (error) {
            console.error("Error al guardar usuario:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Función para formatear la fecha de último acceso
    const formatLastAccess = (dateString?: string) => {
        if (!dateString) return "Nunca";

        const date = new Date(dateString);
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <section className="flex flex-col w-full h-full p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            {/* Modal de usuario */}
            <ModalTemplate
                isOpen={isOpen}
                onClose={closeModal}
                title={editMode ? "Editar Usuario" : "Nuevo Usuario"}
            >
                <div className="max-h-[75vh] overflow-y-auto px-1">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={UsuarioSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting, handleChange, handleBlur, values }) => (
                            <Form className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            id="nombre"
                                            label="Nombre completo"
                                            name="nombre"
                                            type="text"
                                            required
                                            placeholder="Ej: Juan Pérez"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.nombre}
                                        />
                                        <ErrorMessage name="nombre" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                    <div>
                                        <Input
                                            id="username"
                                            label="Nombre de usuario"
                                            name="username"
                                            type="text"
                                            required
                                            placeholder="Ej: jperez"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.username}
                                        />
                                        <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                </div>
                                <div>
                                    <Input
                                        id="contrasena"
                                        label="Contraseña"
                                        name="contrasena"
                                        type="password"
                                        placeholder="Ingrese contraseña"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.contrasena}
                                    />
                                    <ErrorMessage name="contrasena" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="rol" className="block text-sm font-medium mb-1">
                                            Rol del usuario
                                        </label>
                                        <select
                                            id="rol"
                                            name="rol"
                                            className="w-full p-2 border rounded-md"
                                            value={values.rol}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                        >
                                            <option value="" disabled>
                                                Seleccione un rol
                                            </option>
                                            {ROLES_DISPONIBLES.map((rol) => (
                                                <option
                                                    className="text-gray-800"
                                                    key={rol.value}
                                                    value={rol.value}
                                                >
                                                    {rol.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ErrorMessage name="rol" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                    <div>
                                        <Input
                                            id="sucursal"
                                            label="Sucursal"
                                            name="sucursal"
                                            type="text"
                                            required
                                            placeholder="Ej: Central"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.sucursal}
                                        />
                                        <ErrorMessage name="sucursal" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
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
                                        Usuario activo
                                    </label>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded shadow"
                                >
                                    {isSubmitting ? "Guardando..." : "Guardar usuario"}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </ModalTemplate>

            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Gestión de Usuarios</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Administra los usuarios del sistema, roles y accesos.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input
                        id="search"
                        className="w-64"
                        placeholder="Buscar usuarios..."
                        type="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button
                        onClick={handleOpenCreateModal}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold shadow"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Usuario
                    </Button>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 overflow-auto">
                <table className="w-full min-w-[900px] text-sm">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <th className="h-12 px-4 text-left font-bold">Usuario</th>
                            <th className="h-12 px-4 text-left font-bold">Rol</th>
                            <th className="h-12 px-4 text-left font-bold">Email</th>
                            <th className="h-12 px-4 text-left font-bold">Sucursal</th>
                            <th className="h-12 px-4 text-left font-bold">Último Acceso</th>
                            <th className="h-12 px-4 text-left font-bold">Estado</th>
                            <th className="h-12 px-4 text-right font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.length > 0 ? (
                            usuariosFiltrados.map((usuario) => (
                                <tr
                                    key={usuario.id}
                                    className="transition-colors even:bg-gray-100 dark:even:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <td className="p-4 align-middle">
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{usuario.nombre}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">@{usuario.username}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                            ${usuario.rol === 'ADMIN' ? 'bg-gray-800 text-white' :
                                                usuario.rol === 'CAJERO' ? 'bg-blue-700 text-white' :
                                                    usuario.rol === 'VENDEDOR' ? 'bg-green-700 text-white' :
                                                        'bg-gray-400 text-white'
                                            }`}>
                                            {usuario.rol}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-gray-800 dark:text-gray-100">{usuario.email}</td>
                                    <td className="p-4 align-middle text-gray-800 dark:text-gray-100">{usuario.sucursal || 'N/A'}</td>
                                    <td className="p-4 align-middle text-gray-700 dark:text-gray-200">{formatLastAccess(usuario.ultimoAcceso)}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                            ${usuario.activo ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                            {usuario.activo ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                                                        <path d="M20 6 9 17l-5-5"></path>
                                                    </svg>
                                                    Activo
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                                                        <path d="M18 6 6 18"></path>
                                                        <path d="m6 6 12 12"></path>
                                                    </svg>
                                                    Inactivo
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => handleOpenEditModal(usuario)}
                                                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 py-1 rounded shadow"
                                            >
                                                <SquarePen className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(usuario.id ?? 0)}
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
                                    {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default Usuarios;