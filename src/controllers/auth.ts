import { Router, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { hash } from "bcrypt";

const secret = process.env.JWT_SECRET || "supersecretchangeitlater";

export const authController = Router();

authController.post("/signin", async (req: Request, res: Response) => {
  res.send({ ok: 1 });
});

authController.get("/signin", (req: Request, res: Response) => {
  if (req.headers["hx-request"]) {
    return res.render("partials/signin");
  }
  res.render("signin");
});

authController.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  /*const user = await prisma.user.create({
      data: {
        email,
        passwd: password,
      },
    });*/
  // Token - JWT
  const hashedPassword = await hash(password, 10);
  console.log(hashedPassword);
  const token = sign({ email }, secret, { expiresIn: "1h" });
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
