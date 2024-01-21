export interface iMails {
  toEmail: string | any | undefined;
  subject?: string;
  message?: string;
  html?: string;
}

export interface iMailRequest {
  id_email_send?: number;
  number_lote?: string;
  email: string;
  subject: string;
  body: string;
}