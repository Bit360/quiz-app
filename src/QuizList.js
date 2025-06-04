import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Link } from "react-router-dom";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const querySnapshot = await getDocs(collection(db, "quizzes"));
      setQuizzes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchQuizzes();
  }, []);

  return (
    <div>
      <h1>Тесты</h1>
      <Link to="/create">Создать тест</Link>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id}>
            <Link to={`/quiz/${quiz.id}`}>{quiz.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}