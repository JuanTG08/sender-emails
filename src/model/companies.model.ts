import prisma from "../lib/prisma.lib";
import { MessageUtils } from "../utils/message.utils";

export class CompaniesModel {
  private conn;
  private _prisma;
  constructor() {
    const conn = prisma;
    this.conn = conn.email_send;
    this._prisma = conn;
  }

  async validCompanyBySecretKey(secretKey: string) {
    try {
      const getCompany = await this._prisma.companies.findFirst({
        where: {
          secret_key: {
            equals: secretKey,
          },
        },
        select: {
          id_company: true,
          email_company: true,
          name_company: true,
        },
      });
      if (!getCompany) return MessageUtils(true, 404, "Compañía no encontrada");
      return MessageUtils(false, 200, "Compañía encontrada", getCompany);
    } catch (error) {
      return MessageUtils(true, 500, "Error interno");
    }
  }
}
