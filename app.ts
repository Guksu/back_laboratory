import express, { Express } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

const app: Express = express();
const PORT: number = 8080;

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan("dev"));
// app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
