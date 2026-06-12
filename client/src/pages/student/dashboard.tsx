import { BookOpenCheck, CalendarDays, Clock, FileText, Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardData } from '../../api/schedule';
import { ErrorState, LoadingState, SkeletonGrid } from '../../components/ui/AsyncState';
import type { Deadline, Exam, PlannedWork, ScheduleItem, User } from '../../types';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(date));
}

function daysLeft(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);

  if (days === 0) {
    return 'сегодня';
  }

  return `${days} дн.`;
}

export function Dashboard({
  user,
  plannedWorks,
  notifications,
}: {
  user: User;
  plannedWorks: PlannedWork[];
  notifications: PlannedWork[];
}) {
  const [dashboardData, setDashboardData] = useState<{
    deadlines: Deadline[];
    exams: Exam[];
    schedule: ScheduleItem[];
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardData()
      .then(setDashboardData)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить данные'));
  }, []);

  const groupWorks = plannedWorks
    .filter((work) => work.group === user.group)
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime());
  const groupNotifications = notifications.filter((work) => work.group === user.group);

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-grid">
        <section className="content-column">
          <header className="page-head">
            <div>
              <span className="eyebrow">Загрузка...</span>
              <h1>Главная</h1>
            </div>
          </header>
          <SkeletonGrid count={3} />
        </section>
        <aside className="right-column">
          <SkeletonGrid count={2} />
        </aside>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <section className="content-column">
        <header className="page-head">
          <div>
            <span className="eyebrow">{new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(new Date())}</span>
            <h1>{new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date())}</h1>
            <p>Группа {user.group}. Ближайшие занятия, дедлайны и экзамены.</p>
          </div>
        </header>

        {groupNotifications.length > 0 && (
          <section className="notification-stack">
            {groupNotifications.map((work) => (
              <article className="notification-card" key={work.id}>
                <strong>Новое</strong>
                <span>
                  {work.subject} · {work.title} · {formatDate(work.date)}
                </span>
              </article>
            ))}
          </section>
        )}

        <section className="panel">
          <div className="section-title">
            <FileText size={20} />
            <h2>Ближайшие дедлайны</h2>
          </div>

          <div className="deadline-list">
            {dashboardData.deadlines.length === 0 && (
              <div className="async-state" style={{ gridColumn: '1 / -1', minHeight: 100 }}>
                <Inbox size={24} />
                Нет активных дедлайнов
              </div>
            )}
            {dashboardData.deadlines.map((deadline) => (
              <article className={`deadline-card ${deadline.status}`} key={deadline.id}>
                <div>
                  <strong>{deadline.subject}</strong>
                  <span>{deadline.title}</span>
                </div>
                <p>{formatDate(deadline.dueDate)}</p>
                <b>{daysLeft(deadline.dueDate)}</b>
              </article>
            ))}
          </div>
        </section>

        <section className="panel schedule-panel">
          <div className="section-title">
            <BookOpenCheck size={20} />
            <h2>Актуальное расписание</h2>
          </div>

          <div className="lesson-list">
            {groupWorks.map((work) => (
              <article className="lesson-row planned-work-row" key={work.id}>
                <time>{formatDate(work.date)}</time>
                <div>
                  <strong>
                    {work.subject}: {work.title}
                  </strong>
                  <span>
                    {work.comment}
                    {work.deadline ? ` · дедлайн ${formatDate(work.deadline)}` : ''}
                  </span>
                </div>
                <b>{work.room ? `${getWorkTypeLabel(work.type)} · ${work.room}` : getWorkTypeLabel(work.type)}</b>
              </article>
            ))}
            {dashboardData.schedule.map((lesson) => (
              <article className="lesson-row" key={lesson.id}>
                <time>{lesson.time}</time>
                <div>
                  <strong>{lesson.subject}</strong>
                  <span>{lesson.note}</span>
                </div>
                <b>ауд. {lesson.room}</b>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="right-column">
        <MiniCalendar exams={dashboardData.exams} plannedWorks={groupWorks} deadlines={dashboardData.deadlines} />

        <section className="panel">
          <div className="section-title">
            <Clock size={20} />
            <h2>Расписание экзаменов</h2>
          </div>

          <div className="exam-list">
            {dashboardData.exams.map((exam) => (
              <article key={exam.id}>
                <time>{formatDate(exam.date)}</time>
                <strong>{exam.subject}</strong>
                <span>
                  {exam.time}, ауд. {exam.room}
                </span>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function getWorkTypeLabel(type: PlannedWork['type']) {
  if (type === 'lab') {
    return 'ЛР';
  }

  if (type === 'required-test') {
    return 'ОКР';
  }

  if (type === 'exam') {
    return 'Экз.';
  }

  return 'КР';
}

function getWorkTypeFullLabel(type: PlannedWork['type']) {
  if (type === 'lab') {
    return 'лабораторная работа';
  }

  if (type === 'required-test') {
    return 'обязательная контрольная работа';
  }

  if (type === 'exam') {
    return 'экзамен';
  }

  return 'контрольная работа';
}

function MiniCalendar({
  exams,
  plannedWorks,
  deadlines,
}: {
  exams: Exam[];
  plannedWorks: PlannedWork[];
  deadlines: Deadline[];
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const eventsByDay = new Map<number, string[]>();

  const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(now);

  exams.forEach((exam) => {
    addCalendarEvent(eventsByDay, exam.date, `Экзамен: ${exam.subject}`, currentYear, currentMonth);
  });

  deadlines.forEach((deadline) => {
    addCalendarEvent(eventsByDay, deadline.dueDate, `Дедлайн: ${deadline.subject}`, currentYear, currentMonth);
  });

  plannedWorks.forEach((work) => {
    addCalendarEvent(eventsByDay, work.date, `${capitalize(getWorkTypeFullLabel(work.type))}: ${work.subject}`, currentYear, currentMonth);

    if (work.type === 'lab' && work.deadline) {
      addCalendarEvent(eventsByDay, work.deadline, `Дедлайн лабы: ${work.subject} · ${work.title}`, currentYear, currentMonth);
    }
  });

  return (
    <section className="panel calendar-panel">
      <div className="section-title">
        <CalendarDays size={20} />
        <h2>{monthName[0].toUpperCase() + monthName.slice(1)} {currentYear}</h2>
      </div>
      <div className="calendar-weekdays">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const events = eventsByDay.get(day) ?? [];
          const className = [day === currentDay ? 'current' : '', events.length ? 'has-event' : ''].filter(Boolean).join(' ');

          return (
            <button className={className} data-tooltip={events.join(' · ') || undefined} key={day}>
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function addCalendarEvent(eventsByDay: Map<number, string[]>, date: string, label: string, currentYear: number, currentMonth: number) {
  const eventDate = new Date(date);

  if (eventDate.getMonth() !== currentMonth || eventDate.getFullYear() !== currentYear) {
    return;
  }

  const day = eventDate.getDate();
  const current = eventsByDay.get(day) ?? [];
  eventsByDay.set(day, [...current, label]);
}
