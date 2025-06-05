import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
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
  Button
} from "@mui/material";
import { Link } from "react-router-dom";

export default function TestResults() {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Получаем информацию о тесте
      const quizDoc = await getDoc(doc(db, "quizzes", id));
      if (quizDoc.exists()) {
        setQuiz(quizDoc.data());
      }

      // Получаем результаты для этого теста
      const q = query(
        collection(db, "results"), 
        where("quizId", "==", id),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      setResults(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, [id]);

  if (!quiz) return <Typography>Загрузка...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Результаты теста: {quiz.title}
        </Typography>
        <Button 
          component={Link} 
          to="/results" 
          variant="outlined"
        >
          Назад к списку тестов
        </Button>
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
              <TableCell>Участник</TableCell>
              <TableCell align="center">Результат</TableCell>
              {quiz.isControl && <TableCell align="center">Статус</TableCell>}
              <TableCell align="right">Дата прохождения</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {results.length === 0 && (
        <Typography sx={{ mt: 3 }}>Пока нет результатов для этого теста</Typography>
      )}
    </Box>
  );
}