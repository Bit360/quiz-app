import { useState, useContext } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function ChangePassword() {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { correctPassword, updatePassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentPass !== correctPassword) {
      setError('Текущий пароль неверен');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Пароли не совпадают');
      return;
    }
    
    await updatePassword(newPass);
    setSuccess(true);
    setError('');
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, p: 3 }}>
      <Typography variant="h5" gutterBottom>Смена пароля</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type="password"
          label="Текущий пароль"
          value={currentPass}
          onChange={(e) => setCurrentPass(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="password"
          label="Новый пароль"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="password"
          label="Подтвердите пароль"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {success && <Typography color="success" sx={{ mb: 2 }}>Пароль успешно изменен!</Typography>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            component={Link} 
            to="/" 
            variant="outlined"
          >
            На главную
          </Button>
          <Button type="submit" variant="contained">
            Сохранить
          </Button>
        </Box>
      </form>
    </Box>
  );
}