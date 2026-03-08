import Dexie, { type EntityTable } from 'dexie';

export interface Subject {
  id: string; // From string _id in mongo
  name: string;
  color: string;
}

export interface Task {
  id: string; // local or mongo _id
  subjectId: string;
  topic: string;
  studyTime: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  offlineSyncState?: 'NEW' | 'MODIFIED' | 'DELETED'; // For background sync tracking
}

export interface PomodoroSession {
  id?: number; // Auto-increment locally
  taskId?: string;
  duration: number;
  completedAt: Date;
  synced: boolean;
}

const db = new Dexie('StudyPlannerDB') as Dexie & {
  subjects: EntityTable<Subject, 'id'>;
  tasks: EntityTable<Task, 'id'>;
  pomodoroSessions: EntityTable<PomodoroSession, 'id'>;
};

// Schema declaration
db.version(1).stores({
  subjects: 'id, name',
  tasks: 'id, subjectId, dueDate, status, offlineSyncState',
  pomodoroSessions: '++id, taskId, synced'
});

export default db;
