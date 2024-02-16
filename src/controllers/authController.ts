import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export const authController = Router();
export const JWT_SECRET = process.env.JWT_SECRET || "secret";

authController.get("/signin", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/signin");
  }
  res.render("signin");
});

authController.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!user || !(await compare(password, user.passwd))) {
    res.status(400).send("Invalid email or password");
    return;
  }
  const token = sign({ id: user.id, email }, JWT_SECRET);
  res.cookie("token", token, { maxAge: 900000, httpOnly: true });
  res.header("hx-redirect", "/app");
  res.send("");
});

authController.get("/signup", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/signup");
  }
  res.render("signup");
});
authController.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const checkEmail = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (checkEmail) {
    res.status(400).send("Email already exists");
    return;
  }
  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwd: hashedPassword,
    },
  });
  // Token - JWT
  const token = sign({ id: user.id, email }, JWT_SECRET);
  res.cookie("token", token, { maxAge: 900000, httpOnly: true });
  res.header("hx-redirect", "/app");
  res.send("");
});

authController.get("/logout", (req: Request, res: Response) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true });
  res.header("hx-redirect", "/");
  res.send("");
});
