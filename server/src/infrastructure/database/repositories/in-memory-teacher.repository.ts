import { ProgramItemDto } from '../../../application/dtos/teacher-program.dto';
import { LabSubmissionDto, TeacherGroupInfoDto } from '../../../application/dtos/teacher-lab.dto';

// In-Memory данные
const groups = [
  { id: 'group-1', name: 'Т-394' },
  { id: 'group-2', name: 'Т-395' },
];

const subjects = [
  { id: 'subject-1', name: 'Математика' },
  { id: 'subject-2', name: 'Физика' },
  { id: 'subject-3', name: 'Программирование' },
];

const students = [
  { id: 'student-1', fullName: 'Вольфович', groupId: 'group-1', isExpelled: false, isNew: false },
  { id: 'student-2', fullName: 'Иванов Иван', groupId: 'group-1', isExpelled: false, isNew: true },
  { id: 'student-3', fullName: 'Петров Петр', groupId: 'group-1', isExpelled: true, isNew: false },
  { id: 'student-4', fullName: 'Сидорова Анна', groupId: 'group-2', isExpelled: false, isNew: false },
];

const teacherGroups = [
  { teacherId: 2, groupId: 'group-1', subjectId: 'subject-1' },
  { teacherId: 2, groupId: 'group-1', subjectId: 'subject-2' },
  { teacherId: 2, groupId: 'group-2', subjectId: 'subject-1' },
];

let lessons = [
  { id: 'lesson-1', subjectId: 'subject-1', groupId: 'group-1', date: '2026-06-01', startTime: '09:00', endTime: '10:30' },
  { id: 'lesson-2', subjectId: 'subject-1', groupId: 'group-1', date: '2026-06-08', startTime: '09:00', endTime: '10:30' },
  { id: 'lesson-3', subjectId: 'subject-2', groupId: 'group-1', date: '2026-06-08', startTime: '11:00', endTime: '12:30' },
];

let grades = [
  { studentId: 'student-1', lessonId: 'lesson-1', value: 5, type: 'PRACTICAL' },
  { studentId: 'student-2', lessonId: 'lesson-1', value: 4, type: 'PRACTICAL' },
];

let attendances = [
  { studentId: 'student-1', lessonId: 'lesson-1', status: 'PRESENT' },
  { studentId: 'student-2', lessonId: 'lesson-1', status: 'LATE' },
  { studentId: 'student-3', lessonId: 'lesson-1', status: 'ABSENT' },
];

let programs: ProgramItemDto[] = [
  { id: 'program-1', subjectId: 'subject-1', title: 'Лабораторная работа №1', type: 'LAB', deadline: '2026-06-15', description: 'Решить уравнения', fileUrl: undefined },
  { id: 'program-2', subjectId: 'subject-1', title: 'Контрольная работа', type: 'CONTROL', deadline: '2026-06-20', description: 'Итоговая контрольная', fileUrl: undefined },
  { id: 'program-3', subjectId: 'subject-2', title: 'Лабораторная работа по физике', type: 'LAB', deadline: '2026-06-18', description: 'Измерения', fileUrl: undefined },
];

let labSubmissions: LabSubmissionDto[] = [
  { 
    id: 'submission-1', 
    studentId: 'student-1', 
    studentName: 'Вольфович',
    programId: 'program-1', 
    programTitle: 'Лабораторная работа №1',
    fileUrl: '/uploads/lab1.pdf', 
    comment: 'Хорошая работа', 
    grade: 5, 
    status: 'CHECKED', 
    submittedAt: '2026-06-10' 
  },
  { 
    id: 'submission-2', 
    studentId: 'student-2', 
    studentName: 'Иванов Иван',
    programId: 'program-1', 
    programTitle: 'Лабораторная работа №1',
    fileUrl: '/uploads/lab1_ivanov.pdf', 
    comment: undefined, 
    grade: undefined, 
    status: 'SUBMITTED', 
    submittedAt: '2026-06-12' 
  },
];

export class InMemoryTeacherRepository {
  async findTeacherGroups(teacherId: number): Promise<TeacherGroupInfoDto[]> {
    const result: TeacherGroupInfoDto[] = [];
    for (const tg of teacherGroups) {
      if (tg.teacherId === teacherId) {
        const group = groups.find(g => g.id === tg.groupId);
        const subject = subjects.find(s => s.id === tg.subjectId);
        if (group && subject) {
          result.push({
            groupId: group.id,
            groupName: group.name,
            subjectId: subject.id,
            subjectName: subject.name,
          });
        }
      }
    }
    return result;
  }

