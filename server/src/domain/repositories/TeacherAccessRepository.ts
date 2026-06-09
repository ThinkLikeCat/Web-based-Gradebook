import { TeacherGroupInfoDto } from '../../application/dtos/teacher-lab.dto';

export interface TeacherGroupData {
  id: string;
  name: string;
}

export interface TeacherSubjectData {
  id: string;
  name: string;
}

export interface TeacherStudentData {
  id: string;
  fullName: string;
  groupId: string;
  isExpelled: boolean;
  isNew: boolean;
}

export interface TeacherAccessRepository {
  findTeacherGroups(teacherId: number): Promise<TeacherGroupInfoDto[]>;
  checkTeacherAccess(teacherId: number, groupId: string, subjectId: string): Promise<boolean>;
  checkTeacherSubjectAccess(teacherId: number, subjectId: string): Promise<boolean>;
  findGroupById(groupId: string): Promise<TeacherGroupData | null>;
  findSubjectById(subjectId: string): Promise<TeacherSubjectData | null>;
  findStudentsByGroup(groupId: string): Promise<TeacherStudentData[]>;
}
