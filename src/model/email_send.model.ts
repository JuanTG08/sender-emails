import prisma from "../lib/prisma.lib";
import { MessageUtils } from "../utils/message.utils";
import { iMailRequest } from "../interface/iMails.interface";
import { CONST_STATUS_ALL } from "../constant/status.constant";
import Mails from "../lib/emails.lib";
import { CONST_STATUS_CODE } from "../constant/status_code.constant";
import { DateUtils } from "../utils/date.utils";
import { EmailLotsModel } from "./email_lots.model";

export class EmailSendModel {
  private conn;
  private _prisma;

  private idLote?: number;
  private numberLote?: string;
  private emailFrom?: string;

  constructor({
    idLote,
    numberLote,
    emailFrom,
  }: {
    idLote?: number;
    numberLote?: string;
    emailFrom?: string;
  }) {
    const conn = prisma;
    this.conn = conn.email_send;
    this._prisma = conn;
    this.idLote = idLote;
    this.numberLote = numberLote;
    this.emailFrom = emailFrom;
  }

  async setEmail(data: iMailRequest): Promise<iMailRequest> {
    try {
      await prisma.$connect();
    } catch (error) {
      console.log("Conexión abierta", error);
    }
    try {
      const dataCreate = {
        id_email_lot: <number>this.idLote,
        email_to: data.email,
        id_status: CONST_STATUS_ALL.email_send_status.loading.id,
      };
      const create = await this.conn.create({
        data: dataCreate,
        select: {
          id_email_send: true,
        },
      });
      await this._prisma.$disconnect();
      if (!create) return data;
      data.id_email_send = create.id_email_send;
      data.number_lote = this.numberLote;
      return data;
    } catch (error) {
      console.log(error);
      await this._prisma.$disconnect();
      return data;
    }
  }

  async sendEmails(data: iMailRequest[]) {
    const emailsNotSended: string[] = [];
    const emailsSended: string[] = [];
    const emailsError: string[] = [];
    let tableHTML = ``;
    try {
      if (!this.emailFrom) throw new Error("No se ha configurado el correo");
      const _mails = new Mails({
        fromEmail: this.emailFrom,
        html: "",
        toEmail: "",
        subject: "",
      });
      for (const item of data) {
        if (!item.id_email_send || !item.number_lote) {
          tableHTML += `
            <tr>
              <td>${DateUtils.formatearFechaHora(new Date())}</td>
              <td>${item.email}</td>
              <td>${item.subject}</td>
              <td>${CONST_STATUS_ALL.email_send_status.not_sended.name}</td>
            </tr>
          `;
          emailsError.push(item.email);
          continue;
        }
        // Obtenemos el correo electrónico
        const getEmail = await this.conn.findUnique({
          where: {
            id_email_send: item.id_email_send,
          },
          select: {
            attempts_count: true,
          },
        });
        if (!getEmail) {
          // Error ya que no encontró el correo electrónico
          emailsError.push(item.email);
          tableHTML += `
            <tr>
              <td>${DateUtils.formatearFechaHora(new Date())}</td>
              <td>${item.email}</td>
              <td>${item.subject}</td>
              <td>${CONST_STATUS_ALL.email_send_status.not_sended.name}</td>
            </tr>
          `;
          continue;
        }
        _mails.setEmailTo(item.email);
        _mails.setEmailSubject(item.subject);
        _mails.setEmailHtml(item.body);
        const sendEmail = await _mails.sendMail();
        // Sí no se pudo enviar el correo electrónico
        if (
          sendEmail.error ||
          sendEmail.statusCode != 200 ||
          !sendEmail.payload
        ) {
          await this.conn.update({
            data: {
              attempts_count: <number>getEmail.attempts_count + 1,
              id_status: CONST_STATUS_ALL.email_send_status.not_sended.id,
              response: JSON.stringify(sendEmail.payload),
            },
            where: {
              id_email_send: item.id_email_send,
            },
          });
          emailsNotSended.push(item.email);
          tableHTML += `
            <tr>
              <td>${DateUtils.formatearFechaHora(new Date())}</td>
              <td>${item.email}</td>
              <td>${item.subject}</td>
              <td>${CONST_STATUS_ALL.email_send_status.not_sended.name}</td>
            </tr>
          `;
          continue;
        }
        await this.conn.update({
          data: {
            attempts_count: <number>getEmail.attempts_count + 1,
            id_status: CONST_STATUS_ALL.email_send_status.sended.id,
            email_number: sendEmail.payload.messageId,
            date_sended: new Date(),
            response: sendEmail.payload?.response,
          },
          where: {
            id_email_send: item.id_email_send,
          },
        });
        emailsSended.push(item.email);
        tableHTML += `
          <tr>
            <td>${DateUtils.formatearFechaHora(new Date())}</td>
            <td>${item.email}</td>
            <td>${item.subject}</td>
            <td>${CONST_STATUS_ALL.email_send_status.sended.name}</td>
          </tr>
        `;
      }
      const modelEmailLote = new EmailLotsModel();
      await modelEmailLote.updateStatusLote(
        <string>this.numberLote,
        CONST_STATUS_ALL.email_lots_status.ended.id
      );
      return MessageUtils(false, 200, "Correos enviados", {
        emailsSended,
        emailsNotSended,
        emailsError,
        tableHTML,
      });
    } catch (error) {
      console.log(error);
      await this._prisma.$disconnect();
      const modelEmailLote = new EmailLotsModel();
      await modelEmailLote.updateStatusLote(
        <string>this.numberLote,
        CONST_STATUS_ALL.email_lots_status.disrupted.id
      );
      return MessageUtils(
        true,
        CONST_STATUS_CODE.internalServerError.code,
        "No fue posible enviar los correos",
        {
          emailsSended,
          emailsNotSended,
          emailsError,
          tableHTML,
        }
      );
    }
  }
}
