import { Request, Response } from "express";
import { MessageUtils } from "../utils/message.utils";
import { iMailRequest } from "../interface/iMails.interface";
import { EmailLotsModel } from "../model/email_lots.model";
import { v4 as uuid } from "uuid";
import { CONST_STATUS_ALL } from "../constant/status.constant";
import { CONST_STATUS_CODE } from "../constant/status_code.constant";
import { EmailSendModel } from "../model/email_send.model";
import Mails from "../lib/emails.lib";
import { CONST_FLAG_TEST } from "../constant/flag_test.constant";
import { reportEmailSendedEmails } from "../templates/email.templates";

export class EmailController {
  async sendEmails(req: Request, res: Response) {
    try {
      // Obtenemos los emails y el id de la compañía del middleware
      const { emailCompany, idCompany, nameCompany } = req.company;
      // Validamos que los emails lleguen correctamente
      if (!emailCompany || !idCompany || !nameCompany)
        return res.status(401).json(MessageUtils(true, 401, "Unauthorized"));
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
      const emailFrom = emailCompany;
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
      const modelEmailSend = new EmailSendModel({
        idLote: setLote.payload.id_email_lot,
        numberLote: dataCreateLote.lot_number,
      });
      const getEmailsCreated: iMailRequest[] = [];
      for (const _email of emailsToSend) {
        getEmailsCreated.push(await modelEmailSend.setEmail(_email));
      }
      if (process.env?.FLAG_TEST === CONST_FLAG_TEST.no_test)
        EmailController.sendEmailsAsync(
          getEmailsCreated,
          dataCreateLote.lot_number,
          emailCompany,
          nameCompany
        );
      return res.status(200).json(
        MessageUtils(false, 200, "Ok", {
          numberLote: dataCreateLote.lot_number,
        })
      );
    } catch (error) {
      console.log(error);
      return res.json(
        MessageUtils(true, CONST_STATUS_CODE.internalServerError.code, "Error")
      );
    }
  }

  static async sendEmailsAsync(
    emails: iMailRequest[],
    numberLote: string,
    emailFrom: string,
    nameCompany: string
  ) {
    try {
      const modelEmailSend = new EmailSendModel({
        emailFrom,
      });
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
        toEmail: emailFrom,
        fromEmail: emailFrom,
        subject: "Informe de Correos Enviados",
        html: reportEmailSendedEmails({
          nameCompany: nameCompany,
          totalEmails: emails.length,
          totalEmailsSended: <number>sendEmails.payload.emailsSended.length,
          totalEmailsNoSended: <number>(
            sendEmails.payload.emailsNotSended.length
          ),
          numberLote,
          bodyTable: <string>sendEmails.payload.tableHTML,
        }),
      });
      await _Mails.sendMail();
      return MessageUtils(false, 200, "Ok");
    } catch (error) {
      console.log(error);
      return MessageUtils(
        true,
        CONST_STATUS_CODE.internalServerError.code,
        "Error"
      );
    }
  }
}
