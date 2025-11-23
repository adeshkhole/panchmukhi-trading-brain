import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import marketSlice from './slices/marketSlice';
import signalsSlice from './slices/signalsSlice';
import watchlistSlice from './slices/watchlistSlice';
import notificationSlice from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    market: marketSlice,
    signals: signalsSlice,
    watchlist: watchlistSlice,
    notifications: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;