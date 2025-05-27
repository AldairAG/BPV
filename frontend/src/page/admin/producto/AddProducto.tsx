import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

// Esquema de validación con Yup
const ProductoSchema = Yup.object().shape({
    nombre: Yup.string()
        .min(3, 'Nombre demasiado corto')
        .max(100, 'Nombre demasiado largo')
        .required('El nombre es obligatorio'),
    descripcion: Yup.string()
        .max(500, 'Descripción demasiado larga'),
    tipo: Yup.string()
        .oneOf(['unidad', 'granel'], 'Seleccione un tipo válido')
        .required('El tipo es obligatorio'),
    precio: Yup.number()
        .positive('El precio debe ser positivo')
        .required('El precio es obligatorio'),
    stock: Yup.number()
        .integer('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .required('El stock es obligatorio'),
    categoria: Yup.string()
        .required('La categoría es obligatoria'),
});

const initialValues = {
    nombre: '',
    descripcion: '',
    tipo: 'unidad',
    precio: '',
    stock: '',
    categoria: '',
    imagen: null
};

const AddProducto = () => {
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);

    const handleSubmit = (values, { setSubmitting }) => {
        // Aquí puedes enviar los datos al backend
        console.log('Datos del producto:', values);

        setTimeout(() => {
            setSubmitting(false);
            // Descomenta para redireccionar después de enviar
            // navigate('/admin/productos');
        }, 500);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-6">
                <Button
                    className="mr-4 bg-transparent hover:bg-gray-700"
                    onClick={() => navigate('/admin/productos')}
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">Agregar Nuevo Producto</h1>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={ProductoSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, setFieldValue, values, errors, touched }) => (
                    <Form className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre del producto */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="nombre">
                                    Nombre del producto
                                </label>
                                <Field
                                    as={Input}
                                    id="nombre"
                                    name="nombre"
                                    placeholder="Ej: Arroz integral premium"
                                    className={`w-full ${errors.nombre && touched.nombre ? 'border-red-500' : ''}`}
                                />
                                <ErrorMessage name="nombre" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="categoria">
                                    Categoría
                                </label>
                                <Field
                                    as="select"
                                    id="categoria"
                                    name="categoria"
                                    className={`w-full rounded-md border border-input px-3 py-2 text-base bg-gray-700 focus-visible:outline-none focus-visible:ring focus-visible:ring-ring focus-visible:ring-offset md:text-sm ${errors.categoria && touched.categoria ? 'border-red-500' : ''
                                        }`}
                                >
                                    <option value="" disabled>Seleccionar categoría</option>
                                    <option value="abarrotes">Abarrotes</option>
                                    <option value="lacteos">Lácteos</option>
                                    <option value="limpieza">Limpieza</option>
                                    <option value="frutas">Frutas y Verduras</option>
                                    <option value="bebidas">Bebidas</option>
                                </Field>
                                <ErrorMessage name="categoria" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Tipo de unidad */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white">
                                    Tipo de venta
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <Field
                                            type="radio"
                                            name="tipo"
                                            value="unidad"
                                            className="text-blue-500 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <span className="ml-2">Por unidad</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <Field
                                            type="radio"
                                            name="tipo"
                                            value="granel"
                                            className="text-blue-500 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <span className="ml-2">A granel</span>
                                    </label>
                                </div>
                                <ErrorMessage name="tipo" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Precio */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="precio">
                                    Precio
                                </label>
                                <Field
                                    as={Input}
                                    id="precio"
                                    name="precio"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`w-full ${errors.precio && touched.precio ? 'border-red-500' : ''}`}
                                />
                                <ErrorMessage name="precio" component="div" className="text-red-500 text-xs mt-1" />
                                <p className="text-xs text-gray-400 mt-1">
                                    {values.tipo === 'granel' ? 'Precio por Kg/L' : 'Precio por unidad'}
                                </p>
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="stock">
                                    Stock disponible
                                </label>
                                <Field
                                    as={Input}
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    placeholder={values.tipo === 'granel' ? 'Cantidad en Kg/L' : 'Cantidad en unidades'}
                                    className={`w-full ${errors.stock && touched.stock ? 'border-red-500' : ''}`}
                                />
                                <ErrorMessage name="stock" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-8">
                            <Button
                                type="button"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default AddProducto;