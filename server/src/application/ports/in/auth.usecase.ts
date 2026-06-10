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
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    role: string;
    group?: string;
    groupId?: string;
    studentId?: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthUseCase {
  registerStudent(data: RegisterStudentDto): Promise<AuthResultDto>;
  registerTeacher(data: RegisterTeacherDto): Promise<AuthResultDto>;
  login(data: LoginDto): Promise<AuthResultDto>;
  refreshToken(data: RefreshTokenDto): Promise<AuthResultDto>;
  logout(refreshToken: string): Promise<void>;
  logoutAll(userId: number): Promise<void>;
}
