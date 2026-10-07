# Nuevo acceso y escritorio de Bus Control

Implementado el 7 de octubre de 2026.

## Pantallas

- `/login`: bienvenida con identidad visual, ilustración vectorial de bus, formulario de ancho limitado, etiquetas accesibles, mostrar/ocultar contraseña, validación por campo y estado de envío. Se retiraron las credenciales predefinidas.
- `/home`: escritorio con navegación lateral en ordenador e inferior en móvil, saludo, accesos destacados para ingreso y gasto, tarjetas de módulos y vista resumida de la flota.

La ilustración es local (`src/assets/illustrations/bus-fleet.svg`). No se añadieron bibliotecas ni dependencias remotas para el diseño. Los estilos de estas pantallas usan colores propios; los demás módulos mantienen su presentación actual.

## Datos y acciones

El escritorio consulta los servicios existentes de vehículos, operadores e ingresos. Muestra cantidad de buses, operadores excluyendo ADMIN y registros de ingresos del mes. No calcula utilidad ni mezcla monedas.

Al entrar al escritorio se carga el perfil si hace falta y se actualiza el resumen. Una consulta fallida muestra «—» y permite reintentar; una respuesta vacía muestra cero y una invitación para añadir el primer bus. Los accesos siguen disponibles ante fallos parciales.

«Registrar ingreso» abre el formulario diario existente en un modal. «Registrar gasto» abre la selección de vehículo existente. Las tarjetas y la navegación conducen a los módulos actuales.

El acceso espera la carga del perfil antes de navegar al escritorio. Si falla esa carga, limpia la sesión del intento. Cerrar sesión también borra el perfil en memoria.

## Verificación

- Build de producción correcto, generado en una carpeta temporal. Los presupuestos de estilos se ajustaron al diseño de las nuevas páginas.
- Prueba aislada del servicio real de autenticación: espera al perfil, limpia sesión y perfil al salir, rechaza respuestas malformadas y elimina la sesión cuando falla la consulta del perfil.
- Navegador: validación de campos vacíos, control mostrar/ocultar contraseña, vista de escritorio y móvil de 390 px, enlaces, estados de flota vacía y consultas fallidas; sin desbordamiento horizontal en los tamaños revisados.
- Para revisar visualmente el escritorio se compiló una aplicación temporal con servicios simulados. Esos datos de demostración no forman parte del frontend entregado ni se guardaron en el backend.

El backend local no permitió iniciar sesión con los valores que traía originalmente el formulario. Queda pendiente comprobar el recorrido completo de acceso y guardado con una cuenta válida. Los formularios internos conservan los problemas señalados en `evaluacion-frontend.md`; esta entrega se centra en acceso y escritorio.

La suite de pruebas completa no se ejecutó: la evaluación anterior identificó imports obsoletos en sus archivos. El build conserva advertencias de Ionic/Stencil y un import no utilizado en el detalle de operadores.
