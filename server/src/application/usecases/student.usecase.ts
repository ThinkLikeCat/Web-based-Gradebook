import { StudentUseCase } from '../ports/in/student.usecase';
import { StudentRepository } from '../../infrastructure/database/repositories/student.repository';
import { StudentScheduleDto } from '../dtos/student-schedule.dto';
import { StudentJournalDto } from '../dtos/student-journal.dto';
import { StudentSubjectProgressDto } from '../dtos/student-subject.dto';
import { StudentLabDetailDto } from '../dtos/student-lab.dto';

export class StudentUseCaseImpl implements StudentUseCase {
  constructor(private readonly repository: StudentRepository) {}

  async getSchedule(studentId: string): Promise<StudentScheduleDto> {
    const student = await this.repository.findStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const scheduleEntries = await this.repository.findScheduleByStudentId(studentId);
    return {
      studentId: student.id.value,
      studentName: student.name,
      schedule: scheduleEntries.flatMap(({ course }) =>
        course.schedule.map((item) => ({
          subjectId: course.id.value,
          subjectName: course.name,
          teacherName: course.teacherName,
          day: item.day,
          time: item.time,
          room: item.room,
        })),
      ),
    };
  }

  async getJournal(studentId: string): Promise<StudentJournalDto> {
    const student = await this.repository.findStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const grades = await this.repository.findGradesByStudentId(studentId);
    const attendance = await this.repository.findAttendanceByStudentId(studentId);

    const gradeRows = await Promise.all(
      grades.map(async (grade) => {
        const course = await this.repository.findCourseById(grade.subjectId);
        return {
          subjectId: grade.subjectId,
          subjectName: course?.name ?? 'Неизвестный предмет',
          type: grade.type,
          value: grade.value,
          date: grade.date,
        };
      }),
    );

    const attendanceRows = await Promise.all(
      attendance.map(async (record) => {
        const course = await this.repository.findCourseById(record.subjectId);
        return {
          subjectId: record.subjectId,
          subjectName: course?.name ?? 'Неизвестный предмет',
          date: record.date,
          status: record.status,
        };
      }),
    );

    return {
      studentId: student.id.value,
      studentName: student.name,
      grades: gradeRows,
      attendance: attendanceRows,
    };
  }

  async getSubjectProgress(studentId: string, subjectId: string): Promise<StudentSubjectProgressDto> {
    const student = await this.repository.findStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const course = await this.repository.findCourseById(subjectId);
    if (!course) {
      throw new Error('Subject not found');
    }

    const grades = (await this.repository.findGradesByStudentId(studentId)).filter((grade) => grade.subjectId === subjectId);
    const attendance = (await this.repository.findAttendanceByStudentId(studentId)).filter(
      (record) => record.subjectId === subjectId,
    );

    const averageScore = grades.length > 0 ? Math.round(grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length) : 0;
    const attendanceStats = attendance.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      studentId: student.id.value,
      studentName: student.name,
      subjectId: course.id.value,
      subjectName: course.name,
      grades: grades.map((grade) => ({ type: grade.type, value: grade.value, date: grade.date })),
      attendance: attendance.map((record) => ({ date: record.date, status: record.status })),
      summary: `Средний балл ${averageScore}. Посещаемость: present=${attendanceStats.present ?? 0}, absent=${attendanceStats.absent ?? 0}, late=${attendanceStats.late ?? 0}.`,
    };
  }

  async getLabDetails(studentId: string, labId: string): Promise<StudentLabDetailDto> {
    const student = await this.repository.findStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const lab = await this.repository.findLabWorkById(labId);
    if (!lab) {
      throw new Error('Lab not found');
    }

    const submission = await this.repository.findLabSubmission(studentId, labId);
    if (!submission) {
      return {
        studentId: student.id.value,
        studentName: student.name,
        labId: lab.id.value,
        subjectId: lab.subjectId,
        title: lab.title,
        issueDate: lab.issueDate,
        dueDate: lab.dueDate,
        teamWork: lab.teamWork,
        theoryMaterials: lab.theoryMaterials,
        partners: lab.partners,
        submissionStatus: 'pending',
        fileUrl: '',
        teacherComment: '',
        teacherGrade: null,
      };
    }

    return {
      studentId: student.id.value,
      studentName: student.name,
      labId: lab.id.value,
      subjectId: lab.subjectId,
      title: lab.title,
      issueDate: lab.issueDate,
      dueDate: lab.dueDate,
      teamWork: lab.teamWork,
      theoryMaterials: lab.theoryMaterials,
      partners: lab.partners,
      submissionStatus: submission.status,
      fileUrl: submission.fileUrl,
      teacherComment: submission.teacherComment,
      teacherGrade: submission.teacherGrade,
    };
  }
}
