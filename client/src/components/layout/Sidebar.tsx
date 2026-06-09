import { CalendarCheck, CalendarDays, ClipboardList, GraduationCap, LogOut, Settings, UserRound } from 'lucide-react';
import type { AppRoute } from '../../hooks/useHashRoute';
import type { User } from '../../types';

export function Sidebar({
  user,
  activePage,
  onNavigate,
  onLogout,
}: {
  user: User;
  activePage: AppRoute;
  onNavigate: (page: AppRoute) => void;
  onLogout: () => void;
}) {
  const isTeacher = user.role === 'teacher';

  return (
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
        <button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => onNavigate('dashboard')}>
          <CalendarDays size={18} />
          Главная
        </button>
        <button className={activePage === 'journal' ? 'active' : ''} onClick={() => onNavigate('journal')}>
          <ClipboardList size={18} />
          Журнал
        </button>
        {isTeacher && (
          <button className={activePage === 'schedule' ? 'active' : ''} onClick={() => onNavigate('schedule')}>
            <CalendarCheck size={18} />
            Расписание
          </button>
        )}
        <button className={activePage === 'settings' ? 'active' : ''} onClick={() => onNavigate('settings')}>
          <Settings size={18} />
          Настройки
        </button>
      </nav>

      <button className="logout" onClick={onLogout}>
        <LogOut size={18} />
        Выход
      </button>
    </aside>
  );
}
