import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuizList from "./QuizList";
import QuizForm from "./QuizForm";
import Quiz from "./Quiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/create" element={<QuizForm />} />
        <Route path="/quiz/:id" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;