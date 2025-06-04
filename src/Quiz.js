import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Quiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      const docRef = doc(db, "quizzes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuiz(docSnap.data());
      }
    };
    fetchQuiz();
  }, [id]);

  const handleNext = () => {
    if (selectedOption === quiz.questions[currentQuestion].correctOption) {
      setScore(score + 1);
    }
    setCurrentQuestion(currentQuestion + 1);
    setSelectedOption(null);
  };

  const saveResult = async () => {
    await addDoc(collection(db, "results"), {
      quizId: id,
      score,
      total: quiz.questions.length,
      timestamp: new Date(),
    });
    alert("Результат сохранен!");
  };

  if (!quiz) return <div>Загрузка...</div>;
  if (currentQuestion >= quiz.questions.length) {
    return (
      <div>
        <h2>Ваш результат: {score} из {quiz.questions.length}</h2>
        <button onClick={saveResult}>Сохранить результат</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{quiz.questions[currentQuestion].text}</h2>
      <ul>
        {quiz.questions[currentQuestion].options.map((opt, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
              />
              {opt}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleNext}>Далее</button>
    </div>
  );
}