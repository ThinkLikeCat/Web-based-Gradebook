export type StudentLabDetailDto = {
  studentId: string;
  studentName: string;
  labId: string;
  subjectId: string;
  title: string;
  issueDate: string;
  dueDate: string;
  teamWork: boolean;
  theoryMaterials: string;
  partners: { id: string; name: string }[];
  submissionStatus: 'submitted' | 'pending' | 'graded';
  fileUrl: string;
  teacherComment: string;
  teacherGrade: number | null;
};
