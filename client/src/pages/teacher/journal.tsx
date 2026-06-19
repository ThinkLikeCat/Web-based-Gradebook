import { Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Journal } from '../student/journal';
import { getTeacherGroups, getTeacherJournal } from '../../api/teacher';
import { SkeletonGrid } from '../../components/ui/AsyncState';
import type { JournalCell, TeacherChoice } from '../../types';

export function TeacherJournal({
  choice,
  onChoiceChange,
}: {
  choice: TeacherChoice;
  onChoiceChange: (choice: TeacherChoice) => void;
}) {
  const [canEdit, setCanEdit] = useState(false);
  const [groupInfos, setGroupInfos] = useState<Array<{ groupId: string; groupName: string; subjectId: string; subjectName: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; shortName: string }>>([]);
  const [cells, setCells] = useState<JournalCell[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [dateLessonMap, setDateLessonMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const uniqueGroups = [...new Set(groupInfos.map(g => g.groupName))];
  const groupSubjectNames = [...new Set(
    groupInfos
      .filter(g => g.groupName === choice.group)
      .map(g => g.subjectName)
  )];

  useEffect(() => {
    setLoading(true);
    getTeacherGroups()
      .then(data => setGroupInfos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (choice.group && !groupSubjectNames.includes(choice.subject)) {
      const firstSubject = groupSubjectNames[0];
      if (firstSubject && firstSubject !== choice.subject) {
        onChoiceChange({ ...choice, subject: firstSubject });
        return;
      }
    }

    const info = groupInfos.find(g => g.groupName === choice.group && g.subjectName === choice.subject);
    if (!info) return;

    getTeacherJournal(info.groupId, info.subjectId)
      .then(data => {
        setStudents(data.students);
        setCells(data.cells);
        setDates(data.dates);
        setDateLessonMap(data.dateLessonMap);
      })
      .catch(() => {});
  }, [choice.group, choice.subject, groupInfos]);

  if (loading) {
    return (
      <div className="teacher-journal-page">
        <header className="page-head">
          <div>
            <span className="eyebrow">Журнал</span>
            <h1>Электронный журнал</h1>
          </div>
        </header>
        <SkeletonGrid count={3} />
      </div>
    );
  }

  if (groupInfos.length === 0) {
    return (
      <div className="teacher-journal-page">
        <div className="async-state" style={{ minHeight: 260 }}>
          <Inbox size={32} />
          Нет доступных журналов
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-journal-page">
      <div className="teacher-context">
        <div className="teacher-journal-filters">
          <label>
            Группа
            <select value={choice.group} onChange={(event) => onChoiceChange({ ...choice, group: event.target.value })}>
              {uniqueGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>
          <label>
            Предмет
            <select value={choice.subject} onChange={(event) => onChoiceChange({ ...choice, subject: event.target.value })}>
              {groupSubjectNames.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </label>
        </div>
        <button className={canEdit ? 'edit-toggle active' : 'edit-toggle'} onClick={() => setCanEdit((value) => !value)}>
          {canEdit ? 'Завершить редактирование' : 'Редактировать журнал'}
        </button>
      </div>
      <Journal
        role="teacher"
        canEdit={canEdit}
        rows={students}
        cells={cells}
        dates={dates}
        dateLessonMap={dateLessonMap}
        leftHeader="ФИО ученика"
        cornerTop="Даты занятий"
        cornerBottom="ФИО ученика"
      />
    </div>
  );
}
