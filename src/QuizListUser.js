import { useState, useEffect} from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Link } from 'react-router-dom';
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
} from '@mui/material';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      setQuizzes(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })));
      setLoading(false);
    };
    fetchQuizzes();
  }, []);

  if (loading) return <Typography>Загрузка...</Typography>;

  return (
      <List>
        {quizzes.map(quiz => (
          <Box key={quiz.id}>
            <ListItem
              disablePadding
             
            >
              <ListItemButton component={Link} to={`/quiz/${quiz.id}`}>
                <ListItemText
                   primary={
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      {quiz.title || 'Без названия'}
    </Typography>
  }
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
  );
}