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
    const { getAllUsers, createUser, updateUser,deleteUser } = useUser();

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
        <main className=" w-full px-4 py-6">
            <ModalTemplate
                isOpen={isOpen}
                onClose={closeModal}
                title={editMode ? "Editar Usuario" : "Nuevo Usuario"}
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={UsuarioSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, handleChange, handleBlur, values }) => (
                        <Form className="flex flex-col gap-4">
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
                                <ErrorMessage
                                    name="nombre"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
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
                                    <ErrorMessage
                                        name="username"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                {/* <div>
                                    <Input
                                        id="email"
                                        label="Correo electrónico"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Ej: juan@ejemplo.com"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}
                                    />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div> */}
                            </div>

                            <div>
                                <Input
                                    id="contrasena"
                                    label={"Contraseña"}
                                    name="contrasena"
                                    type="text"
                                    placeholder={"Ingrese contraseña"}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.contrasena}
                                />
                                <ErrorMessage
                                    name="contrasena"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
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
                                    <ErrorMessage
                                        name="rol"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
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
                                    <ErrorMessage
                                        name="sucursal"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
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
                                    value={values.activo ? "true" : "false"}
                                />
                                <label htmlFor="activo" className="text-sm font-medium">
                                    Usuario activo
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Guardando..." : "Guardar usuario"}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </ModalTemplate>

            <div className="flex justify-between items-center mb-6">
                <div className="w-full space-y-2">
                    <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 w-full">
                        <Input
                            id="search"
                            className="w-full"
                            placeholder="Buscar usuarios..."
                            type="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <Button onClick={handleOpenCreateModal}>
                            <Plus className={'w-5 h-5 mr-2'} />
                            Nuevo Usuario
                        </Button>
                    </div>
                </div>

            </div>
            <div className="rounded-lg border shadow-sm overflow-hidden">
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
                            {usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((usuario) => (
                                    <tr
                                        key={usuario.id}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                            <div>
                                                <div className="font-medium">{usuario.nombre}</div>
                                                <div className="text-sm text-gray-500">@{usuario.username}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 ${usuario.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                usuario.rol === 'CAJERO' ? 'bg-indigo-100 text-indigo-800' :
                                                    usuario.rol === 'VENDEDOR' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {usuario.rol}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{usuario.email}</td>
                                        <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{usuario.sucursal || 'N/A'}</td>
                                        <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{formatLastAccess(usuario.ultimoAcceso)}</td>
                                        <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={usuario.activo}
                                                    data-state={usuario.activo ? "checked" : "unchecked"}
                                                    value="on"
                                                    className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                                                    onClick={() => {
                                                        // Aquí implementarías la lógica para cambiar el estado
                                                        console.log("Cambiar estado de usuario:", usuario.id);
                                                    }}
                                                >
                                                    <span
                                                        data-state={usuario.activo ? "checked" : "unchecked"}
                                                        className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                                                    ></span>
                                                </button>
                                                <span className="ml-2">
                                                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${usuario.activo ?
                                                        'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                        {usuario.activo ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3 mr-1">
                                                                    <path d="M20 6 9 17l-5-5"></path>
                                                                </svg>
                                                                Activo
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3 w-3 mr-1">
                                                                    <path d="M18 6 6 18"></path>
                                                                    <path d="m6 6 12 12"></path>
                                                                </svg>
                                                                Inactivo
                                                            </>
                                                        )}
                                                    </div>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                                                    onClick={() => handleOpenEditModal(usuario)}
                                                >
                                                    <SquarePen className={'w-5 h-5 text-blue-600'} />
                                                </button>
                                                <button
                                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                                                    onClick={() => handleDelete(usuario.id ?? 0)}
                                                >
                                                    <Trash2 className={'w-5 h-5 text-red-600'} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-gray-500">
                                        {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

export default Usuarios;