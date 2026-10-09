# Registro de gastos del vehículo

El formulario sigue el diseño del escritorio, ingresos, buses y configuración: fondo claro, tarjetas, iconos y acciones visibles. En escritorio incluye un resumen lateral del bus, concepto, fecha, taller y montos; en móvil los bloques se apilan y los botones permanecen en un pie fijo.

## Registro

El acceso «Registrar gasto» del escritorio abre `/gastos?accion=registrar`. Esta pantalla también se renovó: ilustración, fichas de buses con placa y modelo, búsqueda por unidad/placa/marca/empresa sin distinguir acentos, estados de carga, error y flota vacía. Cada ficha tiene «Registrar gasto», que abre directamente `/vehiculos/:vehicleId/gastos/nuevo`, y «Ver gastos», que lleva al historial. La selección ya no requiere atravesar el historial antes de registrar.

- Concepto y fecha, importes y detalles adicionales se presentan en tres bloques. La unidad y su placa se muestran para identificar a qué bus corresponde el gasto.
- Categoría y tipo son obligatorios. Cambiar de categoría cancela la consulta anterior y limpia el tipo seleccionado. Cuando hay un único tipo, se selecciona automáticamente.
- Fecha inicial del día local; se rechazan fechas inválidas y futuras. Se envía `YYYY-MM-DD` al `LocalDate` del backend, sin conversión de zona horaria.
- Se exige al menos un monto positivo en USD o Bs. Los dos se conservan por separado, sin conversión ni suma entre monedas. Se rechazan importes negativos, no finitos o con más de dos decimales.
- Taller, kilometraje, mano de obra y descripción son opcionales. Kilometraje entero entre cero y el máximo de un Integer Java; descripción limitada a 255 caracteres.
- El campo de mano de obra mantiene el contrato y la lógica existentes. El backend no declara su moneda ni si está incluido en los otros montos; se conserva por separado mientras se aclara esa regla con el propietario.
- Permite registrar un taller desde el formulario, crear una categoría si el catálogo está vacío y añadir un tipo cuando la categoría no tiene opciones. Al volver, recarga el catálogo, selecciona el registro persistido y conserva los datos del gasto.
- Cargas y errores diferenciados, con reintento. Si falla el catálogo de talleres, se permite registrar sin taller; fallos del bus o categorías bloquean el guardado.
- Resuelve el perfil después de recargar la aplicación y consulta los vehículos por el identificador interno del propietario. Una ruta inválida o un bus ausente de la flota cargada no permite guardar.
- Durante el envío se bloquean campos, cierre, navegación interna y nuevos envíos. Tras un guardado confirmado se vuelve al historial; un fallo conserva los valores. Si se guardó pero falla el regreso, se impide enviar otra vez el mismo formulario.

El payload contiene únicamente los campos admitidos por `ExpenseDto`; la categoría sirve para elegir el tipo y no se envía como campo adicional. No se cambiaron el backend ni los endpoints.

## Integración con el historial

El historial recarga sus datos al entrar, también cuando Ionic conserva la pantalla anterior en memoria. Muestra USD y Bs por separado, incluida una entrada registrada en una sola moneda; las fechas conservan el día operativo. La selección de vehículos puede cargar el perfil cuando aún no está disponible. Estas pantallas incorporan estados de carga y error con reintento.

## Verificación

- Compilación de plantillas y compilación de producción correctas, sin nuevas advertencias de tamaño. Persisten las advertencias existentes de Ionic/Stencil y selectores RTL.
- `node scripts/check-expense-validation.cjs`: 40 comprobaciones de importes, fechas, kilometraje, identificadores y payload, incluyendo ceros opcionales y ausencia de conversión de moneda.
- Navegador con los componentes y ventanas reales y servicios simulados: obligatorios, importe negativo, precisión decimal, kilometraje fraccionario, fecha futura, creación de taller/categoría/tipo con conservación de datos, cambio rápido de categoría, guardado correcto y bloqueo de acciones durante el envío, fallo de guardado que conserva los valores y recarga del historial previamente abierto.
- Revisión visual en escritorio de 1440 × 1300 y móvil de 390 × 844; controles sin desbordamiento horizontal a 320 px.
- Comprobación de rutas inválidas, unidad ausente de la flota, resolución del perfil al recargar y guardado sin taller cuando falla su catálogo.
- Recorrido desde el escritorio real hasta la selección y el formulario, con servicios ficticios: enlaces al bus correcto, búsqueda con y sin coincidencias, limpieza de búsqueda y regreso al historial. Revisión de las fichas en escritorio y móvil.

Se reinició el servidor de desarrollo de `bc` en `http://[::1]:4200/` porque conservaba referencias a los estilos antiguos de los formularios de configuración. La compilación nueva resuelve los componentes actuales.

Ante una captura que todavía mostraba la lista anterior en `localhost:4200/gastos`, se comprobó la respuesta real de `localhost`: el módulo servido contiene «Gastos de tu flota» y el enlace «Registrar gasto del bus», y ya no contiene la navegación de la lista antigua. El servidor entrega el módulo con `Cache-Control: no-cache`. Para evitar vistas conservadas durante cambios de componentes, el servidor de desarrollo usa recarga completa (`hmr: false`, `liveReload: true`). Una pestaña que aún conserve la aplicación anterior debe recargarse por completo; no se pudo acceder a la sesión del navegador externo de la captura.

Las escrituras de prueba se hicieron en una aplicación temporal fuera del repositorio, con datos ficticios. No se modificó MySQL. La integración autenticada con datos reales queda pendiente de verificar con una sesión válida. Se conservó la configuración local de `environment.ts`.
