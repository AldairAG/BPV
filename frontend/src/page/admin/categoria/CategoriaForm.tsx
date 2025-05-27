import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

// Esquema de validación con Yup
const CategoriaSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, 'Nombre demasiado corto')
    .max(50, 'Nombre demasiado largo')
    .required('El nombre es obligatorio'),
  color: Yup.string()
    .required('El color es obligatorio')
});

const CategoriaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Para editar categorías existentes
  const [initialValues, setInitialValues] = useState({
    nombre: '',
    color: '#3b82f6' // Color azul por defecto
  });
  const [isLoading, setIsLoading] = useState(false);

  // Si hay un ID, cargar los datos de la categoría para editar
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      // Aquí normalmente harías una petición al backend
      // Ejemplo simulado:
      setTimeout(() => {
        setInitialValues({
          nombre: 'Categoría de ejemplo',
          color: '#10b981'
        });
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  const handleSubmit = (values, { setSubmitting }) => {
    // Aquí enviarías los datos al backend
    console.log('Datos de la categoría:', values);
    
    // Simulamos una petición
    setTimeout(() => {
      setSubmitting(false);
      navigate('/admin/categorias'); // Redirigir después de guardar
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button 
          className="mr-4 bg-transparent hover:bg-gray-700"
          onClick={() => navigate('/admin/categorias')}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? 'Editar Categoría' : 'Nueva Categoría'}
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={CategoriaSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true} // Importante para cuando se cargan datos existentes
      >
        {({ isSubmitting, values, errors, touched, setFieldValue }) => (
          <Form className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            {/* Nombre de la categoría */}
            <div>
              <Field
                as={Input}
                id="nombre"
                name="nombre"
                label="Nombre de la categoría"
                placeholder="Ej: Lácteos, Bebidas, Limpieza..."
                className={errors.nombre && touched.nombre ? 'border-red-500' : ''}
              />
              <ErrorMessage name="nombre" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Selector de color */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white" htmlFor="color">
                Color
              </label>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full border border-gray-400 overflow-hidden"
                  style={{ backgroundColor: values.color }}
                ></div>
                <Field
                  type="color"
                  id="color"
                  name="color"
                  className="h-10 w-24 bg-transparent cursor-pointer"
                />
              </div>
              <ErrorMessage name="color" component="div" className="text-red-500 text-xs mt-1" />
              <p className="text-gray-400 text-xs mt-1">
                Este color se utilizará para identificar visualmente la categoría
              </p>
            </div>

            {/* Paleta de colores predefinidos */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Colores predefinidos
              </label>
              <div className="flex flex-wrap gap-2">
                {/*
                  Aquí puedes agregar más colores o modificar los existentes
                */}
                {['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'].map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      values.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFieldValue('color', color)}
                  />
                ))}
              </div>
            </div>

            {/* Vista previa */}
            <div className="pt-4 border-t border-gray-700">
              <label className="block text-sm font-medium mb-3 text-white">
                Vista previa
              </label>
              <div className="bg-gray-900 p-4 rounded-md">
                <div 
                  className="flex items-center rounded-md px-3 py-2 text-sm"
                  style={{ backgroundColor: values.color + '20' }} // Color con opacidad
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: values.color }}
                  ></div>
                  <span style={{ color: values.color }}>
                    {values.nombre || 'Nombre de la categoría'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="button"
                className="bg-gray-600 hover:bg-gray-700"
                onClick={() => navigate('/admin/categorias')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CategoriaForm;