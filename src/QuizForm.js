import { useState, useEffect } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  Radio,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

export default function QuizForm({ editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    questions: [{
      text: '',
      type: 'single',
      options: ['', ''],
      correctOptions: [0],
      correctText: ''
    }],
    settings: {
      randomizeQuestions: false,
      questionsToShow: null,
      shuffleAnswers: true
    },
    isAnonymous: false,
    isControl: false,
    passingScore: 70
  });
  const [loading, setLoading] = useState(editMode);

  // Загрузка теста для редактирования
  useEffect(() => {
    if (editMode) {
      const fetchQuiz = async () => {
        const docRef = doc(db, 'quizzes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuizData(docSnap.data());
        }
        setLoading(false);
      };
      fetchQuiz();
    }
  }, [editMode, id]);

  const handleSettingsChange = (key, value) => {
    setQuizData({
      ...quizData,
      settings: {
        ...quizData.settings,
        [key]: value
      }
    });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          text: '',
          type: 'single',
          options: ['', ''],
          correctOptions: [0],
          correctText: ''
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = [...quizData.questions];
    newQuestions.splice(index, 1);
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index][field] = value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const addOption = (qIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options.push('');
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const removeOption = (qIndex, optIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options.splice(optIndex, 1);
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await setDoc(doc(db, 'quizzes', id), {
          ...quizData,
          updatedAt: new Date()
        });
      } else {
        await setDoc(doc(collection(db, 'quizzes')), {
          ...quizData,
          createdAt: new Date()
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {editMode ? 'Редактирование теста' : 'Создание теста'}
      </Typography>

      <TextField
        fullWidth
        label="Название теста"
        value={quizData.title}
        onChange={(e) => setQuizData({...quizData, title: e.target.value})}
        margin="normal"
        required
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={quizData.isAnonymous}
              onChange={(e) => setQuizData({
                ...quizData,
                isAnonymous: e.target.checked
              })}
            />
          }
          label="Анонимный тест (не запрашивать ФИО)"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={quizData.isControl}
              onChange={(e) => setQuizData({
                ...quizData,
                isControl: e.target.checked
              })}
            />
          }
          label="Контрольный тест"
          sx={{ ml: 2 }}
        />

        {quizData.isControl && (
          <TextField
            label="Проходной балл (%)"
            type="number"
            value={quizData.passingScore}
            onChange={(e) => setQuizData({
              ...quizData,
              passingScore: parseInt(e.target.value)
            })}
            sx={{ ml: 2, width: 120 }}
            inputProps={{ min: 1, max: 100 }}
          />
        )}
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Настройки прохождения теста
      </Typography>

      <Box sx={{ mb: 3, pl: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={quizData.settings.randomizeQuestions}
              onChange={(e) => 
                handleSettingsChange('randomizeQuestions', e.target.checked)
              }
            />
          }
          label="Случайный порядок вопросов"
          sx={{ display: 'block', mb: 1 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={quizData.settings.shuffleAnswers}
              onChange={(e) => 
                handleSettingsChange('shuffleAnswers', e.target.checked)
              }
            />
          }
          label="Перемешивать варианты ответов"
          sx={{ display: 'block', mb: 1 }}
        />

        <TextField
          label="Количество вопросов (оставьте пустым для всех)"
          type="number"
          value={quizData.settings.questionsToShow || ''}
          onChange={(e) => 
            handleSettingsChange(
              'questionsToShow', 
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          sx={{ width: 300 }}
          InputProps={{ inputProps: { min: 1 } }}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Вопросы теста
      </Typography>

      {quizData.questions.map((question, qIndex) => (
        <Box key={qIndex} sx={{ 
          border: 1, 
          borderColor: 'grey.300', 
          borderRadius: 1, 
          p: 2, 
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <FormControl fullWidth sx={{ mr: 2 }}>
              <InputLabel>Тип вопроса</InputLabel>
              <Select
                value={question.type}
                onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                label="Тип вопроса"
              >
                <MenuItem value="single">Один правильный ответ</MenuItem>
                <MenuItem value="multiple">Несколько правильных ответов</MenuItem>
                <MenuItem value="text">Текстовый ответ</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              onClick={() => removeQuestion(qIndex)}
              color="error"
              disabled={quizData.questions.length <= 1}
            >
              Удалить вопрос
            </Button>
          </Box>
          
          <TextField
            fullWidth
            label="Текст вопроса"
            value={question.text}
            onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
            margin="normal"
            required
          />
          
          {question.type !== 'text' && (
            <Box sx={{ mt: 2 }}>
              {question.options.map((opt, optIndex) => (
                <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {question.type === 'single' ? (
                    <Radio
                      checked={question.correctOptions.includes(optIndex)}
                      onChange={() => updateQuestion(qIndex, 'correctOptions', [optIndex])}
                    />
                  ) : (
                    <Checkbox
                      checked={question.correctOptions.includes(optIndex)}
                      onChange={() => {
                        const current = question.correctOptions;
                        const newOptions = current.includes(optIndex)
                          ? current.filter(i => i !== optIndex)
                          : [...current, optIndex];
                        updateQuestion(qIndex, 'correctOptions', newOptions);
                      }}
                    />
                  )}
                  
                  <TextField
                    fullWidth
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...question.options];
                      newOptions[optIndex] = e.target.value;
                      updateQuestion(qIndex, 'options', newOptions);
                    }}
                    size="small"
                    required
                  />
                  
                  <IconButton 
                    onClick={() => removeOption(qIndex, optIndex)}
                    disabled={question.options.length <= 2}
                    sx={{ ml: 1 }}
                  >
                    <Remove />
                  </IconButton>
                </Box>
              ))}
              
              <Button 
                onClick={() => addOption(qIndex)}
                startIcon={<Add />}
                size="small"
                sx={{ mt: 1 }}
              >
                Добавить вариант
              </Button>
            </Box>
          )}
          
          {question.type === 'text' && (
            <TextField
              fullWidth
              label="Правильный ответ"
              value={question.correctText}
              onChange={(e) => updateQuestion(qIndex, 'correctText', e.target.value)}
              margin="normal"
              required
            />
          )}
        </Box>
      ))}
      
      <Button 
        onClick={addQuestion}
        startIcon={<Add />}
        variant="outlined"
        sx={{ mr: 2 }}
      >
        Добавить вопрос
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
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
          {editMode ? 'Обновить тест' : 'Создать тест'}
        </Button>
      </Box>
    </Box>
  );
}