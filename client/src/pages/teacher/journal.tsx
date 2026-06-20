import { Inbox } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Journal } from '../student/journal';
import { addLesson, getTeacherGroups, getTeacherJournal } from '../../api/teacher';
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
  const [showAddDay, setShowAddDay] = useState(false);
  const [newLesson, setNewLesson] = useState({ date: '', startTime: '09:00', endTime: '10:30' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

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

  async function handleAddLesson(event: React.FormEvent) {
    event.preventDefault();
    const info = groupInfos.find(g => g.groupName === choice.group && g.subjectName === choice.subject);
    if (!info) return;

    setAdding(true);
    setAddError('');

    try {
      await addLesson({
        subjectId: info.subjectId,
        groupId: info.groupId,
        date: newLesson.date,
        startTime: newLesson.startTime,
        endTime: newLesson.endTime,
      });
      setShowAddDay(false);
      setNewLesson({ date: '', startTime: '09:00', endTime: '10:30' });

      const data = await getTeacherJournal(info.groupId, info.subjectId);
      setStudents(data.students);
      setCells(data.cells);
      setDates(data.dates);
      setDateLessonMap(data.dateLessonMap);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Не удалось добавить день');
    } finally {
      setAdding(false);
    }
  }

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
        <div className="teacher-actions">
          <button className="primary-button" onClick={() => setShowAddDay(true)}>+ Добавить день</button>
          <button className={canEdit ? 'edit-toggle active' : 'edit-toggle'} onClick={() => setCanEdit((value) => !value)}>
            {canEdit ? 'Завершить редактирование' : 'Редактировать журнал'}
          </button>
        </div>
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

      {showAddDay && (
        <div className="modal-backdrop" onClick={() => setShowAddDay(false)}>
          <form className="cell-modal" onSubmit={handleAddLesson} onClick={(e) => e.stopPropagation()}>
            <h2>Добавить день</h2>
            <label>
              Дата
              <input type="date" value={newLesson.date} onChange={(e) => setNewLesson({ ...newLesson, date: e.target.value })} required />
            </label>
            <label>
              Время начала
              <input type="time" value={newLesson.startTime} onChange={(e) => setNewLesson({ ...newLesson, startTime: e.target.value })} required />
            </label>
            <label>
              Время конца
              <input type="time" value={newLesson.endTime} onChange={(e) => setNewLesson({ ...newLesson, endTime: e.target.value })} required />
            </label>
            {addError && <span className="form-error">{addError}</span>}
            <div className="modal-actions">
              <button type="button" onClick={() => setShowAddDay(false)}>Отмена</button>
              <button className="primary-button" type="submit" disabled={adding}>
                {adding ? 'Добавление...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
