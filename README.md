
# Email Sender API

Esta API desarrollada con Node.js, Express, TypeScript y Prisma permite el envío de correos electrónicos de manera asíncrona, con la capacidad de realizar reintentos en caso de fallos en el envío.


## API Reference

#### Establecer y enviar emails

Este endpoint permite enviar lotes de correos electrónicos. Se espera que el cuerpo de la solicitud contenga un array de objetos, cada uno con la siguiente estructura.

```http
  POST /api/email/handler-send-emails
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Correo electrónico a enviar |
| `subject` | `string` | **Required**. Subject del correo electrónico |
| `body` | `string` | **Required**. Html del correo electrónico |

La API generará un lote con un identificador único (UUID) y guardará la información de cada correo en la base de datos, vinculándolos al número de lote. Luego, ejecutará en segundo plano una función asincrónica para enviar los correos electrónicos.





## Procesos de envio
1. **Generación de Lote**: Se crea un lote único para agrupar los correos electrónicos.
2. **Almacenamiento en Base de Datos**: Se guardan los registros de correos electrónicos en la base de datos, asociados al número de lote.
3. **Envío Asíncrono**: Se ejecuta en segundo plano una función asincrónica que recorre cada correo, intenta enviarlo y actualiza el estado en la base de datos.
4. **Reporte de Envío**: Al finalizar el proceso, se envía un informe al correo especificado con detalles sobre los correos enviados, no enviados y el número de lote.
5. **Reintentos**: En caso de fallos, se realizarán reintentos hasta un máximo de 10 veces para los correos que no se pudieron enviar inicialmente.
6. **Desistimiento**: Después de 10 intentos, los correos que no se pudieron enviar se consideran como no enviados.
## Variables de Entorno

La configuración de la API se realiza mediante variables de entorno. Se deben proporcionar los detalles de conexión a la base de datos y las credenciales del servicio de correo electrónico.

- `PORT`: Puerto por donde se ejecutará el proyecto.
- `DATABASE_URL`: URL de la conexión a la base de datos MySQL.
- `NODE_ENV`: Modo de ejecución del proyecto en "dev" o "production".
- `CREDENTIAL_EMAIL_HOST`: Host del servidor de correo electrónico.
- `CREDENTIAL_EMAIL_PORT`: Puerto del servidor de correo electrónico.
- `CREDENTIAL_EMAIL`: Correo electrónico por el cual se enviará los correos.
- `CREDENTIAL_EMAIL_USER`: Usuario del servidor de correo electrónico.
- `CREDENTIAL_EMAIL_KEY_PASS`: Contraseña del servidor de correo electrónico.

