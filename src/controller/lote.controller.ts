import { Request, Response } from "express";
import { CONST_STATUS_CODE } from "../constant/status_code.constant";
import { MessageUtils } from "../utils/message.utils";
import { StringUtils } from "../utils/string.utils";
import { EmailLotsModel } from "../model/email_lots.model";

export class LoteController {
  async infoLote(req: Request, res: Response) {
    try {
      const idCompany = req.company?.idCompany;
      const numberLote = req.params?.numberLote;
      if (!StringUtils._length(numberLote, 36, 35))
        return res.json(
          MessageUtils(
            true,
            CONST_STATUS_CODE.badRequest.code,
            "El id del lote es incorrecto"
          )
        );
      const modelLote = new EmailLotsModel();
      const dataLote = await modelLote.getInfoLote(idCompany, numberLote);
      return res.json(dataLote);
    } catch (error) {
      return MessageUtils(
        true,
        CONST_STATUS_CODE.internalServerError.code,
        "Error"
      );
    }
  }
}
