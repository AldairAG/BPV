import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHead, CardTittle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";


const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-sky-600">La borbuja Feliz</h1>
                    <p className="text-gray-600">Sistema de Punto de Venta para Artículos de Limpieza</p>
                </div>

                <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <CardHead className="flex flex-col space-y-1.5 p-6">
                        <CardTittle className="text-2xl font-semibold leading-none tracking-tight">
                            Iniciar Sesión
                        </CardTittle>
                        <CardDescription>
                            Ingrese sus credenciales para acceder al sistema
                        </CardDescription>
                    </CardHead>
                    
                    <CardContent className="p-6 pt-0">
                        <form className="space-y-4 w-full">
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Usuario"
                                className="w-full"
                            />

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Contraseña"
                                className="w-full"
                            />

                            <Button
                                type="submit"
                            >
                                Iniciar sesion
                                <ArrowRightEndOnRectangleIcon className="h-6 w-6 text-white" />
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
export default Login;