import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import NavBar from './NavBar';
import Login from './Login';
import QuizList from './QuizList';
import QuizListUser from './QuizListUser';
import QuizForm from './QuizForm';
import Quiz from './Quiz';
import Results from './Results';
import TestResults from './TestResults';
import ChangePassword from './ChangePassword';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          } />
          <Route path="/edit/:id" element={
  <ProtectedRoute>
    <QuizForm editMode={true} />
  </ProtectedRoute>
} />
          <Route path="/create" element={
            <ProtectedRoute>
              <QuizForm />
            </ProtectedRoute>
          } />
          <Route path="/quiz/:id" element={
            
              <Quiz />
            
          } />
           <Route path="/quizlistuser" element={
            
              <QuizListUser />
            
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } />
          <Route path="/results/:id" element={
            <ProtectedRoute>
              <TestResults />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}