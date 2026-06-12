import { CalendarCheck, CalendarDays, ClipboardList, GraduationCap, LogOut, Menu, Settings, UserRound, X } from 'lucide-react';
import { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTeacher = user.role === 'teacher';

  function handleNavigate(page: AppRoute) {
    onNavigate(page);
    setMobileOpen(false);
  }

  return (
    <>
      <button className="hamburger" onClick={() => setMobileOpen((v) => !v)} aria-label="Меню">
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside className={`sidebar ${!mobileOpen ? 'sidebar--closed' : ''}`}>
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
          <button className={activePage === 'dashboard' ? 'active' : ''} onClick={() => handleNavigate('dashboard')}>
            <CalendarDays size={18} />
            Главная
          </button>
          <button className={activePage === 'journal' ? 'active' : ''} onClick={() => handleNavigate('journal')}>
            <ClipboardList size={18} />
            Журнал
          </button>
          {isTeacher && (
            <button className={activePage === 'schedule' ? 'active' : ''} onClick={() => handleNavigate('schedule')}>
              <CalendarCheck size={18} />
              Расписание
            </button>
          )}
          <button className={activePage === 'settings' ? 'active' : ''} onClick={() => handleNavigate('settings')}>
            <Settings size={18} />
            Настройки
          </button>
        </nav>

        <button className="logout" onClick={onLogout}>
          <LogOut size={18} />
          Выход
        </button>
      </aside>
    </>
  );
}
