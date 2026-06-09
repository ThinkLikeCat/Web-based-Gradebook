import { BookOpenCheck, CalendarDays, Clock, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardData } from '../../api/schedule';
import { ErrorState, LoadingState } from '../../components/ui/AsyncState';
import type { Deadline, Exam, PlannedWork, ScheduleItem, User } from '../../types';

const today = new Date('2026-06-03');

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(date));
}

function daysLeft(date: string) {
  const diff = new Date(date).getTime() - today.getTime();
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
    return <LoadingState label="Загружаем главную страницу..." />;
  }

  return (
    <div className="dashboard-grid">
      <section className="content-column">
        <header className="page-head">
          <div>
            <span className="eyebrow">Среда</span>
            <h1>3 июня</h1>
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
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const eventsByDay = new Map<number, string[]>();

  exams.forEach((exam) => {
    addCalendarEvent(eventsByDay, exam.date, `Экзамен: ${exam.subject}`);
  });

  deadlines.forEach((deadline) => {
    addCalendarEvent(eventsByDay, deadline.dueDate, `Дедлайн: ${deadline.subject}`);
  });

  plannedWorks.forEach((work) => {
    addCalendarEvent(eventsByDay, work.date, `${capitalize(getWorkTypeFullLabel(work.type))}: ${work.subject}`);

    if (work.type === 'lab' && work.deadline) {
      addCalendarEvent(eventsByDay, work.deadline, `Дедлайн лабы: ${work.subject} · ${work.title}`);
    }
  });

  return (
    <section className="panel calendar-panel">
      <div className="section-title">
        <CalendarDays size={20} />
        <h2>Июнь 2026</h2>
      </div>
      <div className="calendar-weekdays">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const events = eventsByDay.get(day) ?? [];
          const className = [day === 3 ? 'current' : '', events.length ? 'has-event' : ''].filter(Boolean).join(' ');

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

function addCalendarEvent(eventsByDay: Map<number, string[]>, date: string, label: string) {
  const eventDate = new Date(date);

  if (eventDate.getMonth() !== 5 || eventDate.getFullYear() !== 2026) {
    return;
  }

  const day = eventDate.getDate();
  const current = eventsByDay.get(day) ?? [];
  eventsByDay.set(day, [...current, label]);
}
