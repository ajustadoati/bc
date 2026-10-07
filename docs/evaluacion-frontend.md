# Evaluación del frontend de BC

Fecha: 7 de octubre de 2026.

## Diagnóstico

BC tiene una base aprovechable para registrar vehículos, operadores, ingresos diarios y gastos. El frontend usa Angular 19, Ionic 8 y componentes standalone, con servicios separados por dominio. La mejora puede hacerse sobre esa base.

La experiencia actual está organizada alrededor de formularios y listas. Para un propietario de varios buses falta una vista que responda rápidamente: cuánto ingresó cada unidad, cuánto se gastó, cuál es el resultado del período y qué registros necesitan atención. La prioridad es combinar esa visión del negocio con flujos de registro confiables.

## Alcance y evidencia

- Se revisaron las rutas, la autenticación, las pantallas principales, los formularios, los servicios HTTP y los estilos del proyecto `bc`.
- Se consultaron puntualmente DTO y controladores de `backend-bc` para identificar dependencias de futuras funciones. No es una auditoría del backend.
- Se abrió la aplicación local en `http://[::1]:4200/`. El formulario de acceso carga; el intento con los valores predefinidos muestra «Credenciales incorrectas». El componente utiliza ese mensaje para cualquier error HTTP, por lo que no permite concluir la causa real del rechazo.
- Se comprobó en navegador que `/set-up` muestra la pantalla de configuración sin iniciar sesión. Esto confirma la falta de protección de esa pantalla en el frontend; no prueba acceso no autorizado a datos del servidor.
- Las pantallas autenticadas se evaluaron mediante sus plantillas, componentes y estilos. Quedan pendientes la comprobación visual con una sesión válida, las pruebas de escritorio y móvil de esas pantallas y los recorridos de guardado con datos de prueba.
- No se crearon, editaron ni eliminaron registros de negocio. El código de la aplicación se conserva; el único archivo añadido es este informe.

## Evaluación por pantalla

| Pantalla | Situación actual | Mejora propuesta |
| --- | --- | --- |
| Acceso | Formulario extendido a todo el ancho del escritorio; título «Login», sin identidad visual ni estado de envío. Contiene credenciales predefinidas en el código. | Panel de acceso con ancho limitado, nombre de la app, etiquetas en español, botón con estado «Entrando…», opción para mostrar contraseña y mensajes que distingan autenticación de conectividad. |
| Inicio | Cinco accesos a módulos, sin datos ni resumen. | Resumen con selector de período, ingresos y gastos por moneda, resultado cuando sea comparable, actividad reciente y acciones «Registrar ingreso» / «Registrar gasto». |
| Vehículos | Lista de datos básicos con botones de editar y eliminar por fila. Sin buscador. | «Mis buses»: búsqueda por unidad o placa, información resumida del período y ficha de cada bus. Acciones secundarias en un menú; eliminación dentro del detalle. |
| Ficha de vehículo | Modal con compañía, unidad, marca, modelo y placa. | Página con identidad del bus, ingresos, gastos e historial. Abrir nuevos registros con la unidad ya seleccionada. |
| Ingresos | Tarjetas con fecha, total y unidad; ya existe un estado vacío útil. Sin filtro por período o bus. | Conservar la legibilidad de las tarjetas, agregar filtros y totales del período; mostrar centavos cuando corresponda. |
| Registro diario | Formulario largo: personal, unidad, fecha, kilometraje y pagos. No muestra total durante la edición ni permite retirar una fila de pago. | Comenzar por bus y fecha; agrupar jornada, personal y cobros. Mostrar total, permitir quitar filas y señalar errores al lado del campo. |
| Gastos | Primero obliga a seleccionar vehículo; la pantalla se titula «Vehículos». No ofrece vista conjunta de la flota. | Lista general de gastos con filtros por bus, período y categoría. Conservar el acceso desde la ficha del bus. |
| Nuevo gasto | Campos de categoría, tipo, taller, kilómetros y tres importes sin explicación de sus relaciones. | Mostrar el bus y separar datos básicos de opcionales. Explicar moneda, mano de obra y total según reglas de negocio acordadas. Taller condicionado a la categoría cuando corresponda. |
| Operadores | Lista sin búsqueda, roles técnicos en mayúsculas y eliminación como acción visible. No hay edición conectada al listado. | Buscar por nombre, filtrar por conductor/colector, usar etiquetas legibles y permitir edición. Mantener identificación y contacto en el detalle. |
| Configuración | Talleres y categorías mediante modales anidados. | Catálogos con navegación clara y actualización inmediata al crear elementos. Usar «Cerrar» o «Volver» sin efectos sobre la sesión. |

