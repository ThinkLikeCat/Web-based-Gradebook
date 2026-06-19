import { useEffect, useMemo, useState } from 'react';
import { getJournalData, updateJournalCell, validateCellValue } from '../../api/journal';
import { saveGrade, saveAttendance } from '../../api/teacher';
import type { JournalCell, JournalMode, Role, SubjectRow } from '../../types';

type JournalData = {
  dates: string[];
  subjects: SubjectRow[];
  cells: JournalCell[];
};

const monthNames = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

export function Journal({
  role,
  canEdit = false,
  rows,
  cells,
  dates: propDates,
  dateLessonMap,
  leftHeader = 'Предмет',
  cornerTop,
  cornerBottom = 'Даты занятий',
}: {
  role: Role;
  canEdit?: boolean;
  rows?: SubjectRow[];
  cells?: JournalCell[];
  dates?: string[];
  dateLessonMap?: Map<string, string>;
  leftHeader?: string;
  cornerTop?: string;
  cornerBottom?: string;
}) {
  const [mode, setMode] = useState<JournalMode>('marks');
  const [data, setData] = useState<JournalData>({ dates: [], subjects: [], cells: [] });
  const [editing, setEditing] = useState<{ subjectId: string; date: string; value: string; lateMinutes: string } | null>(null);
  const [error, setError] = useState('');
  const isLateEditing = editing?.value.includes('ОП') ?? false;

  useEffect(() => {
    if (propDates && rows && cells) {
      setData({ dates: propDates, subjects: rows, cells });
      return;
    }
    getJournalData().then((journalData) => {
      setData({
        dates: journalData.dates,
        subjects: rows ?? journalData.subjects,
        cells: cells ?? journalData.cells,
      });
    });
  }, [rows, cells, propDates]);

  const monthGroups = useMemo(() => getMonthGroups(data.dates), [data.dates]);

  function findCell(subjectId: string, date: string) {
    return data.cells.find((cell) => cell.subjectId === subjectId && cell.date === date);
  }

  function getCellText(subjectId: string, date: string) {
    const cell = findCell(subjectId, date);
    const values = getVisibleValues(cell, mode);

    return values?.join('/') ?? '';
  }

  function getCellValues(subjectId: string, date: string) {
    return getVisibleValues(findCell(subjectId, date), mode);
  }

  async function saveCell() {
    if (!editing) {
      return;
    }

    try {
      const rawValue = mode === 'absences' && editing.value.includes('ОП') ? applyLateMinutes(editing.value, editing.lateMinutes) : editing.value;
      const values = validateCellValue(mode, rawValue);
      const firstValue = values[0];
      const lessonId = dateLessonMap?.get(editing.date);

      if (role === 'teacher' && lessonId && firstValue) {
        if (mode === 'marks') {
          const num = parseInt(firstValue, 10);
          if (Number.isFinite(num)) {
            await saveGrade(editing.subjectId, lessonId, num, 'PRACTICAL');
          }
        } else {
          const status = firstValue.startsWith('ОП') ? 'LATE' : 'ABSENT';
          await saveAttendance(editing.subjectId, lessonId, status);
        }
      }

      setData((current) => ({
        ...current,
        cells: updateJournalCell(current.cells, editing.subjectId, editing.date, mode, values),
      }));
      setEditing(null);
      setError('');
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Некорректное значение');
    }
  }

  async function quickSet(subjectId: string, date: string, nextMode: JournalMode, value: string) {
    if (role !== 'teacher' || !canEdit) {
      return;
    }

    const lessonId = dateLessonMap?.get(date);
    if (lessonId) {
      try {
        const status = value.startsWith('ОП') ? 'LATE' : 'ABSENT';
        await saveAttendance(subjectId, lessonId, status);
      } catch {
        return;
      }
    }

    setData((current) => ({
      ...current,
      cells: updateJournalCell(current.cells, subjectId, date, nextMode, [value]),
    }));
  }

  return (
    <section className={`journal-page ${canEdit ? 'is-editing' : ''}`}>
      <header className="page-head journal-head">
        <div>
          <span className="eyebrow">{role === 'teacher' ? 'Редактирование журнала' : 'Журнал студента'}</span>
          <h1>Электронный журнал</h1>
          <p>
            {mode === 'marks'
              ? 'Оценки по предметам и датам. В режиме редактирования можно добавить или заменить отметку.'
              : 'Пропуски по тем же занятиям. В режиме редактирования можно поставить Н или Н/Н.'}
          </p>
        </div>

        <div className="tabs">
          <button className={mode === 'marks' ? 'active' : ''} onClick={() => setMode('marks')}>
            Оценки
          </button>
          <button className={mode === 'absences' ? 'active' : ''} onClick={() => setMode('absences')}>
            Пропуски
          </button>
        </div>
      </header>

      <div className="journal-wrap">
        <table className="journal-table">
          <thead>
            <tr>
              <th className="subject-col corner" rowSpan={2}>
                <span>{cornerTop ?? leftHeader}</span>
                <small>{cornerBottom}</small>
              </th>
              {monthGroups.map((group) => (
                <th className="month-head" colSpan={group.count} key={group.key}>
                  {group.label}
                </th>
              ))}
              <th className="average-col" rowSpan={2}>
                {mode === 'marks' ? 'Ср.зн' : ''}
              </th>
            </tr>
            <tr>
              {data.dates.map((date, index) => (
                <th className={isMonthStart(data.dates, index) ? 'day-head month-start' : 'day-head'} key={date}>
                  {new Date(date).getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((subject) => (
              <tr key={subject.id}>
                <th className="subject-col">{subject.shortName}</th>
                {data.dates.map((date, index) => {
                  const text = getCellText(subject.id, date);
                  const values = getCellValues(subject.id, date);
                  const cellClassName = [
                    'journal-cell',
                    getValueClass(text),
                    isMonthStart(data.dates, index) ? 'month-start' : '',
                    text ? 'filled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <td
                      className={cellClassName}
                      key={`${subject.id}-${date}`}
                      title={getCellTitle(text, role, canEdit, mode)}
                      onClick={() => {
                        if (role === 'teacher' && canEdit) {
                          setEditing({
                            subjectId: subject.id,
                            date,
                            value: mode === 'absences' && !text ? 'Н' : text,
                            lateMinutes: normalizeLateMinutes(getLateMinutes(text)),
                          });
                        }
                      }}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        quickSet(subject.id, date, 'absences', 'Н');
                      }}
                      onAuxClick={(event) => {
                        if (event.button === 1) {
                          quickSet(subject.id, date, 'absences', 'ОП:10');
                        }
                      }}
                    >
                      {values.length > 0 && (
                        <span className={values.length > 1 ? 'cell-stack' : 'cell-stack cell-stack--single'}>
                          {values.map((value, index) => (
                            <span key={`${value}-${index}`}>{formatCellPart(value)}</span>
                          ))}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className={mode === 'marks' ? `average-col ${getAverageClass(data.cells, subject.id)}` : 'average-col'}>
                  {mode === 'marks' ? getAverage(data.cells, subject.id) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form
            className="cell-modal"
            onSubmit={(event) => {
              event.preventDefault();
              saveCell();
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2>{mode === 'marks' ? 'Добавить или заменить отметку' : 'Поставить пропуск'}</h2>
            <p>
              {new Date(editing.date).toLocaleDateString('ru-RU')} ·{' '}
              {data.subjects.find((subject) => subject.id === editing.subjectId)?.name}
            </p>
            <input
              autoFocus
              value={editing.value}
              onChange={(event) => setEditing({ ...editing, value: event.target.value })}
              placeholder={mode === 'marks' ? 'Например: 8/9 или ЗЧ' : 'Например: Н/Н или ОП'}
            />
            {mode === 'absences' && (
              <>
                <div className="quick-values">
                  <button type="button" onClick={() => setEditing({ ...editing, value: 'Н' })}>
                    Н
                  </button>
                  <button type="button" onClick={() => setEditing({ ...editing, value: 'Н/Н' })}>
                    Н/Н
                  </button>
                  <button type="button" onClick={() => setEditing({ ...editing, value: `ОП:${editing.lateMinutes}` })}>
                    ОП
                  </button>
                </div>
                {isLateEditing && (
                  <label className="late-select">
                    Время опоздания
                    <select
                      value={editing.lateMinutes}
                      onChange={(event) => {
                        const lateMinutes = event.target.value;
                        setEditing({
                          ...editing,
                          lateMinutes,
                          value: applyLateMinutes(editing.value, lateMinutes),
                        });
                      }}
                    >
                      {[5, 10, 15].map((minutes) => (
                        <option value={minutes} key={minutes}>
                          {minutes} минут
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
            {error && <span className="form-error">{error}</span>}
            <div className="modal-actions">
              <button type="button" onClick={() => setEditing(null)}>
                Отмена
              </button>
              <button className="primary-button" type="submit">
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function getMonthGroups(dates: string[]) {
  return dates.reduce<Array<{ key: string; label: string; count: number }>>((groups, date) => {
    const current = new Date(date);
    const key = `${current.getFullYear()}-${current.getMonth()}`;
    const last = groups[groups.length - 1];

    if (last?.key === key) {
      last.count += 1;
      return groups;
    }

    groups.push({ key, label: monthNames[current.getMonth()], count: 1 });
    return groups;
  }, []);
}

function getAverage(cells: JournalCell[], subjectId: string) {
  const marks = cells
    .filter((cell) => cell.subjectId === subjectId)
    .flatMap((cell) => cell.marks)
    .map((mark) => Number(mark))
    .filter((mark) => Number.isFinite(mark));

  if (!marks.length) {
    return '';
  }

  const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
  return average.toFixed(1);
}

function getAverageClass(cells: JournalCell[], subjectId: string) {
  const average = Number(getAverage(cells, subjectId));

  if (Number.isFinite(average) && average < 3) {
    return 'danger-average';
  }

  return '';
}

function isMonthStart(dates: string[], index: number) {
  if (index === 0) {
    return false;
  }

  return new Date(dates[index]).getMonth() !== new Date(dates[index - 1]).getMonth();
}

function getVisibleValues(cell: JournalCell | undefined, mode: JournalMode) {
  if (!cell) {
    return [];
  }

  if (mode === 'marks') {
    const absencesWithoutLate = cell.absences.filter((absence) => !absence.startsWith('ОП'));
    return cell.marks.length > 0 ? cell.marks : absencesWithoutLate;
  }

  return cell.absences;
}

function formatCellPart(value: string) {
  return value.startsWith('ОП') ? 'ОП' : value.toLowerCase() === 'зч' ? 'зч' : value;
}

function getLateMinutes(value: string) {
  const match = value.match(/ОП:(\d{1,3})/);
  return match?.[1];
}

function normalizeLateMinutes(value: string | undefined) {
  const minutes = Number(value ?? 10);

  if (!Number.isFinite(minutes)) {
    return '10';
  }

  return String(Math.min(15, Math.max(1, minutes)));
}

function applyLateMinutes(value: string, minutes: string) {
  return value
    .split('/')
    .map((part) => (part.trim().startsWith('ОП') ? `ОП:${minutes}` : part.trim()))
    .join('/');
}

function getCellTitle(value: string, role: Role, canEdit: boolean, mode: JournalMode) {
  const lateMinutes = getLateMinutes(value);

  if (lateMinutes) {
    return `Опоздание: ${lateMinutes} минут${role === 'teacher' && canEdit ? '. Нажмите, чтобы изменить' : ''}`;
  }

  if (role === 'teacher' && canEdit) {
    return mode === 'marks' ? 'Нажмите, чтобы добавить или заменить отметку' : 'Нажмите, чтобы поставить пропуск';
  }

  return undefined;
}

function getValueClass(value: string) {
  if (!value) {
    return '';
  }

  const normalizedValue = value.toUpperCase();

  if (normalizedValue.includes('Н')) {
    return 'absence-value';
  }

  if (normalizedValue.includes('ОП')) {
    return 'late-value';
  }

  const marks = value
    .split('/')
    .map((mark) => Number(mark))
    .filter((mark) => Number.isFinite(mark));

  if (marks.some((mark) => mark >= 0 && mark <= 3)) {
    return 'danger-mark-value';
  }

  if (normalizedValue.includes('ЗЧ')) {
    return 'credit-value';
  }

  if (!marks.length) {
    return '';
  }

  const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;

  if (average >= 9) {
    return 'high-value';
  }

  if (average <= 5) {
    return 'low-value';
  }

  return 'normal-value';
}
