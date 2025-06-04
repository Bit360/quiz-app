import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export default function QuizForm() {
  const [title, setTitle] = useState("");
const [questions, setQuestions] = useState([{
  text: "",
  type: "single",
  options: ["", ""],
  correctOptions: [0],
  correctText: ""
}]);
// Новый метод для изменения типа вопроса
const handleQuestionTypeChange = (qIndex, type) => {
  const newQuestions = [...questions];
  newQuestions[qIndex].type = type;
  
  // Сбрасываем правильные ответы при смене типа
  if (type === "text") {
    newQuestions[qIndex].correctText = "";
  } else {
    newQuestions[qIndex].correctOptions = type === "single" ? [0] : [];
  }
  
  setQuestions(newQuestions);
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "quizzes"), { title, questions });
    alert("Тест создан!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    {questions.map((q, qIndex) => (
  <div key={qIndex}>
    <select 
      value={q.type}
      onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
    >
      <option value="single">Один ответ</option>
      <option value="multiple">Несколько ответов</option>
      <option value="text">Текстовый ответ</option>
    </select>

    {q.type !== "text" && (
      q.options.map((opt, optIndex) => (
        <div key={optIndex}>
          <input
            value={opt}
            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
          />
          {q.type === "single" ? (
            <input
              type="radio"
              name={`correct-${qIndex}`}
              checked={q.correctOptions.includes(optIndex)}
              onChange={() => setCorrectOption(qIndex, optIndex)}
            />
          ) : (
            <input
              type="checkbox"
              checked={q.correctOptions.includes(optIndex)}
              onChange={() => toggleCorrectOption(qIndex, optIndex)}
            />
          )}
        </div>
      ))
    )}

    {q.type === "text" && (
      <div>
        <p>Правильный ответ:</p>
        <input
          value={q.correctText}
          onChange={(e) => updateCorrectText(qIndex, e.target.value)}
        />
      </div>
    )}
  </div>
))}
      <button type="submit">Сохранить тест</button>
    </form>
  );
}