"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = 8080;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
if (process.env.NODE_ENV == "production") {
    console.log("배포환경");
    app.use((0, morgan_1.default)("combined"));
}
else {
    console.log("개발환경");
    app.use((0, morgan_1.default)("dev"));
}
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, compression_1.default)());
app.use("/uploads", express_1.default.static(__dirname + "/uploads"));
const io = new socket_io_1.Server(httpServer, {
    path: "/socket/chat",
    cors: {
        origin: "*",
        credentials: true,
    },
});
io.on("connection", (socket) => {
    console.log(`유저입장 : ${new Date()} 유저아이디:${socket.id}`);
    socket.on("sendMessage", ({ userName, message }) => {
        io.emit("message", { userName, message });
    });
    socket.on("disconnect", () => {
        console.log(`유저나감 : ${new Date()}  유저아이디:${socket.id}`);
    });
});
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads/chat");
        },
        filename: function (req, file, cb) {
            const ext = path_1.default.extname(file.originalname);
            cb(null, path_1.default.basename(file.originalname, ext) + "-" + Date.now() + ext);
        },
    }),
});
app.post("/upload", upload.single("chatImage"), (req, res) => {
    var _a;
    const imagePath = req.file ? `uploads/chat/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}` : "";
    res.status(200).send({
        status: 200,
        message: "ok",
        data: { chatImg: imagePath },
    });
});
httpServer.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
