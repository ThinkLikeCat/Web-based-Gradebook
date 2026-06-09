export interface RegisterStudentDto {
  lastName: string;
  firstName: string;
  birthDate: string;
  group: string;
  password: string;
}

export interface RegisterTeacherDto {
  lastName: string;
  firstName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  fullName: string;
  password?: string;
  birthDate?: string;
}

export interface AuthResultDto {
  token: string;
  user: {
    id: number;
    fullName: string;
    role: string;
    groupId?: string;
  };
}

export interface AuthUseCase {
  registerStudent(data: RegisterStudentDto): Promise<AuthResultDto>;
  registerTeacher(data: RegisterTeacherDto): Promise<AuthResultDto>;
  login(data: LoginDto): Promise<AuthResultDto>;
}
