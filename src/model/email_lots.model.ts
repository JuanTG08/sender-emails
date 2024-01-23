import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.lib";
import { iMessage } from "../interface/iMessage.interface";
import { MessageUtils } from "../utils/message.utils";
import { CONST_STATUS_ALL } from "../constant/status.constant";

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

  async getInfoLote(idCompany: number, numberLote: string) {
    try {
      const loteInfo: any = await this.conn.findFirst({
        where: {
          id_company: {
            equals: idCompany,
          },
          lot_number: {
            equals: numberLote,
          },
        },
        select: {
          total_email_to_send: true,
          email_lots_status: {
            select: {
              name: true,
              id_email_lot_status: true,
            },
          },
          email_send: {
            where: {
              id_status: {
                in: [
                  CONST_STATUS_ALL.email_send_status.sended.id,
                  CONST_STATUS_ALL.email_send_status.not_sended.id,
                ],
              },
            },
            select: {
              email_number: true,
              email_to: true,
              response: true,
              email_send_status: {
                select: {
                  name: true,
                  id_email_status: true,
                },
              },
            },
          },
          _count: {
            select: {
              email_send: {
                where: {
                  id_status: {
                    equals: CONST_STATUS_ALL.email_send_status.sended.id,
                  },
                },
              },
            },
          },
        },
      });
      if (!loteInfo) throw new Error("Lote no encontrado");
      const loteInfoEmailsNotSended = await this.conn.findFirst({
        where: {
          id_company: {
            equals: idCompany,
          },
          lot_number: {
            equals: numberLote,
          },
        },
        select: {
          _count: {
            select: {
              email_send: {
                where: {
                  id_status: {
                    equals: CONST_STATUS_ALL.email_send_status.not_sended.id,
                  },
                },
              },
            },
          },
        },
      });
      await this._prisma.$disconnect();
      if (!loteInfoEmailsNotSended)
        throw new Error("Lote no encontrado para los emails no enviados");
      loteInfo._count.email_total_sended = loteInfo.email_send.length;
      loteInfo._count.email_not_sended =
        loteInfoEmailsNotSended._count.email_send;
      return MessageUtils(false, 200, "Ok", loteInfo);
    } catch (error) {
      await this._prisma.$disconnect();
      return MessageUtils(true, 500, "Error");
    }
  }
}
