import { GraduationCap, Menu, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loginStudent, loginTeacher } from './api/auth';
import { Sidebar } from './components/layout/Sidebar';
import { groups } from './data/mockData';
import { useHashRoute } from './hooks/useHashRoute';
import { Dashboard } from './pages/student/dashboard';
import { Journal } from './pages/student/journal';
import { SettingsPage } from './pages/settings/SettingsPage';
import { TeacherDashboard } from './pages/teacher/dashboard';
import { TeacherJournal } from './pages/teacher/journal';
import { TeacherSchedule } from './pages/teacher/schedule';
import type { LayoutMode, PlannedWork, Role, TeacherChoice, ThemeColor, User } from './types';

type WorkNotification = {
  work: PlannedWork;
  createdAt: number;
};

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useHashRoute();
  const [theme, setTheme] = useState<ThemeColor>('blue');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('modern');
  const [teacherChoice, setTeacherChoice] = useState<TeacherChoice>({ group: 'Т-394', subject: 'Веб-программирование' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<WorkNotification[]>([]);
  const [plannedWorks, setPlannedWorks] = useState<PlannedWork[]>([
    {
      id: 'plan-1',
      group: 'Т-291',
      subject: 'Веб-программирование',
      type: 'lab',
      title: 'Лабораторная работа №4',
      workNumber: '4',
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
      title: 'Обязательная контрольная работа №1',
      workNumber: '1',
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
    <div className={`shell shell--${layoutMode} ${activePage === 'journal' ? 'shell--journal' : ''}`} data-theme={theme}>
      {layoutMode === 'modern' ? (
        <>
          <header className="app-header">
            <button className="menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Открыть меню">
              <Menu size={24} />
            </button>
            <div className="header-brand">
              <GraduationCap size={25} />
              <span>Электронный журнал</span>
            </div>
            <div className="header-profile">
              <div className="header-avatar">
                <UserRound size={18} />
              </div>
              <div>
                <strong>{user.fullName}</strong>
                <small>{isTeacher ? 'Преподаватель' : user.group}</small>
              </div>
            </div>
          </header>

<<<<<<< HEAD
          <div className={menuOpen ? 'drawer-backdrop open' : 'drawer-backdrop'} onClick={() => setMenuOpen(false)} />
          <div className={menuOpen ? 'drawer open' : 'drawer'} aria-hidden={!menuOpen}>
            <button className="drawer-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню">
              <X size={22} />
            </button>
            <Sidebar
              user={user}
              activePage={activePage}
              onNavigate={(page) => {
                setActivePage(page);
                setMenuOpen(false);
              }}
              onLogout={() => {
                setMenuOpen(false);
                setUser(null);
                setActivePage('dashboard');
              }}
            />
          </div>
        </>
      ) : (
        <Sidebar
          user={user}
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
          }}
          onLogout={() => {
            setUser(null);
            setActivePage('dashboard');
          }}
        />
      )}

      <main className="workspace" key={`${activePage}-${layoutMode}-${user.role}`}>
        {(activePage === 'dashboard' || (activePage === 'schedule' && !isTeacher)) && !isTeacher && (
=======
      <main className="workspace">
        {activePage === 'dashboard' && !isTeacher && (
>>>>>>> 65d704fa271312697203b62f21fcd17039d6216b
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
        {activePage === 'settings' && (
          <SettingsPage
            theme={theme}
            layoutMode={layoutMode}
            onThemeChange={setTheme}
            onLayoutModeChange={(mode) => {
              setLayoutMode(mode);
              setMenuOpen(false);
            }}
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
