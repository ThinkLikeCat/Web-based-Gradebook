import { Journal } from '../student/journal';
import type { JournalCell, TeacherChoice } from '../../types';
import { useMemo, useState } from 'react';
import { groups, journalDates, studentsByGroup } from '../../data/mockData';

const teacherSubjects = ['Веб-программирование', 'Системы управления БД', 'Компьютерные сети', 'Тестирование ПО'];

export function TeacherJournal({
  choice,
  onChoiceChange,
}: {
  choice: TeacherChoice;
  onChoiceChange: (choice: TeacherChoice) => void;
}) {
  const [canEdit, setCanEdit] = useState(false);
  const students = studentsByGroup[choice.group] ?? [];
  const cells = useMemo(() => createTeacherCells(students, choice.subject), [students, choice.subject]);

  return (
    <div className="teacher-journal-page">
      <div className="teacher-context">
        <div className="teacher-journal-filters">
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
        <button className={canEdit ? 'edit-toggle active' : 'edit-toggle'} onClick={() => setCanEdit((value) => !value)}>
          {canEdit ? 'Завершить редактирование' : 'Редактировать журнал'}
        </button>
      </div>
      <Journal role="teacher" canEdit={canEdit} rows={students} cells={cells} leftHeader="ФИО ученика" />
    </div>
  );
}

function createTeacherCells(students: Array<{ id: string }>, subject: string): JournalCell[] {
  const subjectShift = subject.length % 6;

  return students.flatMap((student, studentIndex) =>
    journalDates.flatMap<JournalCell>((date, dateIndex) => {
      const marker = (studentIndex * 3 + dateIndex + subjectShift) % 17;

      if (marker === 1) {
        return [{ subjectId: student.id, date, marks: ['8'], absences: [] }];
      }

      if (marker === 4) {
        return [{ subjectId: student.id, date, marks: ['6', 'зч'], absences: [] }];
      }

      if (marker === 7) {
        return [{ subjectId: student.id, date, marks: ['9'], absences: [] }];
      }

      if (marker === 10) {
        return [{ subjectId: student.id, date, marks: [], absences: ['Н'] }];
      }

      if (marker === 14) {
        return [{ subjectId: student.id, date, marks: [], absences: ['ОП:15'] }];
      }

      return [];
    }),
  );
}
