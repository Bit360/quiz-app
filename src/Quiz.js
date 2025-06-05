import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Button, Radio, Checkbox, TextField, Box, Typography, LinearProgress,Paper } from "@mui/material";

export default function Quiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [userName, setUserName] = useState("");
  const [nameError, setNameError] = useState("");
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nameConfirmed, setNameConfirmed] = useState(false); // Новое состояние

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

   const handleNameSubmit = (e) => {
    e.preventDefault(); // Важно предотвратить стандартное поведение формы
    const trimmedName = userName.trim();
    
    if (!trimmedName) {
      setNameError("Введите ФИО");
      return;
    }
    
    const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
    if (nameParts.length < 2) {
      setNameError("Введите минимум два слова (Фамилию и Имя)");
      return;
    }
    
    setNameError("");
    setTestStarted(true);
  };

  if (!quiz) {
    return <Typography>Загрузка теста...</Typography>;
  }

  if (!quiz.isAnonymous && !testStarted) {
    return (
      <Box sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          Введите ваше ФИО
        </Typography>
        <form onSubmit={handleNameSubmit}>
          <TextField
            fullWidth
            label="Фамилия Имя"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Начать тест
          </Button>
        </form>
      </Box>
    );
  }

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
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isPassed = !quiz.isControl || percentage >= quiz.passingScore;
    
    try {
      await addDoc(collection(db, "results"), {
        quizId: id,
        quizTitle: quiz.title,
        userName: quiz.isAnonymous ? "Аноним" : userName,
        score,
        total: quiz.questions.length,
        percentage,
        isPassed,
        isControl: quiz.isControl,
        passingScore: quiz.passingScore || null,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Ошибка при сохранении результата:", error);
    }
  };

  if (isSubmitted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isPassed = !quiz.isControl || percentage >= quiz.passingScore;
    
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
         <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
  <Typography variant="h4" component="h1" sx={{ 
    fontWeight: 'bold', 
    color: 'primary.main',
    textAlign: 'center'
  }}>
    Результаты теста: {quiz.title}
  </Typography>
</Paper>
      
        
        <Typography variant="h6" sx={{ mt: 2 }}>
          Ваш результат: {score} из {quiz.questions.length} ({percentage}%)
        </Typography>
        
        {quiz.isControl && (
          <>
            <Typography sx={{ mt: 2 }}>
              Минимальный проходной балл: {quiz.passingScore}%
            </Typography>
            <Typography sx={{ 
              mt: 2, 
              fontSize: '1.2rem',
              color: isPassed ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              Статус: {isPassed ? 'СДАЛ' : 'НЕ СДАЛ'}
            </Typography>
          </>
        )}
        
        <Button 
          component={Link} 
          to="/quizlistuser" 
          variant="contained" 
          sx={{ mt: 3 }}
        >
          Вернуться к списку тестов
        </Button>
      </Box>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion) / quiz.questions.length) * 100;

  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {quiz.title}
      </Typography>
      
      {!quiz.isAnonymous && (
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Участник: {userName}
        </Typography>
      )}
      
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