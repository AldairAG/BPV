/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHead, CardTittle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import useUser from "../hooks/useUser";
import logo from "../assets/logo.png"; // Asegúrate de tener una imagen de logo en esta ruta

// Esquema de validación con Yup
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required("El usuario es obligatorio"),
  contrasena: Yup.string()
    .required("La contraseña es obligatoria"),
});

const Login = () => {
    const { login } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Función que maneja el envío del formulario
    const handleSubmit = async (values: { username: string; contrasena: string }) => {
        setLoading(true);
        setError(null);

        try {
            const success = await login(values.username, values.contrasena);

            if (!success) {
                setError("Credenciales inválidas");
            }
        } catch (err: any) {
            // Mejor manejo de errores HTTP
            if (err.response && err.response.status === 401) {
                setError("Credenciales inválidas");
            } else if (err.response && err.response.status === 400) {
                setError("Solicitud incorrecta. Verifica los datos.");
            } else if (err.message && err.message.includes("Network Error")) {
                setError("No se pudo conectar con el servidor. Verifica tu conexión.");
            } else {
                setError("Error al iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-blue-300 relative overflow-hidden">
            {/* Burbujas animadas */}
            <div className="bubbles">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className={`bubble bubble-${i + 1}`}></div>
                ))}
            </div>
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src={logo} alt="logo" className="w-30 h-30 md:w-50 md:h-50"/>
                    <h1 className="text-3xl font-bold text-sky-900">La Burbuja Feliz</h1>
                    <p className="text-gray-900">Sistema de Punto de Venta para Artículos de Limpieza</p>
                </div>

                <Card className="rounded-lg border bg-card text-card-foreground shadow-2x1 bg-blue-400">
                    <CardHead className="flex flex-col space-y-1.5 p-6 ">
                        <CardTittle className="text-2xl font-semibold leading-none tracking-tight text-gray-900">
                            Iniciar Sesión
                        </CardTittle>
                        <CardDescription className="text-gray-800">
                            Ingrese sus credenciales para acceder al sistema
                        </CardDescription>
                    </CardHead>
                    
                    <CardContent className="p-2 pt-5">
                        <Formik
                            initialValues={{ username: "", contrasena: "" }}
                            validationSchema={LoginSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, touched, errors, handleChange, handleBlur, values }) => (
                                <Form className="space-y-4 w-full">
                                    <div>
                                        <Input
                                            id="username"
                                            name="username"
                                            type="text"
                                            placeholder="Usuario"
                                            className={`w-full ${
                                                touched.username && errors.username ? "border-red-500" : ""
                                            }`}
                                            classNameInput="bg-white"
                                            disabled={loading}
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

                                    <div>
                                        <Input
                                            id="contrasena"
                                            name="contrasena"
                                            type="password"
                                            placeholder="Contraseña"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            classNameInput="bg-white"
                                            value={values.contrasena}
                                            className={`w-full ${
                                                touched.contrasena && errors.contrasena ? "border-red-500" : ""
                                            }`}
                                            disabled={loading}
                                        />
                                        <ErrorMessage
                                            name="contrasena"
                                            component="div"
                                            className="text-red-500 text-sm mt-1"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                            <span className="block sm:inline">{error}</span>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || loading}
                                        className="w-full flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Iniciando sesión...
                                            </>
                                        ) : (
                                            <>
                                                Iniciar sesión
                                                <ArrowRightEndOnRectangleIcon className="h-6 w-6 text-white" />
                                            </>
                                        )}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Login;