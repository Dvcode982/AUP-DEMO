// store/store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

const backgroundSlice = createSlice({
  name: 'background',
  initialState: { image: '' },
  reducers: {
    toggleBackground: (state) => {
      state.image = state.image ? '' : '/images/your-background.jpg'; // 替换成你的背景图片路径
    },
    setBackground: (state, action) => {
      state.image = action.payload;
    },
  },
});

export const { toggleBackground, setBackground } = backgroundSlice.actions;

export const store = configureStore({
  reducer: {
    background: backgroundSlice.reducer,
  },
});
