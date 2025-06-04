import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Button, Radio, Checkbox, TextField, Box, Typography, LinearProgress } from "@mui/material";

export default function Quiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleOptionSelect = (optIndex) => {
    const question = quiz.questions[currentQuestion];
    
    if (question.type === "single") {
      setSelectedOptions([optIndex]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optIndex)
          ? prev.filter(i => i !== optIndex)
          : [...prev, optIndex]
      );
    }
  };

  const handleNext = () => {
    const question = quiz.questions[currentQuestion];
    let isCorrect = false;

    if (question.type === "text") {
      isCorrect = textAnswer.toLowerCase().trim() === question.correctText.toLowerCase().trim();
    } else {
      const correctSorted = [...question.correctOptions].sort();
      const selectedSorted = [...selectedOptions].sort();
      isCorrect = JSON.stringify(correctSorted) === JSON.stringify(selectedSorted);
    }

    if (isCorrect) setScore(score + 1);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptions([]);
      setTextAnswer("");
    } else {
      saveResult();
      setIsSubmitted(true);
    }
  };

  const saveResult = async () => {
    try {
      await addDoc(collection(db, "results"), {
        quizId: id,
        quizTitle: quiz.title,
        score,
        total: quiz.questions.length,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Ошибка при сохранении результата:", error);
    }
  };

  if (!quiz) return <Typography>Загрузка теста...</Typography>;
  if (isSubmitted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Тест завершен!
        </Typography>
        <Typography variant="h6">
          Ваш результат: {score} из {quiz.questions.length}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {score === quiz.questions.length 
            ? "Отличный результат! 🎉" 
            : score >= quiz.questions.length / 2 
              ? "Хороший результат! 👍" 
              : "Попробуйте еще раз! 💪"}
        </Typography>
      </Box>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion) / quiz.questions.length) * 100;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {quiz.title}
      </Typography>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 3, height: 8 }} 
      />
      
      <Typography variant="h6" gutterBottom>
        Вопрос {currentQuestion + 1} из {quiz.questions.length}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
        {question.text}
      </Typography>
      
      {question.type === "text" ? (
        <TextField
          fullWidth
          label="Ваш ответ"
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          margin="normal"
        />
      ) : (
        question.options.map((opt, optIndex) => (
          <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {question.type === "single" ? (
              <Radio
                checked={selectedOptions.includes(optIndex)}
                onChange={() => handleOptionSelect(optIndex)}
              />
            ) : (
              <Checkbox
                checked={selectedOptions.includes(optIndex)}
                onChange={() => handleOptionSelect(optIndex)}
              />
            )}
            <Typography>{opt}</Typography>
          </Box>
        ))
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={
            (question.type !== "text" && selectedOptions.length === 0) ||
            (question.type === "text" && !textAnswer.trim())
          }
        >
          {currentQuestion < quiz.questions.length - 1 ? "Далее" : "Завершить"}
        </Button>
      </Box>
    </Box>
  );
}