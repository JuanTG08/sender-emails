import express from "express";

declare global {
  namespace Express {
    interface Request {
      company: {
        idCompany: number;
        emailCompany: string;
        nameCompany: string;
      };
    }
  }
}
