import { useState, useEffect, useMemo } from 'react';
import { shuffleArray } from './shuffleArray'; // Функция для перемешивания массива
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Button, Radio, Checkbox, TextField, Box, Stack, Typography, LinearProgress,Paper } from "@mui/material";

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
 const preparedQuestions = useMemo(() => {
    if (!quiz) return [];
    
    let questions = [...quiz.questions];
    
    // Применяем настройки теста
    if (quiz.settings?.randomizeQuestions) {
      questions = shuffleArray(questions);
    }
    
    if (quiz.settings?.questionsToShow) {
      questions = questions.slice(0, quiz.settings.questionsToShow);
    }
    
    // Перемешиваем ответы, если нужно
    if (quiz.settings?.shuffleAnswers) {
      questions = questions.map(q => {
        if (q.type === 'text') return q;
        
        const shuffledOptions = shuffleArray([...q.options]);
        const correctOptions = q.correctOptions.map(optIndex => 
          shuffledOptions.indexOf(q.options[optIndex])
        );
        
        return {
          ...q,
          options: shuffledOptions,
          correctOptions
        };
      });
    }
    
    return questions;
  }, [quiz]);
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
      <Box sx={{ p: 3, maxWidth: 700, margin: '0 auto' }}>
         <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {quiz.title}
          </Typography>
        </Paper>
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
    const question = preparedQuestions[currentQuestion];
    
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
    const question = preparedQuestions[currentQuestion];
    let isCorrect = false;

    if (question.type === "text") {
      isCorrect = textAnswer.toLowerCase().trim() === question.correctText.toLowerCase().trim();
    } else {
      const correctSorted = [...question.correctOptions].sort();
      const selectedSorted = [...selectedOptions].sort();
      isCorrect = JSON.stringify(correctSorted) === JSON.stringify(selectedSorted);
    }

    if (isCorrect) setScore(score + 1);

    if (currentQuestion < preparedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptions([]);
      setTextAnswer("");
    } else {
      saveResult();
      setIsSubmitted(true);
    }
  };

  const saveResult = async () => {
    const percentage = Math.round((score / preparedQuestions.length) * 100);
    const isPassed = !quiz.isControl || percentage >= quiz.passingScore;
    
    try {
      await addDoc(collection(db, "results"), {
        quizId: id,
        quizTitle: quiz.title,
        userName: quiz.isAnonymous ? "Аноним" : userName,
        score,
        total: preparedQuestions.length,
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
    const percentage = Math.round((score / preparedQuestions.length) * 100);
    const isPassed = !quiz.isControl || percentage >= quiz.passingScore;
    
    return (
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {quiz.title}
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ color: isPassed ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
            {quiz.isControl ? 
              (isPassed ? 'ТЕСТ СДАН!' : 'ТЕСТ НЕ СДАН') : 
              'ТЕСТ ЗАВЕРШЕН'}
          </Typography>
          
          <Typography variant="h5" sx={{ 
            color: isPassed ? 'success.main' : 'error.main',
            fontWeight: 'bold',
            mb: 2
          }}>
            {score} из {preparedQuestions.length}
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3 }}>
            ({percentage}% правильных ответов)
          </Typography>

          {quiz.isControl && (
            <Typography sx={{ 
              color: 'text.secondary',
              fontStyle: 'italic'
            }}>
              Проходной балл: {quiz.passingScore}%
            </Typography>
          )}
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setCurrentQuestion(0);
              setScore(0);
              setSelectedOptions([]);
              setTextAnswer('');
              setIsSubmitted(false);
            }}
            sx={{ px: 4 }}
          >
            Пройти ещё раз
          </Button>
          
          <Button
            component={Link}
            to="/"
            variant="outlined"
            size="large"
            sx={{ px: 4 }}
          >
            К списку тестов
          </Button>
        </Stack>
      </Box>
    );
  }

  const question = preparedQuestions[currentQuestion];
  const progress = ((currentQuestion) / preparedQuestions.length) * 100;

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
        Вопрос {currentQuestion + 1} из {preparedQuestions.length}
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
          {currentQuestion < preparedQuestions.length - 1 ? "Далее" : "Завершить"}
        </Button>
      </Box>
    </Box>
  );
}