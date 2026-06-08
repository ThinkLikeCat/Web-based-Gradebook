import { journalCells, journalDates, subjects } from '../data/mockData';
import type { JournalCell, JournalMode } from '../types';

export async function getJournalData() {
  return {
    dates: journalDates,
    subjects,
    cells: journalCells,
  };
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
    const isValidAbsence = (part: string) => part === 'Н' || /^ОП(?::\d{1,3})?$/.test(part);
    if (!parts.every(isValidAbsence)) {
      throw new Error('Для пропусков можно вводить Н, ОП, ОП:15 и дробь через /');
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
