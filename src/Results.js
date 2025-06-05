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
  TextField,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Delete } from '@mui/icons-material';

export default function Results() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

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

  const handleOpenDialog = (quiz) => {
    setSelectedQuiz(quiz);
    setOpenDialog(true);
  };

  const handleClearResults = async () => {
    if (!selectedQuiz || !dateRange.start || !dateRange.end) return;

    try {
      // Нормализуем даты (начало дня для start, конец дня для end)
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      // Создаем пакет для массового удаления
      const batch = writeBatch(db);
      
      // Получаем результаты для удаления
      const resultsQuery = query(
        collection(db, 'results'),
        where('quizId', '==', selectedQuiz.id),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );

      const snapshot = await getDocs(resultsQuery);
      
      // Добавляем каждый документ в пакет для удаления
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Выполняем пакет
      await batch.commit();

      alert(`Удалено ${snapshot.size} результатов`);
      setOpenDialog(false);
      setDateRange({ start: null, end: null });
    } catch (error) {
      console.error('Ошибка при удалении результатов:', error);
      alert('Произошла ошибка при удалении результатов');
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
                <Button
                  onClick={() => handleOpenDialog(quiz)}
                  startIcon={<Delete />}
                  color="error"
                >
                  Очистить результаты
                </Button>
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
                    <span>{quiz.questions?.length || 0} вопросов</span>
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

      {/* Диалог очистки результатов */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Очистить результаты теста: {selectedQuiz?.title}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: 400 }}>
            <DatePicker
              label="Дата начала"
              value={dateRange.start}
              onChange={(date) => setDateRange({...dateRange, start: date})}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="Дата окончания"
              value={dateRange.end}
              onChange={(date) => setDateRange({...dateRange, end: date})}
              renderInput={(params) => <TextField {...params} />}
              minDate={dateRange.start}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleClearResults}
            disabled={!dateRange.start || !dateRange.end}
            color="error"
            variant="contained"
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}