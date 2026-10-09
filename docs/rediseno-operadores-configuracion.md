# Operadores y configuración

Las pantallas usan el mismo estilo del escritorio, buses e ingresos: verde, fondos claros, tarjetas y una jerarquía sencilla. En móvil se priorizan las listas y las acciones; las ventanas de formulario y detalle ocupan toda la pantalla y mantienen sus botones en un pie fijo.

## Operadores

- Directorio con iniciales, rol, cédula y teléfono; búsqueda por nombre, documento o contacto sin distinguir acentos; filtro por conductor o colector y páginas de 12 fichas.
- Resumen del equipo, conductores y colectores. Los administradores no forman parte del directorio operativo.
- Estados de carga, directorio vacío, búsqueda sin coincidencias y error con reintento. Se retiraron los datos de ejemplo que antes podían quedar visibles tras un fallo.
- Registro con rol, identidad y contacto; cédula repetida dentro de la empresa, texto vacío, teléfono y correo inválidos bloquean el envío. Se recortan los espacios sobrantes y se usa la empresa del perfil real del propietario.
- Resolución del perfil tras recargar la aplicación, antes de consultar los operadores por su identificador interno.
- Ficha con datos personales y enlaces de teléfono y correo solo cuando el dato tiene un formato válido. Los datos de contacto ausentes se indican claramente.
- Eliminación desde la ficha con confirmación, bloqueo de acciones durante la petición y conservación de la ficha si falla. Un conflicto del servidor muestra una indicación de registros asociados. Los administradores no tienen acción de eliminación en esta ficha.
- Registro y eliminación actualizan el directorio y sus contadores.

La consulta del servicio de operadores ahora carga todas las páginas de la respuesta HAL, ordenadas por identificador. Usa siempre `/api/users/{id}/company` con los parámetros de paginación; no sigue el enlace `next` que el ensamblador del backend construye hacia el listado global de usuarios. También admite diferentes nombres de relación dentro de `_embedded` y listas vacías sin ese bloque.

## Configuración y detalles

- Inicio con accesos y recuentos independientes para talleres y categorías. Un fallo de un catálogo no impide consultar el otro.
- Talleres: búsqueda, listado, teléfono, ficha con dirección y registro de un nuevo taller. El teléfono se envía como `mobileNumber`, según el contrato Java; se añadió la dirección opcional que ya admite el backend.
- Categorías: listado y creación, con acceso a los tipos de gasto de cada categoría.
- Tipos de gasto: listado, búsqueda, detalle y registro dentro de la categoría seleccionada. El formulario conserva la asociación con esa categoría.
- Formularios con campos obligatorios, nombres no vacíos, validación de teléfonos y control de nombres repetidos en la lista cargada.
- Guardados fallidos conservan los valores y muestran el error; las acciones de cierre y envío se bloquean mientras se guarda. Las listas se recargan después de guardar y el resumen de configuración se actualiza al regresar.
- Cerrar o volver desde cualquier catálogo conserva la sesión. Se retiró la llamada a `logout()` que antes se ejecutaba al cerrar talleres o categorías.
- Listas, formularios y detalles compartidos para mantener un comportamiento consistente; las rutas anteriores siguen disponibles mediante sus componentes de entrada.

Los endpoints y el backend permanecen iguales. No se añadieron estados de actividad, estadísticas de jornadas ni asignaciones de buses que la API no proporciona. Talleres y categorías conservan el alcance de sus endpoints actuales.

## Verificación

- Compilación de plantillas y compilación de producción del frontend, sin errores ni nuevas advertencias de tamaño. Continúan las advertencias existentes de Ionic/Stencil y selectores RTL.
- `node scripts/check-management.cjs`: 32 comprobaciones de validación, contactos, búsqueda, roles, duplicados y carga paginada. Comprueba que todas las páginas se solicitan desde el endpoint de empresa y que un fallo posterior no devuelve una lista parcial como completa.
- Navegador con componentes, ventanas y alertas reales y servicios simulados: búsqueda con acentos, filtros, paginación, estados vacíos y errores, perfil pendiente, obligatorios, cédula repetida, contactos inválidos, creación de operador, cancelación y eliminación correcta, conflicto al eliminar y error al guardar que conserva los datos.
- Configuración: error parcial y reintento, listas fallidas, creación de taller con teléfono y dirección, categoría y tipo, actualización de listas y resumen, navegación entre los distintos detalles, conservación de sesión y guardado fallido.
- Revisión visual en escritorio de 1440 × 1080 y móvil de 390 × 844, y ausencia de desbordamiento en listas, detalles y formularios de 320 px.

Las pruebas de escritura se hicieron en una aplicación temporal fuera del repositorio, con datos de demostración. No se modificó MySQL. La integración autenticada con datos reales queda pendiente de verificar con una sesión válida. La configuración local de `environment.ts` del usuario se conservó.
