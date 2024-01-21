import { iMails } from "../interface/iMails.interface";
import nodemailer from "nodemailer";
import { MessageUtils } from "../utils/message.utils";

export default class Mails {
  private mailOptions: any;
  private transporter: any;
  constructor(data: iMails) {
    this.mailOptions = {
      from: process.env.CREDENTIAL_EMAIL,
      to: data?.toEmail || null,
      subject: data.subject,
      text: data.message,
      html: data.html,
    };

    const smtpConfig = {
      host: process.env.CREDENTIAL_EMAIL_HOST,
      port: process.env.CREDENTIAL_EMAIL_PORT, // Puedes cambiar a 25 si prefieres ese puerto
      secure: false, // TLS required, por lo tanto, no es seguro
      auth: {
        user: process.env.CREDENTIAL_EMAIL_USER,
        pass: process.env.CREDENTIAL_EMAIL_KEY_PASS,
      },
    };
    const transporter = nodemailer.createTransport(<any>smtpConfig);
    this.transporter = transporter;
  }

  setEmailTo(email: string) {
    this.mailOptions.to = email;
  }

  setEmailSubject(subject: string) {
    this.mailOptions.subject = subject;
  }

  setEmailHtml(html: string) {
    this.mailOptions.html = html;
  }

  async sendMail() {
    try {
      const sendMail = await this.transporter.sendMail(this.mailOptions);
      return MessageUtils(false, 200, "Ok", sendMail);
    } catch (error) {
      console.log(error);
      return MessageUtils(true, 400, "Error send mail", error);
    }
  }
}
