# Ingresos diarios

La pantalla de ingresos y el registro diario siguen el estilo del escritorio: fondo claro, verde como color principal, iconos de buses y acciones visibles. El backend y los endpoints permanecen iguales.

## Historial

- Resumen del importe, registros y buses que corresponde a los filtros seleccionados.
- Búsqueda por unidad, placa y descripción; filtros por bus, hoy, mes, historial completo o intervalo de fechas.
- Orden de más reciente a más antiguo y páginas de 12 registros. El resumen considera todos los resultados del filtro, no solo la página visible.
- Estados de carga, error y historial vacío, con reintentos y acceso al primer registro.
- Actualización tras guardar o eliminar, con confirmación visible.

## Registro diario

- Secciones para jornada, equipo, pagos y detalles opcionales, con total fijo y actualización inmediata.
- Importes obligatorios mayores que cero y con hasta dos decimales, también en las filas añadidas. Se pueden quitar filas conservando al menos una.
- Conductor principal obligatorio; segundo conductor distinto y colector opcional. Al desactivar estas opciones se limpian sus valores y validaciones.
- Un colector nuevo usa nombre, apellido y cédula reales, asociados a la empresa del propietario. Si se crea el colector pero falla el pago, queda seleccionado para evitar volver a crearlo en el siguiente intento.
- Fecha válida y sin jornadas futuras. Aviso cuando ya existe un registro del mismo bus y día, sin bloquear ingresos adicionales.
- Kilometrajes opcionales enteros no negativos: ambos presentes o ambos vacíos, y regreso igual o mayor que salida. Se admite iniciar en cero.
- Bloqueo de formulario, cierre y botones durante el guardado. Los errores mantienen los datos introducidos.
- El formulario se abre desde el historial y desde el escritorio con el mismo tamaño adaptable.

## Importes y fechas

Se conserva USD, la moneda que ya utilizaba la aplicación. Los importes se muestran con dos decimales y se suman como centavos para evitar concatenar valores devueltos como texto. La fecha de la jornada conserva la parte de calendario recibida, sin el desplazamiento horario fijo que usaba el detalle anterior.

## Verificación

- Compilación de producción del frontend y comprobación de plantillas Angular.
- `node scripts/check-income-validation.cjs`: 26 comprobaciones de importes, precisión, fechas, kilometraje y segundo conductor.
- Pruebas en navegador de filtros y sus totales, intervalos invertidos, búsqueda sin resultados y paginación.
- Formulario real con servicios simulados: obligatorios, filas añadidas y retiradas, colector activado y desactivado, segundo conductor repetido, kilometraje desde cero, guardado, actualización del historial, creación de colector y eliminación con confirmación.
- Error de carga, historial vacío y fallo de guardado que conserva datos y habilita nuevamente las acciones.
- Revisión visual en escritorio y móvil de 390 px, incluido el total fijo del formulario.

Las pruebas de guardado y eliminación usan datos de demostración en una aplicación temporal fuera del repositorio. No se hicieron escrituras en MySQL. La integración autenticada con datos reales queda pendiente de comprobar con una sesión válida.
