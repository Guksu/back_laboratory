import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import multer from "multer";
import path from "path";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app: Express = express();
const httpServer = createServer(app);

const PORT: number = 8080;

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

if (process.env.NODE_ENV == "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use("/upload", express.static(__dirname + "/upload"));

const io = new Server(httpServer, {
  path: "/socket/chat",
  cors: {
    origin: "*",
    credentials: true,
  },
});

const chatUserListMap: Map<string, string> = new Map();

io.on("connection", (socket: Socket) => {
  console.log(`유저입장 : ${new Date()} 유저아이디:${socket.id}`);

  socket.on("userJoin", ({ userName }: { userName: string }) => {
    chatUserListMap.set(socket.id, userName);
    const chatUserListArray = Array.from(chatUserListMap, (entrty) => {
      return { userId: entrty[0], userName: entrty[1] };
    });
    io.emit("userList", chatUserListArray);
  });

  socket.on("sendMessage", ({ userName, message }: { userName: string; message: string }) => {
    io.emit("message", { userName, message });
  });

  socket.on("disconnect", () => {
    console.log(`유저나감 : ${new Date()} 유저아이디:${socket.id}`);
    chatUserListMap.delete(socket.id);
    const chatUserListArray = Array.from(chatUserListMap, (entrty) => {
      return { userId: entrty[0], userName: entrty[1] };
    });
    io.emit("userList", chatUserListArray);
  });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + `/upload/chat`);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    },
  }),
});

app.post("/upload", upload.single("chatImage"), (req: Request, res: Response) => {
  const imagePath: string = req.file ? `http://localhost:8080/upload/chat/${req.file?.filename}` : "";
  const { userName } = req.body;

  io.emit("message", { userName, imagePath });

  res.status(200).send({
    status: 200,
    message: "ok",
  });
});

httpServer.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