Referencias principales: `src/app/home/home.page.html`, `src/app/vehiculos/vehiculos.page.html`, `src/app/vehiculos/vehiculos-details/vehiculos-details.page.html`, `src/app/ingresos/ingresos.page.html`, `src/app/ingresos/diario/diario.page.html`, `src/app/gastos/gastos.page.html`, `src/app/gastos/gastos-crear/crear/crear.page.html` y `src/app/operadores/operadores.page.html`.

## Correcciones funcionales prioritarias

Los siguientes hallazgos se verificaron en el código. Sus efectos dentro de una sesión autenticada aún necesitan una prueba de integración.

### Prioridad alta: sesión y datos confiables

1. **Cerrar talleres o categorías también cierra la sesión.** Los botones llaman a `logout()`, que ejecuta `authService.logout()` antes de navegar a configuración. Cambiar a un cierre de modal. Evidencia: `src/app/set-up/workshop-modal/workshop-modal.page.ts:38` y `src/app/set-up/categoria-modal/categoria-modal.page.ts:48`.

2. **El usuario no se restaura al recargar la página.** `checkToken()` valida que el token sea decodificable, pero no vuelve a cargar el usuario. El `BehaviorSubject` comienza en `null`, mientras varias páginas leen inmediatamente `user.id`. Además, el inicio de sesión carga al usuario con una suscripción independiente: navegar al siguiente módulo puede adelantarse a esa carga. Restaurar y esperar al usuario antes de cargar sus datos. Evidencia: `src/app/services/auth.service.ts:17`, `:34` y `:82`; `src/app/vehiculos/vehiculos.page.ts:40` y `src/app/operadores/operadores.page.ts:29`.

3. **Rutas duplicadas y pantallas internas sin guard.** `/crear` está definido para vehículos y gastos; la segunda declaración queda eclipsada. `/diario`, `/detalle`, `/set-up` y varias rutas de modales no tienen guard. Algunos componentes dependen de propiedades recibidas en un modal o de un `vehicleId` ausente en esas rutas alternativas. Normalizar rutas y proteger el área autenticada. Los guards complementan la autorización del servidor. Evidencia: `src/app/app.routes.ts:54`, `:59`, `:63`, `:67`, `:71` y `:75`.

4. **Validación incorrecta de pagos.** En el primer importe se usa `amount: [Validators.required, Validators.min(0.01)]`: `Validators.required` ocupa el lugar del valor inicial y no queda registrado como validador de requerido. Las filas posteriores se crean sin validadores. Usar un valor inicial vacío con ambos validadores, y aplicar la misma configuración a cada fila. Evidencia: `src/app/ingresos/diario/diario.page.ts:66` y `:152`.

5. **Una opción oculta puede impedir guardar el diario.** Al elegir «Otro» colector, el nombre se vuelve requerido. Si después se desactiva «¿Hay colector?», se vacía el nombre pero no se retira su validador. El formulario puede seguir inválido por un campo que ya no se ve. Evidencia: `src/app/ingresos/diario/diario.page.ts:113` y `:124`.

6. **Faltan comprobaciones en vehículos y gastos.** `validarVehiculo()` siempre devuelve `true` y el submit no verifica el estado de `NgForm`. En gastos sólo el tipo es requerido: importes, fecha y kilometraje no tienen validadores de dominio. Definir montos positivos, reglas de fecha y kilómetros finales mayores o iguales a los iniciales cuando ambos existan. Evitar que el mismo operador sea seleccionado como ambos conductores. Evidencia: `src/app/vehiculos/crear/crear/crear.page.ts:78`, `src/app/gastos/gastos-crear/crear/crear.page.ts:40` y `src/app/ingresos/diario/diario.page.ts:52`.

