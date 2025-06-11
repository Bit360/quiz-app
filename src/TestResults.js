import { useState, useEffect } from 'react';
import { useParams } from "react-router";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Close, Download } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import * as XLSX from 'xlsx';

export default function TestResults() {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  useEffect(() => {
    const fetchData = async () => {
      const quizDoc = await getDoc(doc(db, 'quizzes', id));
      if (quizDoc.exists()) {
        setQuiz(quizDoc.data());
      }

      const q = query(
        collection(db, 'results'), 
        where('quizId', '==', id),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const resultsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setResults(resultsData);
      setFilteredResults(resultsData);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleDeleteResult = async (resultId) => {
    if (window.confirm('Удалить этот результат?')) {
      await deleteDoc(doc(db, 'results', resultId));
      setResults(results.filter(r => r.id !== resultId));
      setFilteredResults(filteredResults.filter(r => r.id !== resultId));
    }
  };

  const handleExport = () => {
    setExportOpen(true);
  };

  const applyDateFilter = () => {
    if (!dateRange.start || !dateRange.end) {
      setFilteredResults(results);
      return;
    }

    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const filtered = results.filter(result => {
      const resultDate = result.timestamp?.toDate 
        ? result.timestamp.toDate() 
        : new Date(result.timestamp?.seconds * 1000);
      return resultDate >= startDate && resultDate <= endDate;
    });

    setFilteredResults(filtered);
    setExportOpen(false);
  };

  const exportToExcel = () => {
    const data = filteredResults.map((result, index) => ({
      '№': index + 1,
      'Фамилия': result.userName,
      'Результат': `${result.score} из ${result.total}`,
      'Процент': `${result.percentage}%`,
      'Статус': quiz.isControl 
        ? (result.isPassed ? 'Сдал' : 'Не сдал') 
        : 'Не контрольный'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Результаты");
    XLSX.writeFile(workbook, `Результаты_${quiz.title}.xlsx`);
  };

  if (!quiz) return <Typography>Загрузка...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Результаты теста: {quiz.title}
        </Typography>
        <Box>
          <Button 
            onClick={handleExport}
            startIcon={<Download />}
            variant="contained"
            sx={{ mr: 2 }}
          >
            Выгрузить
          </Button>
          <Button 
            component={Link} 
            to="/results" 
            variant="outlined"
          >
            Назад
          </Button>
        </Box>
      </Box>

      {quiz.isControl && (
        <Typography sx={{ mb: 2 }}>
          Проходной балл: {quiz.passingScore}%
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Участник</TableCell>
              <TableCell align="center">Результат</TableCell>
              {quiz.isControl && <TableCell align="center">Статус</TableCell>}
              <TableCell align="right">Дата</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResults.map((result, index) => (
              <TableRow key={result.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{result.userName}</TableCell>
                <TableCell align="center">
                  {result.score} из {result.total} ({result.percentage}%)
                </TableCell>
                {quiz.isControl && (
                  <TableCell align="center">
                    <Chip 
                      label={result.isPassed ? 'Сдал' : 'Не сдал'} 
                      color={result.isPassed ? 'success' : 'error'}
                    />
                  </TableCell>
                )}
                <TableCell align="right">
                  {result.timestamp?.toDate ? 
                    result.timestamp.toDate().toLocaleString() : 
                    new Date(result.timestamp?.seconds * 1000).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleDeleteResult(result.id)}
                    color="error"
                  >
                    <Close />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredResults.length === 0 && (
        <Typography sx={{ mt: 3 }}>Нет результатов для отображения</Typography>
      )}

      {/* Диалог экспорта */}
      <Dialog open={exportOpen} onClose={() => setExportOpen(false)}>
        <DialogTitle>Выгрузить результаты</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: 400 }}>
            <Typography>Выберите период:</Typography>
            <DatePicker
              label="Дата начала"
              value={dateRange.start}
              onChange={(date) => setDateRange({...dateRange, start: date})}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <DatePicker
              label="Дата окончания"
              value={dateRange.end}
              onChange={(date) => setDateRange({...dateRange, end: date})}
              renderInput={(params) => <TextField {...params} fullWidth />}
              minDate={dateRange.start}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportOpen(false)}>Отмена</Button>
          <Button 
            onClick={applyDateFilter}
            disabled={!dateRange.start || !dateRange.end}
            sx={{ mr: 2 }}
          >
            Применить фильтр
          </Button>
          <Button 
            onClick={exportToExcel}
            variant="contained"
            color="primary"
          >
            Экспорт в Excel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}