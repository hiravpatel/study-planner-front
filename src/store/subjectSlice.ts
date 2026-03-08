import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Subject } from '../services/db';

interface SubjectState {
  items: Subject[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SubjectState = {
  items: [],
  status: 'idle',
  error: null,
};

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setSubjects: (state, action: PayloadAction<Subject[]>) => {
      state.items = action.payload;
    },
    addSubject: (state, action: PayloadAction<Subject>) => {
      // Avoid duplicates
      if (!state.items.find(s => s.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    removeSubject: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(s => s.id !== action.payload);
    },
    setSubjectStatus: (state, action: PayloadAction<{ status: SubjectState['status'], error?: string }>) => {
      state.status = action.payload.status;
      if (action.payload.error) state.error = action.payload.error;
    }
  },
});

export const { setSubjects, addSubject, removeSubject, setSubjectStatus } = subjectSlice.actions;
export default subjectSlice.reducer;