  async checkTeacherAccess(teacherId: number, groupId: string, subjectId: string): Promise<boolean> {
    return teacherGroups.some(tg => 
      tg.teacherId === teacherId && tg.groupId === groupId && tg.subjectId === subjectId
    );
  }

  async checkTeacherSubjectAccess(teacherId: number, subjectId: string): Promise<boolean> {
    return teacherGroups.some(tg => tg.teacherId === teacherId && tg.subjectId === subjectId);
  }

  async findGroupById(groupId: string) {
    return groups.find(g => g.id === groupId);
  }

  async findSubjectById(subjectId: string) {
    return subjects.find(s => s.id === subjectId);
  }

  async findStudentsByGroup(groupId: string) {
    return students.filter(s => s.groupId === groupId);
  }

  async findLessonsByGroupAndSubject(groupId: string, subjectId: string) {
    return lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId);
  }

  async findLessonById(lessonId: string) {
    return lessons.find(l => l.id === lessonId);
  }

  async createLesson(data: { subjectId: string; groupId: string; date: string; startTime: string; endTime: string }) {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      ...data,
    };
    lessons.push(newLesson);
    return newLesson;
  }

  async findGradesByGroupAndSubject(groupId: string, subjectId: string) {
    const lessonIds = lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId).map(l => l.id);
    return grades.filter(g => lessonIds.includes(g.lessonId));
  }

  async saveGrade(data: { studentId: string; lessonId: string; value: number; type: string }) {
    const existingIndex = grades.findIndex(g => g.studentId === data.studentId && g.lessonId === data.lessonId);
    if (existingIndex !== -1) {
      grades[existingIndex] = data;
    } else {
      grades.push(data);
    }
  }

  async findAttendancesByGroupAndSubject(groupId: string, subjectId: string) {
    const lessonIds = lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId).map(l => l.id);
    return attendances.filter(a => lessonIds.includes(a.lessonId));
  }

  async saveAttendance(data: { studentId: string; lessonId: string; status: string }) {
    const existingIndex = attendances.findIndex(a => a.studentId === data.studentId && a.lessonId === data.lessonId);
    if (existingIndex !== -1) {
      attendances[existingIndex] = data;
    } else {
      attendances.push(data);
    }
  }

  async findProgramBySubject(subjectId: string): Promise<ProgramItemDto[]> {
    return programs.filter(p => p.subjectId === subjectId);
  }

  async findProgramItemById(itemId: string): Promise<ProgramItemDto | null> {
    return programs.find(p => p.id === itemId) || null;
  }

  async createProgramItem(data: Omit<ProgramItemDto, 'id'>): Promise<ProgramItemDto> {
    const newItem: ProgramItemDto = {
      id: `program-${Date.now()}`,
      subjectId: data.subjectId,
      title: data.title,
      type: data.type,
      deadline: data.deadline,
      description: data.description,
      fileUrl: data.fileUrl,
    };
    programs.push(newItem);
    return newItem;
  }

  async updateProgramItem(itemId: string, data: Partial<Omit<ProgramItemDto, 'id'>>): Promise<void> {
    const index = programs.findIndex(p => p.id === itemId);
    if (index !== -1) {
      const existing = programs[index];
      programs[index] = {
        ...existing,
        ...data,
      };
    }
  }

  async deleteProgramItem(itemId: string): Promise<void> {
    const index = programs.findIndex(p => p.id === itemId);
    if (index !== -1) {
      programs.splice(index, 1);
    }
  }

  async findLabSubmissionsByProgram(programId: string): Promise<LabSubmissionDto[]> {
    return labSubmissions.filter(s => s.programId === programId);
  }

  async findLabSubmissionById(submissionId: string): Promise<LabSubmissionDto | null> {
    return labSubmissions.find(s => s.id === submissionId) || null;
  }

  async updateLabSubmission(submissionId: string, data: Partial<Omit<LabSubmissionDto, 'id'>>): Promise<void> {
    const index = labSubmissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      const existing = labSubmissions[index];
      labSubmissions[index] = {
        ...existing,
        ...data,
      };
    }
  }
}