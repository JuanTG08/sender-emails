import { NextFunction, Request, Response } from "express";
import { MessageUtils } from "../utils/message.utils";
import { CompaniesModel } from "../model/companies.model";

export class AuthMiddleware {
  static async validateApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorization } = req.headers;
      if (!authorization)
        throw new Error("No se encontró la cabecera de autorización.");
      const bearerToken = authorization.split(" ")[1];
      if (!bearerToken)
        throw new Error("No se encontró el token de autorización.");
      const modelCompanies = new CompaniesModel();
      const getCompany = await modelCompanies.validCompanyBySecretKey(
        bearerToken
      );
      if (getCompany.error || getCompany.statusCode != 200)
        throw new Error("No se encontró la compañía.");
      req.company = {
        idCompany: getCompany.payload?.id_company,
        emailCompany: getCompany.payload?.email_company,
        nameCompany: getCompany.payload?.name_company,
      };
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json(MessageUtils(true, 401, "Unauthorized"));
    }
  }
}
