import { BookOpenCheck, CalendarDays, Clock, FileText } from 'lucide-react';
import { deadlines, exams, schedule } from '../../data/mockData';
import type { PlannedWork, User } from '../../types';

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

export function Dashboard({ user, plannedWorks }: { user: User; plannedWorks: PlannedWork[] }) {
  const groupWorks = plannedWorks
    .filter((work) => work.group === user.group)
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime());

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

        <section className="panel">
          <div className="section-title">
            <FileText size={20} />
            <h2>Ближайшие дедлайны</h2>
          </div>

          <div className="deadline-list">
            {deadlines.map((deadline) => (
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
                <b>{getWorkTypeLabel(work.type)}</b>
              </article>
            ))}
            {schedule.map((lesson) => (
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
        <MiniCalendar />

        <section className="panel">
          <div className="section-title">
            <Clock size={20} />
            <h2>Расписание экзаменов</h2>
          </div>

          <div className="exam-list">
            {exams.map((exam) => (
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

  return 'КР';
}

function MiniCalendar() {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);

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
        {days.map((day) => (
          <button className={day === 3 ? 'current' : ''} key={day}>
            {day}
          </button>
        ))}
      </div>
    </section>
  );
}
