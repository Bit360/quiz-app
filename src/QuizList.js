import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  Typography, 
  Box,
  Button,
  Chip,
  Divider
} from "@mui/material";
import { Link } from "react-router-dom";

export default function QuizList() {
  // 1. Сначала объявляем все состояния
  const [quizzes, setQuizzes] = useState([]); // Важно: quizzes объявлен здесь

  // 2. Получаем данные из Firebase
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const quizzesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizzes(quizzesData); // Используем объявленную переменную
      } catch (error) {
        console.error("Ошибка при загрузке тестов:", error);
      }
    };

    fetchQuizzes();
  }, []);

  // 3. Рендерим компонент
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Доступные тесты
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 3 }}>
        <Button 
          component={Link} 
          to="/create" 
          variant="contained"
          sx={{ mr: 2 }}
        >
          Создать новый тест
        </Button>
        
        <Button 
          component={Link} 
          to="/results" 
          variant="outlined"
        >
          Все результаты
        </Button>
      </Box>
      
      {/* 4. Проверяем наличие тестов перед рендерингом */}
      {quizzes.length === 0 ? (
        <Typography>Нет доступных тестов</Typography>
      ) : (
        <List>
          {quizzes.map((quiz) => (
            <Box key={quiz.id}>
              <ListItem
                disablePadding
                secondaryAction={
                  <Button 
                    component={Link}
                    to={`/results/${quiz.id}`}
                    size="small"
                  >
                    Результаты
                  </Button>
                }
              >
                <ListItemButton component={Link} to={`/quiz/${quiz.id}`}>
                  <ListItemText
                    primary={quiz.title || "Без названия"}
                    secondary={
                      <>
                        <span>{quiz.questions?.length || 0} вопросов</span>
                        {quiz.isControl && (
                          <span> • Проходной балл: {quiz.passingScore}%</span>
                        )}
                      </>
                    }
                  />
                  {quiz.isControl && (
                    <Chip 
                      label="Контрольный" 
                      color="primary" 
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
}