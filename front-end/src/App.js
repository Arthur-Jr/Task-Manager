import { Route, Routes } from 'react-router-dom';
import './CSS/App.css';
import LoginRegister from './pages/LoginRegister.jsx';
import Tasks from './pages/Tasks.jsx';

function App() {
  return (
    <Routes>
      <Route path='/' element={ <LoginRegister/> } />
      <Route path='/tasks' element= { <Tasks/> }/>
    </Routes>
  );
}

export default App;
