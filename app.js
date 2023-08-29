import express from "express";
import connect from "./schemas/index.js";
import todosRouter from "./routes/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./assets"));
//*  정적인파일을 assets 폴더에있는 파일로 서빙을 할거다.

// 미들웨어4 (request 로그 남기는 미들웨어)
app.use((req, res, next) => {
  console.log("Request URL:", req.originalUrl, " - ", new Date());
  next();
});

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

app.use("/api", (router, todosRouter));
// * 에러 처리 미들웨어차리를 등록한다
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});

// 미들웨어는 **등록된 순서대로 실행**됩니다. **TodoRouter**에서 비즈니스 로직을 수행한 후 발생한 에러는
// **다음 미들웨어로 전달**됩니다.
// 이 때, 에러 처리 미들웨어가 라우터 이후에 등록되어 있으면, 에러를 잡아 처리할 수 있게 되는것이죠.
// 반대로, **라우터 이전에 에러 처리 미들웨어를 등록**하면 라우터에서 발생한 에러를 처리할 수 없습니다.
// 왜냐하면, **라우터에서 발생한 에러는 라우터 이후에 등록된 미들웨어로 전달*
