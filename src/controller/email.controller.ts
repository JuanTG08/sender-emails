import { Request, Response } from "express";
import { MessageUtils } from "../utils/message.utils";
import { iMailRequest } from "../interface/iMails.interface";
import { EmailLotsModel } from "../model/email_lots.model";
import { v4 as uuid } from "uuid";
import { CONST_COMPANIES } from "../constant/company.constant";
import { CONST_STATUS_ALL } from "../constant/status.constant";
import { CONST_STATUS_CODE } from "../constant/status_code.constant";
import { EmailSendModel } from "../model/email_send.model";
import Mails from "../lib/emails.lib";
import { CONST_FLAG_TEST } from "../constant/flag_test.constant";

export class EmailController {
  async sendEmails(req: Request, res: Response) {
    try {
      // Obtenemos los correos desde el body de la petición
      const emailsToSend: iMailRequest[] = req.body;
      // Validamos que los correos lleguen correctamente
      if (!emailsToSend)
        return res.json(
          MessageUtils(
            true,
            CONST_STATUS_CODE.badRequest.code,
            "No llegó los emails correctamente"
          )
        );
      const idCompany = CONST_COMPANIES.galias.id;
      const emailFrom =
        process.env.CREDENTIAL_EMAIL || CONST_COMPANIES.galias.email;
      // Vamos a crear el lote correspondiente a esta petición
      const modelEmailLots = new EmailLotsModel();
      const dataCreateLote = {
        lot_number: uuid(),
        id_company: idCompany,
        email_from: emailFrom,
        total_email_to_send: emailsToSend.length,
        id_status: CONST_STATUS_ALL.email_lots_status.sending.id,
      };
      const setLote = await modelEmailLots.createLote(dataCreateLote);
      // Validamos que el lote se haya creado correctamente
      if (setLote.error || setLote.statusCode != 200 || !setLote.payload)
        return res.json(
          MessageUtils(
            true,
            CONST_STATUS_CODE.internalServerError.code,
            "No fue posible crear el lote para los correos"
          )
        );
      // Vamos a crear los correos en el lote correspondiente
      const modelEmailSend = new EmailSendModel(
        setLote.payload.id_email_lot,
        dataCreateLote.lot_number
      );
      const getEmailsCreated: iMailRequest[] = [];
      for (const _email of emailsToSend) {
        getEmailsCreated.push(await modelEmailSend.setEmail(_email));
      }
      /*
      const getEmailsCreated = await Promise.all(
        emailsToSend.map((email) => modelEmailSend.setEmail(email))
      );*/
      if (process.env?.FLAG_TEST === CONST_FLAG_TEST.no_test)
        EmailController.sendEmailsAsync(
          getEmailsCreated,
          dataCreateLote.lot_number
        );
      return res
        .status(200)
        .json(MessageUtils(false, 200, "Ok", getEmailsCreated));
    } catch (error) {
      console.log(error);
      return res.json(
        MessageUtils(true, CONST_STATUS_CODE.internalServerError.code, "Error")
      );
    }
  }

  static async sendEmailsAsync(emails: iMailRequest[], numberLote: string) {
    try {
      const modelEmailSend = new EmailSendModel();
      const sendEmails = await modelEmailSend.sendEmails(emails);
      if (sendEmails.error || sendEmails.statusCode != 200) {
        // Debemos realizar procesos para reenviar los emails que no lograron enviarse
        /*return MessageUtils(
          true,
          CONST_STATUS_CODE.internalServerError.code,
          "Error al enviar los correos electrónicos"
        );*/
      }
      // Enviamos un correo indicando lo que sucedió a la empresa
      const _Mails = new Mails({
        toEmail: process.env.EMAIL_TO_REPORT,
        subject: "Información de los correos enviados",
        html: `
          <h1>Información de los correos enviados del lote: ${numberLote}</h1>
          ${sendEmails.payload.emailsSended.map(
            (mail: iMailRequest) => `<p>${mail.email}</p>`
          )}
          <hr />
          <h1>Información de los correos no enviados</h1>
          ${sendEmails.payload.emailsNotSended.map(
            (mail: iMailRequest) => `<p>${mail.email}</p>`
          )}
          ${sendEmails.payload.emailsError.map(
            (mail: iMailRequest) => `<p>${mail.email}</p>`
          )}
        `,
        /*html: `
          <h1>Información de los correos enviados del lote: ${numberLote}</h1>
          <p>Los correos enviados fueron (${sendEmails.payload.emailsSended.length}):</p>
          <ul>
            ${sendEmails.payload.emailsSended.map((email: string) => `<li>${email}</li>`)}
          </ul>
        `;*/
      });
      await _Mails.sendMail();
      return MessageUtils(false, 200, "Ok");
    } catch (error) {
      console.log("Error en el catch de sendEmailsAsync", error);
      return MessageUtils(
        true,
        CONST_STATUS_CODE.internalServerError.code,
        "Error"
      );
    }
  }
}
