import { Router, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { compare, hash } from "bcrypt";
import { prisma } from "../db";

export const secret = process.env.JWT_SECRET || "supersecretchangeitlater";

export const authController = Router();

authController.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (user && (await compare(password, user.passwd))) {
    const token = sign({ email, id: user.id }, secret, { expiresIn: "1h" });
    res.cookie("token", token, { maxAge: 1 * 60 * 60 * 1000, httpOnly: true });
    res.header("hx-redirect", "/app");
    return res.send("");
  }
  res.statusCode = 404;
  res.send("");
});

authController.get("/signin", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/signin");
  }
  res.render("signin");
});

authController.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwd: hashedPassword,
    },
  });

  const token = sign({ email, id: user.id }, secret, { expiresIn: "1h" });
  res.cookie("token", token, { maxAge: 1 * 60 * 60 * 1000, httpOnly: true });
  res.header("hx-redirect", "/app");
  res.send("");
});
authController.get("/signup", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/signup");
  }
  res.render("signup");
});

authController.get("/logout", (req: Request, res: Response) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true });
  res.header("hx-redirect", "/");
  res.send("");
});
