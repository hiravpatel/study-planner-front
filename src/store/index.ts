import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import subjectReducer from './subjectSlice';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectReducer,
    tasks: taskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
