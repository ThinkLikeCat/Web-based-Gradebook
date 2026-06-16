import { useEffect, useMemo, useState } from 'react';
import { getJournalData, updateJournalCell, validateCellValue } from '../../api/journal';
import type { JournalCell, JournalMode, Role, Semester, SubjectRow } from '../../types';
import { createSemesterDateFilter } from '../../utils/semester';

type JournalData = {
  dates: string[];
  subjects: SubjectRow[];
  cells: JournalCell[];
};

const monthNames = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

export function Journal({
  role,
  canEdit = false,
  rows,
  cells,
  leftHeader = 'Предмет',
  cornerTop,
  cornerBottom = 'Даты занятий',
}: {
  role: Role;
  canEdit?: boolean;
  rows?: SubjectRow[];
  cells?: JournalCell[];
  leftHeader?: string;
  cornerTop?: string;
  cornerBottom?: string;
}) {
  const [mode, setMode] = useState<JournalMode>('marks');
  const [data, setData] = useState<JournalData>({ dates: [], subjects: [], cells: [] });
  const [editing, setEditing] = useState<{ subjectId: string; date: string; value: string; lateMinutes: string } | null>(null);
  const [semester, setSemester] = useState<Semester>(2);
  const [filterText, setFilterText] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [error, setError] = useState('');
  const isLateEditing = editing?.value.includes('ОП') ?? false;
  const dateFilter = useMemo(() => createSemesterDateFilter(semester), [semester]);

  useEffect(() => {
    getJournalData().then((journalData) => {
      const visibleDates = dateFilter ? journalData.dates.filter(dateFilter) : journalData.dates;
      const visibleDateSet = new Set(visibleDates);

      setData({
        dates: visibleDates,
        subjects: rows ?? journalData.subjects,
        cells: (cells ?? journalData.cells).filter((cell) => visibleDateSet.has(cell.date)),
      });
    });
  }, [rows, cells, dateFilter]);

  const monthOptions = useMemo(() => getMonthOptions(data.dates), [data.dates]);
  const filteredDates = useMemo(
    () => (filterMonth === 'all' ? data.dates : data.dates.filter((date) => getMonthKey(date) === filterMonth)),
    [data.dates, filterMonth],
  );
  const visibleSubjects = useMemo(
    () => data.subjects.filter((subject) => matchesFilters(subject, filterText)),
    [data.subjects, filterText],
  );
  const monthGroups = useMemo(() => getMonthGroups(filteredDates), [filteredDates]);

  useEffect(() => {
    if (filterMonth !== 'all' && !monthOptions.some((month) => month.key === filterMonth)) {
      setFilterMonth('all');
    }
  }, [filterMonth, monthOptions]);

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

  function saveCell() {
    if (!editing) {
      return;
    }

    try {
      const rawValue = mode === 'absences' && editing.value.includes('ОП') ? applyLateMinutes(editing.value, editing.lateMinutes) : editing.value;
      const values = validateCellValue(mode, rawValue);
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

  function quickSet(subjectId: string, date: string, nextMode: JournalMode, value: string) {
    if (role !== 'teacher' || !canEdit) {
      return;
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
      </header>

      <div className="journal-filters" aria-label="Фильтры электронного журнала">
        <label>
          Поиск
          <input
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            placeholder={role === 'teacher' ? 'ФИО ученика' : 'Предмет'}
          />
        </label>
        <label>
          Месяц
          <select value={filterMonth} onChange={(event) => setFilterMonth(event.target.value)}>
            <option value="all">Все месяцы</option>
            {monthOptions.map((month) => (
              <option value={month.key} key={month.key}>
                {month.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Семестр
          <select
            value={semester}
            onChange={(event) => {
              setSemester(Number(event.target.value) as Semester);
              setFilterMonth('all');
            }}
          >
            <option value={1}>Семестр 1</option>
            <option value={2}>Семестр 2</option>
          </select>
        </label>
        <label>
          Режим
          <select value={mode} onChange={(event) => setMode(event.target.value as JournalMode)}>
            <option value="marks">Оценки</option>
            <option value="absences">Опоздания</option>
          </select>
        </label>
      </div>

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
              <th className="summary-head" colSpan={2}>
                Итоги
              </th>
            </tr>
            <tr>
              {filteredDates.map((date, index) => (
                <th className={isMonthStart(filteredDates, index) ? 'day-head month-start' : 'day-head'} key={date}>
                  {new Date(date).getDate()}
                </th>
              ))}
              <th className="summary-col summary-col--secondary">{mode === 'marks' ? 'Ср.' : 'Н'}</th>
              <th className="summary-col summary-col--last">{mode === 'marks' ? 'Итог' : 'ОП'}</th>
            </tr>
          </thead>
          <tbody>
            {visibleSubjects.map((subject) => (
              <tr key={subject.id}>
                <th className="subject-col">{subject.shortName}</th>
                {filteredDates.map((date, index) => {
                  const text = getCellText(subject.id, date);
                  const values = getCellValues(subject.id, date);
                  const cellClassName = [
                    'journal-cell',
                    getValueClass(text),
                    isMonthStart(filteredDates, index) ? 'month-start' : '',
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
                <td className={`summary-col summary-col--secondary ${getAverageClass(data.cells, subject.id, filteredDates)}`}>
                  {mode === 'marks' ? getAverage(data.cells, subject.id, filteredDates) : getAbsenceCount(data.cells, subject.id, filteredDates)}
                </td>
                <td className={`summary-col summary-col--last ${getFinalMarkClass(data.cells, subject.id, filteredDates)}`}>
                  {mode === 'marks' ? getFinalMark(data.cells, subject.id, filteredDates) : getLateCount(data.cells, subject.id, filteredDates)}
                </td>
              </tr>
            ))}
            {!visibleSubjects.length && (
              <tr>
                <td className="journal-empty" colSpan={filteredDates.length + 3}>
                  По выбранным фильтрам ничего не найдено
                </td>
              </tr>
            )}
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
    const key = getMonthKey(date);
    const last = groups[groups.length - 1];

    if (last?.key === key) {
      last.count += 1;
      return groups;
    }

    groups.push({ key, label: monthNames[current.getMonth()], count: 1 });
    return groups;
  }, []);
}

function getMonthOptions(dates: string[]) {
  return dates.reduce<Array<{ key: string; label: string }>>((options, date) => {
    const current = new Date(date);
    const key = getMonthKey(date);

    if (!options.some((option) => option.key === key)) {
      options.push({ key, label: monthNames[current.getMonth()] });
    }

    return options;
  }, []);
}

function getMonthKey(date: string) {
  const current = new Date(date);
  return `${current.getFullYear()}-${current.getMonth()}`;
}

function getRowCells(cells: JournalCell[], subjectId: string, dates: string[]) {
  const dateSet = new Set(dates);
  return cells.filter((cell) => cell.subjectId === subjectId && dateSet.has(cell.date));
}

function getNumericMarks(cells: JournalCell[], subjectId: string, dates: string[]) {
  return getRowCells(cells, subjectId, dates)
    .flatMap((cell) => cell.marks)
    .map((mark) => Number(mark))
    .filter((mark) => Number.isFinite(mark));
}

function getAverage(cells: JournalCell[], subjectId: string, dates: string[]) {
  const marks = getNumericMarks(cells, subjectId, dates);

  if (!marks.length) {
    return '';
  }

  const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
  return average.toFixed(1);
}

function getAverageClass(cells: JournalCell[], subjectId: string, dates: string[]) {
  const average = Number(getAverage(cells, subjectId, dates));

  if (Number.isFinite(average) && average < 3) {
    return 'danger-average';
  }

  return '';
}

<<<<<<< HEAD
function getFinalMark(cells: JournalCell[], subjectId: string, dates: string[]) {
  const average = Number(getAverage(cells, subjectId, dates));

  if (!Number.isFinite(average)) {
    return '';
  }

  return String(Math.round(average));
}

function getFinalMarkClass(cells: JournalCell[], subjectId: string, dates: string[]) {
  const finalMark = Number(getFinalMark(cells, subjectId, dates));

  if (Number.isFinite(finalMark) && finalMark < 3) {
    return 'danger-average';
  }

  return '';
}

function getAbsenceCount(cells: JournalCell[], subjectId: string, dates: string[]) {
  const count = getRowCells(cells, subjectId, dates).flatMap((cell) => cell.absences).filter((absence) => absence.includes('Н')).length;
  return count || '';
}

function getLateCount(cells: JournalCell[], subjectId: string, dates: string[]) {
  const count = getRowCells(cells, subjectId, dates).flatMap((cell) => cell.absences).filter((absence) => absence.startsWith('ОП')).length;
  return count || '';
}

function matchesFilters(subject: SubjectRow, filterText: string) {
  const normalizedFilterText = filterText.trim().toLowerCase();

  if (
    normalizedFilterText &&
    !subject.name.toLowerCase().includes(normalizedFilterText) &&
    !subject.shortName.toLowerCase().includes(normalizedFilterText)
  ) {
    return false;
  }

  return true;
}

=======
>>>>>>> 65d704fa271312697203b62f21fcd17039d6216b
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
