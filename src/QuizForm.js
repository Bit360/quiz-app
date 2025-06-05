import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { Link } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Radio, 
  Checkbox, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  FormControlLabel,
  Typography
} from '@mui/material';

export default function QuizForm() {
  const [title, setTitle] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isControl, setIsControl] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([{
    text: '',
    type: 'single',
    options: ['', ''],
    correctOptions: [0],
    correctText: ''
  }]);
  const navigate = useNavigate();

  // ... (функции addQuestion, removeQuestion, updateQuestionText и т.д.)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'quizzes'), { 
        title, 
        questions,
        isAnonymous,
        isControl,
        passingScore: isControl ? passingScore : null,
        createdAt: new Date() 
      });
      alert('Тест успешно создан!');
      navigate('/');
    } catch (error) {
      console.error('Ошибка при создании теста:', error);
      alert('Произошла ошибка при создании теста');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Создание теста</Typography>
      
      <TextField
  fullWidth
  label="Название теста"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  margin="normal"
  required
  inputProps={{ 
    style: { 
      fontSize: '1.5rem', 
      fontWeight: 'bold' 
    } 
  }}
  sx={{ 
    mb: 3,
    '& .MuiInputLabel-root': {
      fontSize: '1.2rem'
    }
  }}
/>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          component={Link} 
          to="/" 
          variant="outlined"
        >
          На главную
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
        >
          Сохранить тест
        </Button>
      </Box>
    </Box>
  );
}