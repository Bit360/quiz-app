import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Button, AppBar, Toolbar, Typography } from '@mui/material';

export default function NavBar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Государственное учреждение образования "Средняя школа №11 г.Витебска имени М.М.Бахтина"
        </Typography>
        {isAuthenticated && (
          <>
            <Button color="inherit" component={Link} to="/">
              Главная
            </Button>
            <Button color="inherit" component={Link} to="/quizlistuser">
              Список тестов для прохождения
            </Button>
            <Button color="inherit" component={Link} to="/results">
              Результаты
            </Button>
            <Button color="inherit" component={Link} to="/change-password">
              Сменить пароль
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}