import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../services/db';

interface TaskState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TaskState = {
  items: [],
  status: 'idle',
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.push(action.payload);
    },
    updateTaskItem: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    setTaskStatus: (state, action: PayloadAction<{ status: TaskState['status'], error?: string }>) => {
      state.status = action.payload.status;
      if (action.payload.error) state.error = action.payload.error;
    }
  },
});

export const { setTasks, addTask, updateTaskItem, removeTask, setTaskStatus } = taskSlice.actions;
export default taskSlice.reducer;
