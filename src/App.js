import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuizList from "./QuizList";
import QuizForm from "./QuizForm";
import Quiz from "./Quiz";
import Results from "./Results";
import TestResults from "./TestResults"; // Новый компонент

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/create" element={<QuizForm />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:id" element={<TestResults />} /> {/* Новый маршрут */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;