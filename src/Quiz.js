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
const handleAnswer = () => {
  const question = quiz.questions[currentQuestion];
  
  if (question.type === "text") {
    // Проверка текстового ответа
    const isCorrect = userAnswer.toLowerCase() === question.correctText.toLowerCase();
    if (isCorrect) setScore(score + 1);
  } else {
    // Проверка выбранных вариантов
    const isCorrect = arraysEqual(selectedOptions.sort(), question.correctOptions.sort());
    if (isCorrect) setScore(score + 1);
  }
  
  setCurrentQuestion(currentQuestion + 1);
};
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}
const toggleCorrectOption = (qIndex, optIndex) => {
  const newQuestions = [...questions];
  const correctOptions = newQuestions[qIndex].correctOptions;
  
  if (correctOptions.includes(optIndex)) {
    newQuestions[qIndex].correctOptions = correctOptions.filter(i => i !== optIndex);
  } else {
    newQuestions[qIndex].correctOptions = [...correctOptions, optIndex];
  }
  
  setQuestions(newQuestions);
};
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
      {question.type === "text" ? (
  <input 
    value={userAnswer}
    onChange={(e) => setUserAnswer(e.target.value)}
  />
) : (
  question.options.map((opt, optIndex) => (
    <label key={optIndex}>
      <input
        type={question.type === "single" ? "radio" : "checkbox"}
        checked={selectedOptions.includes(optIndex)}
        onChange={() => handleOptionSelect(optIndex)}
      />
      {opt}
    </label>
  ))
)}
      </ul>
      <button onClick={handleNext}>Далее</button>
    </div>
  );
}