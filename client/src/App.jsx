import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/result" element={<Result />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}