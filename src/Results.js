import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  Typography, 
  Box,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material";
import { Link } from "react-router-dom";

export default function Results() {
  // 1. Объявляем все состояния
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Загрузка данных
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Безопасный запрос без сложных условий
        const q = query(
          collection(db, "quizzes"), 
          orderBy("createdAt", "desc") // Используем только одно поле для сортировки
        );
        const snapshot = await getDocs(q);
        setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error loading quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // 3. Состояния загрузки и ошибки
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>Ошибка: {error}</Typography>
      </Box>
    );
  }

  // 4. Основной рендер
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Результаты тестов
      </Typography>
      
      {quizzes.length === 0 ? (
        <Typography>Нет доступных тестов</Typography>
      ) : (
        <List>
          {quizzes.map((quiz) => (
            <Box key={quiz.id}>
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link}
                  to={`/results/${quiz.id}`}
                  sx={{ py: 2 }}
                >
                  <ListItemText
                    primary={quiz.title || "Без названия"}
                    secondary={
                      <>
                        <span>
                          {new Date(
                            quiz.createdAt?.seconds * 1000 || Date.now()
                          ).toLocaleDateString()}
                        </span>
                        {quiz.isControl && quiz.passingScore && (
                          <span> • Проходной балл: {quiz.passingScore}%</span>
                        )}
                      </>
                    }
                  />
                 
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