7. **El acceso tiene credenciales incorporadas.** Retirar los valores predefinidos del formulario y distinguir errores de credenciales, conexión y servidor. No se reproducen esos valores en este informe. Evidencia: `src/app/login/login.page.ts:17` y `:34`.

### Prioridad media: consistencia al usar la aplicación

8. **Las listas pueden quedar desactualizadas.** Operadores no escucha el cierre del modal de creación para actualizarse. La lista de gastos no procesa el resultado de eliminar desde su detalle y sólo carga en `ngOnInit`; el retorno desde la creación puede reutilizar la página mediante Ionic. Categorías y subcategorías tampoco actualizan su lista al cerrar el modal de alta. Devolver el registro guardado/eliminado o refrescar al volver. Evidencia: `src/app/operadores/operadores.page.ts:53`, `src/app/gastos/gastos-list/gastos-list/gastos-list.page.ts:29` y `:56`, `src/app/gastos/gatos-details/gatos-details.page.ts:70`, `src/app/set-up/categoria-modal/categoria-modal.page.ts:25` y `src/app/set-up/sub-categoria-modal/sub-categoria-modal.page.ts:46`.

9. **Los fallos de carga tienen poca respuesta visible.** Varias peticiones sólo escriben el error en consola. Vehículos y operadores tienen datos de ejemplo como estado inicial: si la petición falla, pueden parecer registros reales. Usar estados separados de carga, vacío, éxito y error, con reintento. Añadir estado de guardado y bloquear nuevos envíos mientras una petición está en curso.

10. **Fechas e importes tienen criterios distintos.** Ingresos muestra USD sin decimales; gastos muestra Bs y USD sin explicar conversión ni relación con mano de obra. En ingresos se mezclan reconstrucción de fechas con una zona fija `-04:00`, lo que puede desplazar el día según el entorno. El detalle de gastos trata el cero como «No especificado» mediante `||`. Definir fecha operativa y moneda explícitas, y distinguir cero de ausencia. Evidencia: `src/app/ingresos/ingresos.page.html:21`, `:24`, `src/app/ingresos/ingresos.page.ts:141` y `src/app/gastos/gatos-details/gatos-details.page.html:29`.

11. **Hay textos y controles ambiguos.** Crear un gasto muestra «Pago diario guardado correctamente». Varios cierres usan el icono de salir de sesión, sin nombre accesible. Varias filas tienen sólo `(click)` y no se declaran como botones o enlaces. Corregir textos y ofrecer acceso con teclado y etiquetas para los controles de icono. Evidencia: `src/app/gastos/gastos-crear/crear/crear.page.ts:95`, `src/app/vehiculos/vehiculos.page.html` y plantillas de detalle.

12. **Crear un colector dentro del diario tiene una asociación inconsistente.** Ese flujo usa `companyId: this.userId`; el alta normal de operadores usa `user.companyId`. La creación del colector y la del pago son dos peticiones: si falla el pago, reintentar puede crear otro colector. Revisar la asociación y el tratamiento del reintento. Evidencia: `src/app/ingresos/diario/diario.page.ts:171` y `src/app/operadores/crear/crear.page.ts`.

## Dirección de diseño

Propuesta inicial: una interfaz sobria con fondo neutro, superficies claras, azul como color principal y color reservado para acciones y estados. Una escala común de tipografía, espacios, bordes y radios ayudaría a que todas las pantallas parezcan parte de la misma aplicación. `src/theme/variables.scss` actualmente sólo contiene un comentario; buena parte de los estilos de página están vacíos y los ingresos son el módulo con más diseño propio.

En escritorio: navegación lateral, contenido con ancho controlado y tablas cuando faciliten comparar buses. En móvil: navegación inferior para Inicio, Buses, Movimientos y Más, tarjetas compactas y formularios de una columna. Ajustar el orden y la cantidad de destinos con una prueba de uso.

Cada pantalla debe tener una acción principal clara, títulos que indiquen contexto —por ejemplo, «Gastos · Unidad 007»— y confirmación visible después de guardar. Agrupar campos relacionados, identificar los opcionales y mostrar errores junto al campo. Utilizar modales para tareas breves y páginas para fichas e historiales que deban sobrevivir a una recarga o compartirse como enlace.

