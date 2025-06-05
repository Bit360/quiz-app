import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  Typography, 
  Box,
  Button,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const querySnapshot = await getDocs(collection(db, 'quizzes'));
    setQuizzes(querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })));
    setLoading(false);
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тест?')) {
      await deleteDoc(doc(db, 'quizzes', quizId));
      fetchQuizzes();
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Доступные тесты
      </Typography>
      
      <Button 
        component={Link} 
        to="/create" 
        variant="contained"
        sx={{ mb: 3 }}
      >
        Создать новый тест
      </Button>

      <List>
        {quizzes.map(quiz => (
          <Box key={quiz.id}>
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton
                    component={Link}
                    to={`/edit/${quiz.id}`}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(quiz.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              }
            >
              <ListItemButton >
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {quiz.title}
                      {quiz.isControl && (
                  <Chip 
                    label="Контрольный" 
                    color="primary" 
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
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
                
              </ListItemButton>
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>
    </Box>
  );
}