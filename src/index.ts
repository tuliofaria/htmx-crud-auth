import express from "express";
import dotenv from "dotenv";
import { Liquid } from "liquidjs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { controllers } from "./controllers";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const engine = new Liquid();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.engine("liquid", engine.express());
app.set("views", "./src/views");
app.set("view engine", "liquid");

app.use(controllers);

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`);
});
