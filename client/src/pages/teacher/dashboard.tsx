import { BookOpenCheck, FolderOpen, Users } from 'lucide-react';
import { groups } from '../../data/mockData';
import type { TeacherChoice, User } from '../../types';

const teacherSubjects = ['Веб-программирование', 'Системы управления БД', 'Компьютерные сети', 'Тестирование ПО'];

export function TeacherDashboard({
  user,
  choice,
  onChoiceChange,
}: {
  user: User;
  choice: TeacherChoice;
  onChoiceChange: (choice: TeacherChoice) => void;
}) {
  return (
    <div className="teacher-home">
      <header className="page-head">
        <div>
          <span className="eyebrow">Преподаватель</span>
          <h1>{user.fullName}</h1>
          <p>Выберите группу и предмет, чтобы открыть нужный журнал.</p>
        </div>
      </header>

      <section className="panel teacher-select">
        <div className="section-title">
          <FolderOpen size={20} />
          <h2>Выбор журнала</h2>
        </div>

        <div className="select-grid">
          <label>
            Группа
            <select value={choice.group} onChange={(event) => onChoiceChange({ ...choice, group: event.target.value })}>
              {groups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>

          <label>
            Предмет
            <select value={choice.subject} onChange={(event) => onChoiceChange({ ...choice, subject: event.target.value })}>
              {teacherSubjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="stat-grid">
        <article className="stat-card">
          <Users size={24} />
          <strong>26</strong>
          <span>студентов в группе</span>
        </article>
        <article className="stat-card">
          <BookOpenCheck size={24} />
          <strong>8</strong>
          <span>занятий в журнале за месяц</span>
        </article>
        <article className="stat-card">
          <FolderOpen size={24} />
          <strong>14</strong>
          <span>лабораторных ожидают проверки</span>
        </article>
      </div>
    </div>
  );
}
