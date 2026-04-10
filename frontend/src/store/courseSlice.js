import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch course by ID
export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://chaicode-1.onrender.com/api/courses/${id}`);
      if (!response.ok) {
        throw new Error('Server error!');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch all published courses
export const fetchAllCourses = createAsyncThunk(
  'courses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('https://chaicode-1.onrender.com/api/courses');
      if (!response.ok) {
        throw new Error('Server error!');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [], // For the home page slider
    selectedCourse: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedCourse } = courseSlice.actions;

export default courseSlice.reducer;
