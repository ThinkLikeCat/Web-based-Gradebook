import { BookOpenCheck, FolderOpen, Inbox, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTeacherGroups, getTeacherStats } from '../../api/teacher';
import type { TeacherChoice, User } from '../../types';

export function TeacherDashboard({
  user,
  choice,
  onChoiceChange,
}: {
  user: User;
  choice: TeacherChoice;
  onChoiceChange: (choice: TeacherChoice) => void;
}) {
  const [groupInfos, setGroupInfos] = useState<Array<{ groupId: string; groupName: string; subjectId: string; subjectName: string }>>([]);
  const [lessonsThisMonth, setLessonsThisMonth] = useState<number | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const uniqueGroups = [...new Set(groupInfos.map(g => g.groupName))];
  const uniqueSubjects = [...new Set(groupInfos.map(g => g.subjectName))];

  useEffect(() => {
    setLoading(true);
    getTeacherGroups()
      .then(data => {
        setGroupInfos(data);
        if (data.length > 0) {
          onChoiceChange({ group: data[0].groupName, subject: data[0].subjectName });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getTeacherStats()
      .then(stats => {
        setLessonsThisMonth(stats.lessonsThisMonth);
        setPendingSubmissions(stats.pendingSubmissions);
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="teacher-home">
        <header className="page-head">
          <div>
            <span className="eyebrow">Преподаватель</span>
            <h1>{user.fullName}</h1>
          </div>
        </header>
        <div className="skeleton-grid">
          <div className="skeleton skeleton--narrow" />
          <div className="stat-grid">
            <div className="skeleton skeleton--narrow" />
            <div className="skeleton skeleton--narrow" />
            <div className="skeleton skeleton--narrow" />
          </div>
        </div>
      </div>
    );
  }

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
              {groupInfos.length === 0 && <option>Нет групп</option>}
              {uniqueGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>

          <label>
            Предмет
            <select value={choice.subject} onChange={(event) => onChoiceChange({ ...choice, subject: event.target.value })}>
              {uniqueSubjects.length === 0 && <option>Нет предметов</option>}
              {uniqueSubjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="stat-grid">
        <article className="stat-card">
          <Users size={24} />
          <strong>{uniqueGroups.length} / {uniqueSubjects.length}</strong>
          <span>групп и предметов</span>
        </article>
        <article className="stat-card">
          <BookOpenCheck size={24} />
          <strong>{lessonsThisMonth ?? '—'}</strong>
          <span>занятий за месяц</span>
        </article>
        <article className="stat-card">
          <FolderOpen size={24} />
          <strong>{pendingSubmissions ?? '—'}</strong>
          <span>работ на проверке</span>
        </article>
      </div>

      {groupInfos.length === 0 && (
        <div className="async-state" style={{ minHeight: 120 }}>
          <Inbox size={28} />
          Нет доступных журналов. Обратитесь к администратору.
        </div>
      )}
    </div>
  );
}