El modo oscuro sigue al sistema, pero existen fondos claros fijos en el formulario diario. Deben revisarse conjuntamente ambos temas, el contraste y el foco de teclado. La evaluación visual completa sigue pendiente por la falta de una sesión válida.

## Funciones con mayor valor para el propietario

| Orden | Función | Valor | Dependencia |
| --- | --- | --- | --- |
| 1 | Resumen por período y bus | Comparar ingresos y gastos registrados sin recorrer listas. | Prototipo posible con datos existentes; para una flota o historial grande, preferir agregados y filtros en API. |
| 2 | Ficha de bus con historial | Consultar la unidad y registrar movimientos en un mismo contexto. | Frontend y servicios existentes para lectura inicial. |
| 3 | Filtros y búsqueda | Encontrar una unidad, operador o movimiento rápidamente. | Frontend sobre datos cargados; API para paginación y búsquedas grandes. |
| 4 | Registro diario rápido | Menos pasos y menos errores, con total visible y opción de retirar filas. | Principalmente frontend; reglas de asignación y duplicados también en servidor. |
| 5 | Corregir movimientos existentes | Evitar borrar y volver a registrar errores de captura. | El frontend de ingresos no expone actualización; el backend tiene un PUT que necesita revisión de identidad. Gastos no tiene PUT en el controlador revisado. |
| 6 | Reporte/exportación por período | Compartir y revisar el historial con filtros y monedas explícitas. | Puede comenzar en frontend; verificar cobertura de datos y formato requerido. |
| 7 | Alertas de mantenimiento y estado del bus | Anticipar tareas y distinguir unidades disponibles. | Modelo y API para fechas, kilometraje objetivo y estados. El gasto de taller por sí solo no equivale a mantenimiento programado. |

Antes de presentar «ganancia», «rentabilidad» o «pendiente de cobro» hay que definir qué representa el ingreso diario, qué costos se incluyen y si existe una obligación de pago por jornada. Con los datos actuales conviene hablar de ingresos y gastos registrados. No sumar Bs y USD directamente ni sumar ambos si representan el mismo gasto convertido. Una jornada sin registro tampoco demuestra que el bus haya trabajado o que exista una deuda.

## Orden de implementación recomendado

1. Corregir sesión, cierres de modal, rutas, validaciones y actualización de listas. Añadir pruebas de esos comportamientos.
2. Crear los estilos compartidos y la navegación adaptable. Aplicarlos al acceso, inicio y lista de buses.
3. Incorporar ficha de bus, filtros y formularios de ingreso/gasto con total y errores por campo.
4. Implementar resúmenes y reportes con reglas monetarias acordadas; extender el backend para edición, agregados y mantenimiento donde haga falta.

Criterios de aceptación: recargar una página autenticada conserva el contexto; cerrar un modal conserva la sesión; guardar o eliminar actualiza el listado; un error conserva los datos del formulario y ofrece reintento; filas de pago vacías o negativas se rechazan; desactivar campos opcionales elimina sus validaciones; cada importe indica moneda; el usuario puede registrar movimientos desde el bus elegido sin seleccionarlo de nuevo; todos los controles principales funcionan con teclado y en móvil.

## Comprobación técnica

- TypeScript de aplicación: `tsc --project tsconfig.app.json --noEmit` termina correctamente.
- Compilación Angular de componentes y plantillas: `ngc --project tsconfig.app.json --noEmit` termina correctamente, con advertencia de `IonBackButton` no utilizado en el detalle de operadores.
- TypeScript de pruebas: `tsc --project tsconfig.spec.json --noEmit` falla por tres imports obsoletos: `authGuard`, `AuthInterceptorService` y `ConductoresPage`. Los archivos importan nombres que los componentes/servicios actuales no exportan. No se ejecutó la suite Karma.
- El empaquetado completo `ng build --configuration development`, dirigido a una carpeta temporal, terminó con código 134 sin diagnóstico adicional en dos intentos. No se considera validado el build ni se atribuye la causa a la aplicación. La comprobación de TypeScript y plantillas sí pudo completarse.

El siguiente paso recomendado es resolver la primera fase y preparar una propuesta visual del inicio y de la ficha de bus. La revisión visual con una sesión válida permitirá confirmar densidad, tamaños táctiles y comportamiento de los flujos actuales antes de sustituirlos.
