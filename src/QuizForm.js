import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { Button, TextField, Radio, Checkbox, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

export default function QuizForm() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{
    text: "",
    type: "single",
    options: ["", ""],
    correctOptions: [0],
    correctText: ""
  }]);

  // Объявляем все функции в начале
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
        createdAt: new Date() 
      });
      alert("Тест успешно создан!");
      setTitle("");
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
      <TextField
        fullWidth
        label="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
      />
      
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
        >
          Сохранить тест
        </Button>
      </Box>
    </Box>
  );
}