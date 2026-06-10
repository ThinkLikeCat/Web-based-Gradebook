import { journalCells, journalDates, subjects } from '../data/mockData';
import type { JournalCell, JournalMode, SubjectRow } from '../types';
import { apiRequest } from './client';
import { getStudentJournal } from './student';

type JournalData = {
  dates: string[];
  subjects: SubjectRow[];
  cells: JournalCell[];
};

function getStoredStudentId(): string {
  try {
    const raw = sessionStorage.getItem('gradebook_user');
    if (!raw) return '';
    return JSON.parse(raw).studentId || '';
  } catch {
    return '';
  }
}

export async function getJournalData(): Promise<JournalData> {
  const studentId = getStoredStudentId();
  if (studentId) {
    try {
      return await getStudentJournal(studentId);
    } catch {
      return { dates: journalDates, subjects, cells: journalCells };
    }
  }

  return { dates: journalDates, subjects, cells: journalCells };
}

export function validateCellValue(mode: JournalMode, rawValue: string): string[] {
  const normalized = rawValue.trim().toUpperCase();

  if (!normalized) {
    return [];
  }

  const parts = normalized.split('/').map((part) => part.trim()).filter(Boolean);

  if (mode === 'marks') {
    const isValidMark = (part: string) => part === 'ЗЧ' || /^\d{1,2}$/.test(part);
    if (!parts.every(isValidMark)) {
      throw new Error('Для оценок можно вводить числа, ЗЧ и дробь через /');
    }
  }

  if (mode === 'absences') {
    const isValidAbsence = (part: string) => {
      if (part === 'Н') {
        return true;
      }

      const lateMatch = part.match(/^ОП(?::(\d{1,2}))?$/);
      if (!lateMatch) {
        return false;
      }

      const minutes = Number(lateMatch[1] ?? 5);
      return minutes >= 1 && minutes <= 15;
    };
    if (!parts.every(isValidAbsence)) {
      throw new Error('Для пропусков можно вводить Н, ОП и время опоздания до 15 минут');
    }
  }

  return parts;
}

export function updateJournalCell(
  cells: JournalCell[],
  subjectId: string,
  date: string,
  mode: JournalMode,
  values: string[],
) {
  const existing = cells.find((cell) => cell.subjectId === subjectId && cell.date === date);

  if (existing) {
    return cells.map((cell) => {
      if (cell !== existing) {
        return cell;
      }

      return mode === 'marks' ? { ...cell, marks: values } : { ...cell, absences: values };
    });
  }

  return [
    ...cells,
    {
      subjectId,
      date,
      marks: mode === 'marks' ? values : [],
      absences: mode === 'absences' ? values : [],
    },
  ];
}
