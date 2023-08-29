// schemas/index.js

import mongoose from "mongoose";

//* connect함수를 실행하면 아래의 내용이 실행됨
const connect = () => {
  mongoose
    .connect(
      // 빨간색으로 표시된 부분은 대여한 ID, Password, 주소에 맞게끔 수정해주세요!
      "mongodb+srv://sparta:test@cluster0.dom0jqp.mongodb.net/?retryWrites=true&w=majority",
      {
        dbName: "todo_memo", // todo_memo 데이터베이스명을 사용합니다.
      },
    )
    .then(() => console.log("MongoDB 연결에 성공하였습니다."))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on("error", (err) => {
  //* 서비스중에 에러발생되면 에러코드 출력
  console.error("MongoDB 연결 에러", err);
});

export default connect; //웹으로 출력시켜줌 -> 외부에서 사용하도록 app.js 파일로 요청
