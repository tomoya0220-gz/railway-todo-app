import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import './home.scss';
// import { useLocation } from 'react-router-dom';

export const Home = ({
  tasks = [],
  selectListId = '',
  isDoneDisplay = 'todo',
}) => {
  const [isDoneDisplayState, setIsDoneDisplay] = useState(isDoneDisplay); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListIdState, setSelectListId] = useState(selectListId);
  const [tasksState, setTasks] = useState(tasks);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, [cookies.token]);

  useEffect(() => {
    if (selectListId) {
      axios
        .get(`${url}/lists/${selectListId}/tasks`, {
          headers: {
            Aithorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          console.log('Tasks data:', res.data);
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。 ${err}`);
        });
    }
  }, [selectListId, cookies.token]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    console.log('Authorization Token:', cookies.token);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        console.log('Authorization Token:', cookies.token);
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListIdState}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab">
            {lists.map((list, key) => {
              const isActive = list.id === selectListIdState;
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasksState}
              selectListId={selectListIdState}
              isDoneDisplay={isDoneDisplayState}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
const Tasks = ({ tasks, selectListId, isDoneDisplay }) => {
  // if (!tasks) return null;
  // const location = useLocation();
  // const limitFromState = location.state?.limit;

  function getRemainingTime(limit) {
    const now = new Date();
    const limitDate = new Date(limit);
    const timeDiff = limitDate - now;

    if (timeDiff > 0) {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
      return `${days}日 ${hours}時間 ${minutes}分`;
    } else {
      return `時間切れ`;
    }
  }

  return (
    <ul>
      {(tasks || [])
        .filter((task) => task.done === (isDoneDisplay === 'done'))
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.limit && (
                <div>
                  期限: {new Date(task.limit).toLocaleString()}
                  <br />
                  残り: {getRemainingTime(task.limit)}
                </div>
              )}
              <br />
            </Link>
          </li>
        ))}
    </ul>
  );
};
