import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export default function QuizForm() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ text: "", options: [""], correctOption: 0 }]);

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
          <input
            placeholder="Вопрос"
            value={q.text}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[qIndex].text = e.target.value;
              setQuestions(newQuestions);
            }}
          />
          {q.options.map((opt, optIndex) => (
            <div key={optIndex}>
              <input
                placeholder={`Вариант ${optIndex + 1}`}
                value={opt}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIndex].options[optIndex] = e.target.value;
                  setQuestions(newQuestions);
                }}
              />
            </div>
          ))}
        </div>
      ))}
      <button type="submit">Сохранить тест</button>
    </form>
  );
}