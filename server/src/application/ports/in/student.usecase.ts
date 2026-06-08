import { StudentScheduleDto } from '../../dtos/student-schedule.dto';
import { StudentJournalDto } from '../../dtos/student-journal.dto';
import { StudentSubjectProgressDto } from '../../dtos/student-subject.dto';
import { StudentLabDetailDto } from '../../dtos/student-lab.dto';

export interface StudentUseCase {
  getSchedule(studentId: string): Promise<StudentScheduleDto>;
  getJournal(studentId: string): Promise<StudentJournalDto>;
  getSubjectProgress(studentId: string, subjectId: string): Promise<StudentSubjectProgressDto>;
  getLabDetails(studentId: string, labId: string): Promise<StudentLabDetailDto>;
}
