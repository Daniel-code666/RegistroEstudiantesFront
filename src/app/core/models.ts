export interface Page<T> { items: T[]; totalRecords: number; pageNumber: number; pageSize: number; }
export interface User {
  id: number; name: string; lastName: string; email: string; role: string;
  identificationType: string; identificationNumber: string; active: boolean;
}
export interface Role { id: number; name: string; description: string; active: boolean; }
export interface Subject {
  id: number; name: string; description: string; credits: number;
  professorId: number | null; professorName: string; active: boolean;
}
export interface Enrollment { userId: number; totalCredits: number; subjects: Subject[]; }
export interface StudentRecord { name: string; subjects: { id: number; name: string; credits: number }[]; }
export interface PersonName { name: string; }
export interface LoginResponse { accessToken: string; expiresAtUtc: string; user: User; }
export const emptyPage = <T>(): Page<T> => ({ items: [], totalRecords: 0, pageNumber: 1, pageSize: 10 });
export const roleLabel = (role: string): string => ({ Admin: 'Administrador', Student: 'Estudiante', Professor: 'Profesor' })[role] ?? role;
