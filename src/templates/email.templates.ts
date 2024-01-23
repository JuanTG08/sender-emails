export const reportEmailSendedEmails = ({
  nameCompany,
  totalEmails,
  totalEmailsSended,
  totalEmailsNoSended,
  numberLote,
  bodyTable,
}: {
  nameCompany: string;
  totalEmails: number;
  totalEmailsSended: number;
  totalEmailsNoSended: number;
  numberLote: string;
  bodyTable: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: "Arial", sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #333;
          }
          p {
            color: #555;
          }
          .totals {
            margin-top: 20px;
          }
          .lote {
            margin-top: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th,
          td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h1>Informe de Correos Enviados</h1>
        <p>Estimado ${nameCompany},</p>
        <p>A continuación, se presenta un resumen de los correos enviados:</p>
        <div class="totals">
          <p>Total de Correos: <strong>${totalEmails}</strong></p>
          <p>Correos Enviados: <strong>${totalEmailsSended}</strong></p>
          <p>Correos No Enviados: <strong>${totalEmailsNoSended}</strong></p>
        </div>
        <div class="lote">
          <p>Número de Lote: <strong>${numberLote}</strong></p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Destinatario</th>
              <th>Asunto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${bodyTable}
          </tbody>
        </table>
        <p>Gracias por utilizar nuestro servicio de correo electrónico.</p>
      </body>
    </html>
    `;
};
