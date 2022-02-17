import React, { useEffect, useState } from 'react';
import api from '../api/api';

function Tasks() {
  const statusOptions = ['pendente', 'em andamento', 'pronto'];
  const taskFormDefault = { title: '', description: '', status: 'pendente' };

  const [isEdit, setEdit] = useState({ status: false, taskId: '' });
  const [savedToken, saveToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [taskForm, setTaskForm] = useState(taskFormDefault);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const token = localStorage.getItem('task-manager-token');
        saveToken(token);

        const { data } = await api.get('/tasks', { headers: { authorization: token } });
        setTasks(data);
      } catch (error) {
        setErrorMessage(error.response.data.message);
      }
    };

    getTasks();
  }, []);

  const handleFormChange = ({ target: { value, name } }) => {
    setTaskForm({
      ...taskForm,
      [name]: value,
    });
  };

  const handleAddNewTask = async () => {
    try {
      const { data } = await api.post('/tasks', taskForm, { headers: { authorization: savedToken } });
      setTasks([...tasks, data]);
      setTaskForm(taskFormDefault);
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const handleDelete = async ({ target: { id } }) => {
    try {
      await api.delete(`/tasks/${id}`, { headers: { authorization: savedToken } });
      const newTasksArray = tasks.filter(({ _id }) => _id !== id);
      setTasks(newTasksArray);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const handleEditCondition = ({ target: { id } }) => {
    setEdit({ status: true, taskId: id });
    window.scrollTo(null, 1000);

    const { title, description, status } = tasks.find(({ _id }) => _id === id);
    setTaskForm({ title, description, status });
  };

  const handleEdit = async () => {
    try {
      const { data } = await api.put(`/tasks/${isEdit.taskId}`, taskForm, { headers: { authorization: savedToken } });

      const newTasks = tasks.filter(({ _id }) => _id !== isEdit.taskId);
      setTasks([...newTasks, data]);

      setEdit({ status: false, taskId: '' });
      setTaskForm(taskFormDefault);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  return (
    <main>
      <h1>Tarefas</h1>
      { tasks.map(({
        _id, insertedDate, title, status, description,
      }) => {
        const dia = insertedDate.slice(0, insertedDate.indexOf('T'));
        return (
          <div key={ _id } id={ _id } className="tasks">
            <h3>{ title }</h3>
            <h4>{ `status: ${status}` }</h4>
            <p>{ description }</p>
            <span>{ `criado em: ${dia}` }</span>
            <button id={ _id } onClick={ handleEditCondition } >Editar</button>
            <button id={ _id } onClick={ handleDelete }>Deletar</button>
          </div>
        );
      }) }
      <br />
      <br />
        <h2>{ !isEdit.status ? 'Adicionar nova tarefa' : 'Editar Tarefa' }</h2>

        <form>
          <label htmlFor="title">
            Title:
            <input
              type='text'
              name='title'
              id='title'
              value={ taskForm.title }
              onChange={ handleFormChange }
              required
            />
          </label>

          <label htmlFor='description'>
            Description:
            <input
              type='text'
              name='description'
              id='description'
              value={ taskForm.description }
              onChange={ handleFormChange }
            />
          </label>

          <label htmlFor='status'>
            <select
              name='status'
              id='status'
              value={ taskForm.status }
              onChange={ handleFormChange }
              required
            >
              { statusOptions.map((option, index) => (
                <option value={ option } key={ index }>{ option }</option>
              )) }
            </select>
          </label>

          { !isEdit.status
            ? <button type='button' onClick={ handleAddNewTask }>Adicionar Tarefa</button>
            : <button type='button' onClick={ handleEdit }>Editar Tarefa</button> }
        </form>
        <span>{ errorMessage }</span>
    </main>
  );
}

export default Tasks;
