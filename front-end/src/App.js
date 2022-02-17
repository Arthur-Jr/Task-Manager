import { Route, Routes } from 'react-router-dom';
import './CSS/App.css';
import LoginRegister from './pages/LoginRegister.jsx';

function App() {
  return (
    <Routes>
      <Route path='/' element={ <LoginRegister/> } />
    </Routes>
  );
}

export default App;
