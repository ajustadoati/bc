# Buses: listado, registro y ficha

## Listado

El listado usa el mismo estilo del escritorio y los ingresos: fondo claro, verde como color principal, iconos y la ilustración local de la flota. Muestra exclusivamente buses recibidos del servicio; se retiraron las unidades ficticias que tenía la pantalla original.

- Resumen de unidades, marcas y tipos representados en la flota.
- Búsqueda por número, placa, marca, modelo y empresa; filtro por tipo de vehículo.
- Orden por número de unidad ascendente o descendente y por marca; páginas de nueve tarjetas.
- Tarjetas con placa, empresa, tipo, acceso a ficha, edición y eliminación.
- Estados de carga, error, flota vacía y búsqueda sin resultados.
- Confirmación visible y actualización tras registrar, editar o eliminar.

La confirmación de eliminación indica que el backend también borra los ingresos y gastos asociados a la unidad, tal como implementa `VehicleService.deleteVehicle`. Un fallo conserva la tarjeta y muestra un mensaje.

## Registro y edición

- Formulario por secciones: identificación y datos de la unidad. Vista previa de la ficha en escritorio.
- Unidad numérica entera positiva compatible con el campo Java `int`; tipo, placa, marca, modelo y empresa obligatorios.
- No se aceptan campos compuestos solo por espacios. Se recortan espacios al guardar y la placa se normaliza a mayúsculas.
- Se comprueban números de unidad y placas repetidas dentro de la flota cargada. En edición se excluye el propio bus. Esta comprobación local no sustituye la validación del servidor.
- Sugerencias de marcas y empresas ya registradas. Si hay una sola empresa, se propone al registrar; si hay un solo tipo disponible, se selecciona automáticamente.
- Un tipo anterior que ya no está disponible aparece identificado y debe cambiarse antes de guardar.
- Bloqueo de campos, botones y cierre durante el guardado; los errores conservan los datos.
- Formulario adaptable a móvil, con botones de guardar y cancelar siempre accesibles.

Se conserva el contrato del backend: la consulta de la flota requiere `User.id`, mientras que crear un vehículo resuelve el propietario por `numberId`, recibido en el campo `userId`. El formulario anterior usaba el identificador del token también para consultar la flota; ahora usa el identificador que corresponde a cada operación.

## Ficha

Presenta número, placa, marca, modelo, tipo y empresa. Permite pasar al formulario de edición o a los gastos de esa unidad usando su identificador interno.

## Verificación

- Compilación del frontend completo en producción, sin errores. Persisten avisos de Ionic/Stencil y un import sin usar en operadores, ajenos a este cambio.
- `node scripts/check-vehicle-validation.cjs`: 31 comprobaciones de números de unidad, campos vacíos, placas normalizadas, duplicados, exclusión al editar y contenido del payload.
- Pruebas con los componentes reales y servicios simulados: búsquedas, filtro, orden, paginación, registro, edición desde la ficha y desde la tarjeta, actualización del listado, confirmación de eliminación y navegación a gastos.
- Errores de carga, catálogo no disponible, catálogo vacío, fallo de edición y fallo de eliminación.
- Carga del perfil cuando todavía no está en memoria y comprobación de los identificadores usados por las consultas y el guardado.
- Registro desde móvil de 390 px, revisión de anchuras y de los botones fijos del formulario.

La aplicación temporal de pruebas está fuera del repositorio. No se crearon, editaron ni eliminaron registros reales de MySQL. La prueba autenticada contra el backend real queda pendiente de una sesión válida.
