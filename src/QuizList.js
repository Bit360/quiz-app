import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Link } from "react-router-dom";
import { Button, List, ListItem, Typography, Box } from "@mui/material";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const querySnapshot = await getDocs(collection(db, "quizzes"));
      setQuizzes(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })));
    };
    fetchQuizzes();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
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
          Просмотреть результаты
        </Button>
      </Box>
      
      <List>
        {quizzes.map(quiz => (
          <ListItem 
            key={quiz.id} 
            sx={{ 
              border: 1, 
              borderColor: 'grey.300', 
              borderRadius: 1, 
              mb: 1 
            }}
          >
            <Link 
              to={`/quiz/${quiz.id}`} 
              style={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                width: '100%' 
              }}
            >
              <Typography variant="h6">{quiz.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {quiz.questions?.length || 0} вопросов • 
                {quiz.isAnonymous ? ' Анонимный' : ' Требуется ФИО'} • 
                {quiz.isControl ? ` Контрольный (${quiz.passingScore}% для сдачи)` : ' Обычный'}
              </Typography>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}