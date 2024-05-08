import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { url } from '../const';
import { useNavigate, useParams } from 'react-router-dom';
import './editTask.scss';

export const EditTask = () => {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [limit, setLimit] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleLimitChange = (e) => {
    const localDate = new Date(e.target.value);
    const isoDate = localDate.toISOString();
    setLimit(isoDate);
  };
  const handleIsDoneChange = (e) => {
    console.log('Checked value:', e.target.checked);
    setIsDone(e.target.checked);
  };
  const onUpdateTask = async () => {
    console.log('Final is Done value before sending:', isDone);

    const data = {
      title: title,
      detail: detail,
      limit: limit,
      done: isDone,
    };
    console.log('Sending data:', data);
    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log('Update response:', res.data);
        navigate('/', { state: { limit: limit } });
      })
      .catch((err) => {
        console.log(err.data);
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        console.log('Task data on load:', task);
        setTitle(task.title);
        setDetail(task.detail);
        setLimit(task.limit);
        setIsDone(task.done);
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, [taskId, listId, cookies.token]);

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <label>期限日時</label>
          <input
            type="datetime-local"
            onChange={handleLimitChange}
            value={limit ? new Date(limit).toISOString().slice(0, -1) : ''}
          />
          <div>
            <input
              type="checkbox"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={!isDone}
            />
            未完了
            <input
              type="checkbox"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
};
