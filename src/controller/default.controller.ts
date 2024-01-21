import { Request, Response } from "express";
import { MessageUtils } from "../utils/message.utils";

export class DefaultController {
  async pageNotFound(req: Request, res: Response) {
    res.status(200).json(MessageUtils(true, 404, "Page not found"));
  }
}
