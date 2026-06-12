import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loginStudent, loginTeacher, logoutUser } from './api/auth';
import { getTokens } from './api/client';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/Toast';
import { groups } from './data/mockData';
import { useHashRoute } from './hooks/useHashRoute';
import { Dashboard } from './pages/student/dashboard';
import { Journal } from './pages/student/journal';
import { SettingsPage } from './pages/settings/SettingsPage';
import { TeacherDashboard } from './pages/teacher/dashboard';
import { TeacherJournal } from './pages/teacher/journal';
import { TeacherSchedule } from './pages/teacher/schedule';
import type { PlannedWork, Role, TeacherChoice, ThemeColor, User } from './types';

type WorkNotification = {
  work: PlannedWork;
  createdAt: number;
};

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('gradebook_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [activePage, setActivePage] = useHashRoute();
  const [theme, setTheme] = useState<ThemeColor>('blue');
  const [teacherChoice, setTeacherChoice] = useState<TeacherChoice>({ group: 'Т-394', subject: 'Веб-программирование' });
  const [notifications, setNotifications] = useState<WorkNotification[]>([]);
  const [plannedWorks, setPlannedWorks] = useState<PlannedWork[]>([
    {
      id: 'plan-1',
      group: 'Т-291',
      subject: 'Веб-программирование',
      type: 'lab',
      title: 'Лабораторная работа №4',
      date: '2026-06-05',
      deadline: '2026-06-12',
      room: '214',
      comment: 'React Router и подключение API',
    },
    {
      id: 'plan-2',
      group: 'Т-291',
      subject: 'Веб-программирование',
      type: 'required-test',
      title: 'Обязательная контрольная работа',
      date: '2026-06-18',
      room: '214',
      comment: 'Компоненты, состояние и работа с формами',
    },
  ]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setNotifications((current) => current.filter((notification) => now - notification.createdAt < 120_000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const isTeacher = user.role === 'teacher';

  return (
    <div className={`shell ${activePage === 'journal' ? 'shell--journal' : ''}`} data-theme={theme}>
      <Sidebar
        user={user}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={() => {
          logoutUser();
          sessionStorage.removeItem('gradebook_user');
          setUser(null);
          setActivePage('dashboard');
        }}
      />

      <main className="workspace">
        {activePage === 'dashboard' && !isTeacher && (
          <Dashboard user={user} plannedWorks={plannedWorks} notifications={notifications.map((notification) => notification.work)} />
        )}
        {activePage === 'journal' && !isTeacher && <Journal role="student" cornerTop="Даты занятий" cornerBottom="Предметы" />}
        {activePage === 'dashboard' && isTeacher && (
          <TeacherDashboard user={user} choice={teacherChoice} onChoiceChange={setTeacherChoice} />
        )}
        {activePage === 'journal' && isTeacher && <TeacherJournal choice={teacherChoice} onChoiceChange={setTeacherChoice} />}
        {activePage === 'schedule' && isTeacher && (
          <TeacherSchedule
            choice={teacherChoice}
            items={plannedWorks.filter((work) => work.group === teacherChoice.group)}
            onAddWork={(work) => {
              setPlannedWorks((current) => [work, ...current]);
              setNotifications((current) => [{ work, createdAt: Date.now() }, ...current].slice(0, 5));
            }}
          />
        )}
        {activePage === 'settings' && <SettingsPage theme={theme} onThemeChange={setTheme} />}
      </main>

      <ToastContainer notifications={notifications.map(n => n.work)} />
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [role, setRole] = useState<Role>('student');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [group, setGroup] = useState('Т-394');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const nextUser =
        role === 'student'
          ? await loginStudent({ lastName, firstName, birthDate, group, password })
          : await loginTeacher({ lastName, firstName, password });

      sessionStorage.setItem('gradebook_user', JSON.stringify(nextUser));
      window.location.hash = '/dashboard';
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
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Например: Иванов" autoFocus />
            </label>

            <label>
              Имя
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Например: Иван" />
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
            ) : null}

            <label>
              Пароль
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Пароль для входа"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Проверяем...</> : 'Войти'}
            </button>
          </form>
        </div>

        <aside className="login-switch">
          <span>{role === 'student' ? 'Вы преподаватель?' : 'Вход ученика'}</span>
          <p>
            {role === 'student'
              ? 'Откройте журнал группы и предмета, чтобы выставлять оценки и пропуски.'
              : 'Вернитесь к входу по фамилии, имени и паролю.'}
          </p>
          <button type="button" onClick={() => { setRole(role === 'student' ? 'teacher' : 'student'); setError(''); }}>
            {role === 'student' ? 'Войти как преподаватель' : 'Войти как студент'}
          </button>
        </aside>
      </section>
    </div>
  );
}
