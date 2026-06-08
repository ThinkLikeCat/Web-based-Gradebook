import { CalendarCheck, CalendarDays, ClipboardList, GraduationCap, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { loginStudent, loginTeacher } from './api/auth';
import { groups } from './data/mockData';
import { Dashboard } from './pages/student/dashboard';
import { Journal } from './pages/student/journal';
import { TeacherDashboard } from './pages/teacher/dashboard';
import { TeacherJournal } from './pages/teacher/journal';
import { TeacherSchedule } from './pages/teacher/schedule';
import type { PlannedWork, Role, TeacherChoice, User } from './types';

type Page = 'dashboard' | 'journal' | 'schedule';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [teacherChoice, setTeacherChoice] = useState<TeacherChoice>({ group: 'Т-291', subject: 'Веб-программирование' });
  const [plannedWorks, setPlannedWorks] = useState<PlannedWork[]>([
    {
      id: 'plan-1',
      group: 'Т-291',
      subject: 'Веб-программирование',
      type: 'lab',
      title: 'Лабораторная работа №4',
      date: '2026-06-05',
      deadline: '2026-06-12',
      comment: 'React Router и подключение API',
    },
    {
      id: 'plan-2',
      group: 'Т-291',
      subject: 'Веб-программирование',
      type: 'required-test',
      title: 'Обязательная контрольная работа',
      date: '2026-06-18',
      comment: 'Компоненты, состояние и работа с формами',
    },
  ]);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const isTeacher = user.role === 'teacher';

  return (
    <div className={`shell ${activePage === 'journal' ? 'shell--journal' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <GraduationCap size={30} />
          <span>Электронный журнал</span>
        </div>

        <div className="profile">
          <div className="avatar">
            <UserRound size={24} />
          </div>
          <div>
            <strong>{user.fullName}</strong>
            <small>{isTeacher ? 'Преподаватель' : user.group}</small>
          </div>
        </div>

        <nav className="nav">
          <button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
            <CalendarDays size={18} />
            Главная
          </button>
          <button className={activePage === 'journal' ? 'active' : ''} onClick={() => setActivePage('journal')}>
            <ClipboardList size={18} />
            Журнал
          </button>
          {isTeacher && (
            <button className={activePage === 'schedule' ? 'active' : ''} onClick={() => setActivePage('schedule')}>
              <CalendarCheck size={18} />
              Расписание
            </button>
          )}
        </nav>

        <button
          className="logout"
          onClick={() => {
            setUser(null);
            setActivePage('dashboard');
          }}
        >
          <LogOut size={18} />
          Выход
        </button>
      </aside>

      <main className="workspace">
        {activePage === 'dashboard' && !isTeacher && <Dashboard user={user} plannedWorks={plannedWorks} />}
        {activePage === 'journal' && !isTeacher && <Journal role="student" />}
        {activePage === 'dashboard' && isTeacher && (
          <TeacherDashboard user={user} choice={teacherChoice} onChoiceChange={setTeacherChoice} />
        )}
        {activePage === 'journal' && isTeacher && <TeacherJournal choice={teacherChoice} onChoiceChange={setTeacherChoice} />}
        {activePage === 'schedule' && isTeacher && (
          <TeacherSchedule
            choice={teacherChoice}
            items={plannedWorks.filter((work) => work.group === teacherChoice.group)}
            onAddWork={(work) => setPlannedWorks((current) => [work, ...current])}
          />
        )}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [role, setRole] = useState<Role>('student');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [group, setGroup] = useState('Т-394');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const nextUser =
        role === 'student'
          ? await loginStudent({ lastName, birthDate, group })
          : await loginTeacher({ lastName, password });

      onLogin(nextUser);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Не удалось войти');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-main">
          <div className="login-title">
            <GraduationCap size={34} />
            <div>
              <h1>Электронный журнал</h1>
              <p>{role === 'student' ? 'Вход для студента' : 'Вход для преподавателя'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Фамилия
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Например: Иванов" />
            </label>

            {role === 'student' ? (
              <>
                <label>
                  Дата рождения
                  <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
                </label>
                <label>
                  Группа
                  <select value={group} onChange={(event) => setGroup(event.target.value)}>
                    {groups.map((groupName) => (
                      <option key={groupName}>{groupName}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <label>
                Пароль
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Пароль для входа"
                />
              </label>
            )}

            {error && <p className="form-error">{error}</p>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Проверяем...' : 'Войти'}
            </button>
          </form>
        </div>

        <aside className="login-switch">
          <span>{role === 'student' ? 'Вы преподаватель?' : 'Вход ученика'}</span>
          <p>
            {role === 'student'
              ? 'Откройте журнал группы и предмета, чтобы выставлять оценки и пропуски.'
              : 'Вернитесь к входу по фамилии, дате рождения и группе.'}
          </p>
          <button type="button" onClick={() => setRole(role === 'student' ? 'teacher' : 'student')}>
            {role === 'student' ? 'Войти как преподаватель' : 'Войти как студент'}
          </button>
        </aside>
      </section>
    </div>
  );
}
