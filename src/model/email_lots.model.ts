import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.lib";
import { iMessage } from "../interface/iMessage.interface";
import { MessageUtils } from "../utils/message.utils";

export class EmailLotsModel {
  private conn;
  private _prisma;
  constructor() {
    const conn = prisma;
    this.conn = conn.email_lots;
    this._prisma = conn;
  }

  async createLote(
    data: Prisma.XOR<
      Prisma.email_lotsCreateInput,
      Prisma.email_lotsUncheckedCreateInput
    >
  ): Promise<iMessage> {
    try {
      const create = await this.conn.create({
        data,
        select: {
          id_email_lot: true,
          lot_number: true,
        },
      });
      await this._prisma.$disconnect();
      return MessageUtils(false, 200, "Ok", create);
    } catch (error) {
      console.log(error);
      await this._prisma.$disconnect();
      return MessageUtils(true, 500, "Error");
    }
  }

  async updateStatusLote(numberLote: string, status: number) {
    try {
      await this.conn.update({
        where: {
          lot_number: numberLote,
        },
        data: {
          id_status: status,
        },
      });
      await this._prisma.$disconnect();
      return MessageUtils(false, 200, "Ok");
    } catch (error) {
      await this._prisma.$disconnect();
      return MessageUtils(true, 500, "Error");
    }
  }
}
