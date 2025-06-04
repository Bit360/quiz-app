import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
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
  Chip
} from "@mui/material";

export default function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      const q = query(collection(db, "results"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      setResults(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchResults();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Результаты тестов</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тест</TableCell>
              <TableCell>Участник</TableCell>
              <TableCell>Результат</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.quizTitle}</TableCell>
                <TableCell>{result.userName}</TableCell>
                <TableCell>
                  {result.score} из {result.total} ({result.percentage}%)
                </TableCell>
                <TableCell>
                  {result.isControl ? (
                    <Chip 
                      label={result.isPassed ? 'Сдал' : 'Не сдал'} 
                      color={result.isPassed ? 'success' : 'error'}
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {result.timestamp?.toDate ? 
                    result.timestamp.toDate().toLocaleString() : 
                    new Date(result.timestamp?.seconds * 1000).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}