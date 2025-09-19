import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Home from './components/pages/Home';
import CreateProject from './components/pages/Dashboard/createProject';

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/" replace />}/>
        <Route path="/create-project" element={token ? <CreateProject /> : <Navigate to="/" replace />}/>
      </Routes>
    </Router>
  );
};

export default App;




