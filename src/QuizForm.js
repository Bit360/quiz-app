import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
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
} from "@mui/material";

export default function QuizForm() {
  const [title, setTitle] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isControl, setIsControl] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([{
    text: "",
    type: "single",
    options: ["", ""],
    correctOptions: [0],
    correctText: ""
  }]);

  const addQuestion = () => {
    setQuestions([...questions, {
      text: "",
      type: "single",
      options: ["", ""],
      correctOptions: [0],
      correctText: ""
    }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestionText = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].text = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push("");
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(optIndex, 1);
    
    newQuestions[qIndex].correctOptions = newQuestions[qIndex].correctOptions
      .filter(i => i !== optIndex)
      .map(i => i > optIndex ? i - 1 : i);
    
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (qIndex, type) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].type = type;
    
    if (type === "text") {
      newQuestions[qIndex].correctText = "";
    } else {
      newQuestions[qIndex].correctOptions = type === "single" ? [0] : [];
    }
    
    setQuestions(newQuestions);
  };

  const setCorrectOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOptions = [optIndex];
    setQuestions(newQuestions);
  };

  const toggleCorrectOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    const correctOptions = newQuestions[qIndex].correctOptions;
    
    if (correctOptions.includes(optIndex)) {
      newQuestions[qIndex].correctOptions = correctOptions.filter(i => i !== optIndex);
    } else {
      newQuestions[qIndex].correctOptions = [...correctOptions, optIndex];
    }
    
    setQuestions(newQuestions);
  };

  const updateCorrectText = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctText = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "quizzes"), { 
        title, 
        questions,
        isAnonymous,
        isControl,
        passingScore: isControl ? passingScore : null,
        createdAt: new Date() 
      });
      alert("Тест успешно создан!");
      setTitle("");
      setIsAnonymous(false);
      setIsControl(false);
      setPassingScore(70);
      setQuestions([{
        text: "",
        type: "single",
        options: ["", ""],
        correctOptions: [0],
        correctText: ""
      }]);
    } catch (error) {
      console.error("Ошибка при создании теста:", error);
      alert("Произошла ошибка при создании теста");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Создание нового теста</Typography>
      
      <TextField
        fullWidth
        label="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
      />
      
      <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Настройки теста</Typography>
        
        <FormControlLabel
          control={<Checkbox checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />}
          label="Анонимный тест (не запрашивать ФИО)"
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <FormControlLabel
            control={<Checkbox checked={isControl} onChange={(e) => setIsControl(e.target.checked)} />}
            label="Контрольный тест"
          />
          
          {isControl && (
            <TextField
              label="Минимальный % для сдачи"
              type="number"
              value={passingScore}
              onChange={(e) => {
                let value = parseInt(e.target.value);
                if (value < 1) value = 1;
                if (value > 100) value = 100;
                setPassingScore(value);
              }}
              sx={{ width: 120, ml: 2 }}
              inputProps={{ min: 1, max: 100 }}
            />
          )}
        </Box>
      </Box>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Вопросы теста</Typography>
      
      {questions.map((q, qIndex) => (
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
                value={q.type}
                onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
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
              disabled={questions.length <= 1}
            >
              Удалить вопрос
            </Button>
          </Box>
          
          <TextField
            fullWidth
            label="Текст вопроса"
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            margin="normal"
            required
          />
          
          {q.type !== "text" && (
            <Box sx={{ mt: 2 }}>
              {q.options.map((opt, optIndex) => (
                <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {q.type === "single" ? (
                    <Radio
                      checked={q.correctOptions.includes(optIndex)}
                      onChange={() => setCorrectOption(qIndex, optIndex)}
                    />
                  ) : (
                    <Checkbox
                      checked={q.correctOptions.includes(optIndex)}
                      onChange={() => toggleCorrectOption(qIndex, optIndex)}
                    />
                  )}
                  
                  <TextField
                    fullWidth
                    value={opt}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    size="small"
                    required
                  />
                  
                  <Button 
                    onClick={() => removeOption(qIndex, optIndex)}
                    disabled={q.options.length <= 2}
                    sx={{ ml: 1 }}
                  >
                    ×
                  </Button>
                </Box>
              ))}
              
              <Button 
                onClick={() => addOption(qIndex)}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                + Добавить вариант
              </Button>
            </Box>
          )}
          
          {q.type === "text" && (
            <TextField
              fullWidth
              label="Правильный ответ"
              value={q.correctText}
              onChange={(e) => updateCorrectText(qIndex, e.target.value)}
              margin="normal"
              required
            />
          )}
        </Box>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button 
          onClick={addQuestion}
          variant="contained"
        >
          + Добавить вопрос
        </Button>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!title || questions.some(q => !q.text || 
            (q.type !== "text" && q.options.some(opt => !opt.trim())) || 
            (q.type === "text" && !q.correctText.trim())}
        >
          Сохранить тест
        </Button>
      </Box>
    </Box>
  );
}