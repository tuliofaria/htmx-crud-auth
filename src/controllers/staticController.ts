import { Router, Request, Response } from "express";

export const staticController = Router();

staticController.get("/", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/hero");
  }
  res.render("index");
});

staticController.get("/about", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/about");
  }
  res.render("about");
});
