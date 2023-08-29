// 라우터 만드는법 익스프레스 라우터 받아오기
// 해당하는 라우터를 웹 전달 -> app.js 불러오기

import express from "express";
import joi from "joi";
import Todo from "../schemas/todo.schemas.js";

const router = express.Router(); //* 생성한 라우터를 외부로 보내줘야한다.

//  **할 일 생성 API 유효성 검사 요구사항**

// 1. `value` 데이터는 **필수적으로 존재**해야한다.
// 2. `value` 데이터는 **문자열 타입**이어야한다.
// 3. `value` 데이터는 **최소 1글자 이상**이어야한다.
// 4. `value` 데이터는 **최대 50글자 이하**여야한다.
// 5. 유효성 검사에 실패했을 때, 에러가 발생해야한다.
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

// todo 할일등록 api
router.post("/todos", async (req, res, next) => {
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);
    // const {value} = req.body
    const { value } = validation;

    // 1-5 만약 클라이언트가  value 데이터를 전달하지 않았으면 -> 클라이언트에게 에러메세지 전달
    // value가 존재하지 않을 때, 클라이언트에게 에러 메시지를 전달합니다.
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: "해야할 일 (value)데이터가 존재하지 않습니다." });
    }

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    // findOne 한개의 데이터만 조회한다.
    // sort = 정렬한다. -> 어떤 컬럼을 ?
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();
    //* order에 (-) 를 붙이면 내림차순이 됨 !

    // 3. 만약 존재한다면 현재 해야할 일을 +1 히고 order 데이터가 존재하지않으면 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야할일 등록

    const todo = new Todo({ value, order }); //* 인스턴스 형식으로 만든것
    await todo.save(); // * 실제로 데이터 베이스에 저장한다.

    // 5. 해야할일 클라이언트에게 반환
    return res.status(201).json({ todo: todo });
  } catch (error) {
    // 라우터 다음에 있는 에러 처리 미들웨어를 실행한다.
    next(error);
    // console.error(error);
    // if (err.name === 'ValidationError') {
    //   return res.status(400).json({ errorMessage: err.message });
  }

  return res
    .status(500) //* 서버의 문제때문에 에러가 발생했다는 상태코드
    .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
});

// *데이터 베으스를 사용하는동안 해당 프로그램이 멈출 수 있다. async 사용하지 않으면 프로그램이 멈출 수있다. 비동기처리

// ** 해야할일 목록 조회 **// (api 등록할때는 라우터에 등록한다! Api는 조회의 기능 -> 매서드는 Get 이라고 하는 http 메서드 사용   )

// /routes/todos.router.js

/** 순서 변경, 할 일 완료/해제 / 해제 / 변경 **/
router.patch("/todos/:todoId", async (req, res) => {
  // 변경할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;
  // '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져옵니다.
  const { order, done, value } = req.body;

  // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  if (order) {
    // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
    currentTodo.order = order;
  }
  if (done !== undefined) {
    // 변경하려는 '해야할 일'의 doneAt 값을 변경합니다.
    currentTodo.doneAt = done ? new Date() : null;
  }
  if (value) {
    currentTodo.value = value;
  }

  // 변경된 '해야할 일'을 저장합니다.
  await currentTodo.save();

  return res.status(200).json({});
});

/** 할 일 삭제 **/
router.delete("/todos/:todoId", async (req, res) => {
  // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;

  // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  // 조회된 '해야할 일'을 삭제합니다.
  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

export default router;

//* 실제로 사용하는 익스프레스에 적용 시키기 위해서는 app.js 에서도 똑같이 라우터에 추가 해줘야한다.
