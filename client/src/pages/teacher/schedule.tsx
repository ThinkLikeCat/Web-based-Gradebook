import { CalendarCheck, ClipboardPlus, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import type { PlannedWork, TeacherChoice } from '../../types';

export function TeacherSchedule({
  choice,
  items,
  onAddWork,
}: {
  choice: TeacherChoice;
  items: PlannedWork[];
  onAddWork: (work: PlannedWork) => void;
}) {
  const [kind, setKind] = useState<PlannedWork['type']>('lab');
  const [subject, setSubject] = useState(choice.subject);
  const [labNumber, setLabNumber] = useState('5');
  const [date, setDate] = useState('2026-06-20');
  const [deadline, setDeadline] = useState('2026-06-27');
  const [room, setRoom] = useState('214');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!subject.trim()) {
      setError('Введите предмет');
      return;
    }

    if (!room.trim()) {
      setError('Введите аудиторию');
      return;
    }

    if (kind !== 'exam' && !topic.trim()) {
      setError('Введите тему работы');
      return;
    }

    if (!date) {
      setError('Укажите дату проведения');
      return;
    }

    if (kind === 'lab' && (!deadline || new Date(deadline).getTime() < new Date(date).getTime())) {
      setError('Дедлайн лабораторной не может быть раньше даты проведения');
      return;
    }

    const title =
      kind === 'lab'
        ? `Лабораторная работа №${labNumber || '1'}`
        : kind === 'required-test'
          ? 'Обязательная контрольная работа'
          : kind === 'exam'
            ? 'Экзамен'
            : 'Контрольная работа';

    onAddWork({
      id: crypto.randomUUID(),
      group: choice.group,
      subject: subject.trim() || choice.subject,
      type: kind,
      title,
      date,
      deadline: kind === 'lab' ? deadline : undefined,
      room: room.trim(),
      comment: kind === 'exam' ? 'Экзамен по предмету' : topic.trim(),
    });
    setTopic('');
  }

  return (
    <div className="teacher-schedule-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">Планирование занятий</span>
          <h1>Расписание работ</h1>
          <p>
            {choice.group} · {choice.subject}
          </p>
        </div>
      </header>

      <div className="schedule-editor-grid">
        <section className="panel schedule-form-panel">
          <div className="section-title">
            <ClipboardPlus size={20} />
            <h2>Добавить запись</h2>
          </div>

          <form className="teacher-schedule-form" onSubmit={handleSubmit}>
            <label>
              Тип работы
              <select value={kind} onChange={(event) => setKind(event.target.value as PlannedWork['type'])}>
                <option value="lab">Лабораторная работа</option>
                <option value="required-test">Обязательная контрольная работа</option>
                <option value="test">Контрольная работа</option>
                <option value="exam">Экзамен</option>
              </select>
            </label>

            <label>
              Предмет
              <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Например: Веб-программирование" />
            </label>

            {kind === 'lab' && (
              <label>
                Номер лабораторной
                <input min="1" type="number" value={labNumber} onChange={(event) => setLabNumber(event.target.value)} />
              </label>
            )}

            <label>
              Дата проведения
              <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>

            <label>
              Аудитория
              <input value={room} onChange={(event) => setRoom(event.target.value)} placeholder="Например: 214" />
            </label>

            {kind === 'lab' && (
              <label>
                Дедлайн сдачи
                <input required type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
              </label>
            )}

            {kind !== 'exam' && (
              <label className="form-wide">
                Тема работы
                <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Например: формы, валидация, REST API" />
              </label>
            )}

            {error && <p className="form-error form-wide">{error}</p>}

            <button className="primary-button" type="submit">
              Добавить в расписание
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="section-title">
            <CalendarCheck size={20} />
            <h2>Запланированные работы</h2>
          </div>

          <div className="planned-list">
            {items.map((item) => (
              <article className="planned-item" key={item.id}>
                <div className={item.type === 'lab' ? 'planned-icon planned-icon--lab' : 'planned-icon planned-icon--test'}>
                  {item.type === 'lab' ? <FlaskConical size={18} /> : <CalendarCheck size={18} />}
                </div>
                <div>
                  <strong>
                    {item.subject}: {item.title}
                  </strong>
                  <span>
                    {item.comment}
                    {item.room ? ` · ауд. ${item.room}` : ''}
                  </span>
                </div>
                <div className="planned-dates">
                  <b>{formatDate(item.date)}</b>
                  {item.deadline && <small>дедлайн: {formatDate(item.deadline)}</small>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(date));
}
