# Detalle de ingresos

El historial abre el detalle en una ventana amplia en escritorio y a pantalla completa en móvil. Sigue los colores, tipografía e iconos del escritorio y de los formularios renovados.

## Información y acciones

- Resumen con bus, fecha de la jornada, identificador del registro y total en USD con dos decimales.
- Desglose de pagos con importe, porcentaje y barra visual. Los importes recibidos como texto se convierten y suman en centavos. Para totales nulos o porcentajes fuera de rango se muestra un guion, sin divisiones por cero.
- Kilometraje inicial, final y distancia cuando hay lecturas. Cero es un valor válido. Las lecturas incompletas o invertidas no producen una distancia inventada.
- Conductor principal, segundo conductor y colector según las asignaciones del registro; notas con saltos de línea conservados.
- Nombres de vehículos, operadores y tipos de pago cargados por separado en una petición agrupada. Un fallo de cualquiera de esos catálogos conserva los datos económicos y las otras referencias, con aviso y reintento. Si falta un nombre se muestra su identificador.
- Resolución del perfil antes de consultar los catálogos, usando su identificador interno. Las consultas se cancelan al destruir la pantalla.
- Botones de volver y eliminar siempre accesibles en el pie. La eliminación requiere confirmación, impide repetir la solicitud y bloquea el cierre mientras se procesa. Si falla, conserva el detalle con un mensaje visible. Al completar la eliminación se actualiza el historial y su resumen.
- Acceder a la ruta del detalle sin un registro muestra una indicación para seleccionarlo y permite volver al historial.

## Verificación

- Compilación Angular de plantillas y producción del frontend.
- `node scripts/check-income-detail.cjs`: 21 comprobaciones de nombres, importes, porcentajes, fecha y kilometraje, incluyendo valores cero y datos no numéricos.
- Navegador con el historial, modal y confirmación reales, y servicios simulados: abrir y cerrar, cancelar la eliminación, eliminación correcta que reduce el historial de 15 a 14 registros, bloqueo de botones durante la solicitud y error de eliminación que conserva los 15 registros.
- Catálogo de tipos de pago fallido y recuperación al reintentar; operadores no disponibles; identificadores ausentes de los catálogos; ausencia de notas, pagos y datos opcionales; total y distancia cero; acceso a la ruta sin registro.
- Revisión visual en escritorio de 1440 × 1080, móvil de 390 × 844 y ausencia de desbordamiento en 320 px. Encabezado y acciones permanecen visibles mientras el contenido se desplaza.

Las pruebas se ejecutaron en una aplicación temporal fuera del repositorio, con datos de demostración. No se escribieron datos en MySQL. La integración con datos reales requiere verificar una sesión autenticada válida. Se mantienen las advertencias de compilación preexistentes de Ionic/Stencil y el import no utilizado de la pantalla de operadores.
