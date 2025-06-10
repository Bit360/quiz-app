import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  where,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Delete, ClearAll } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function Results() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    setQuizzes(querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })));
    setLoading(false);
  };

  const handleClearAllResults = async (quizId) => {
    setSelectedQuiz(quizId);
    setConfirmOpen(true);
  };

  const confirmClearAll = async () => {
    try {
      // Получаем все результаты для теста
      const resultsQuery = query(
        collection(db, 'results'),
        where('quizId', '==', selectedQuiz)
      );
      
      const snapshot = await getDocs(resultsQuery);
      const batch = writeBatch(db);
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      alert(`Удалено ${snapshot.size} результатов`);
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      alert('Ошибка при удалении результатов');
    } finally {
      setConfirmOpen(false);
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Результаты тестов
      </Typography>
      
      <List>
        {quizzes.map(quiz => (
          <Box key={quiz.id}>
            <ListItem
              secondaryAction={
                <>
                  <Button
                    component={Link}
                    to={`/results/${quiz.id}`}
                    sx={{ mr: 2 }}
                  >
                    Просмотреть
                  </Button>
                  <Button
                    onClick={() => handleClearAllResults(quiz.id)}
                    startIcon={<ClearAll />}
                    color="error"
                  >
                    Очистить все
                  </Button>
                </>
              }
            >
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {quiz.title}
                  </Typography>
                }
                secondary={
                  <>
                    <span>{quiz.settings.questionsToShow || 0} вопросов</span>
                    {quiz.isControl && (
                      <span> • Проходной балл: {quiz.passingScore}%</span>
                    )}
                  </>
                }
              />
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>

      {/* Диалог подтверждения */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Подтверждение</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить ВСЕ результаты этого теста?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
          <Button 
            onClick={confirmClearAll}
            color="error"
            variant="contained"
          >
            Удалить все
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}