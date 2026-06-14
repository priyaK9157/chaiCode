import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (url, options = {}, maxRetries = 5, initialDelayMs = 5000) => {
  let currentDelay = initialDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`⚠️ [Rate Limit] Received 429 from ${url}. Server might be waking up (hibernate-rate-limited). Increasing delay.`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`[Retry Fetch] Attempt ${attempt} failed for ${url}: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
      await delay(currentDelay);
      currentDelay = currentDelay * 2; // Double the delay for the next attempt (exponential backoff)
    }
  }
};

// Async thunk to fetch course by ID
export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/courses/${id}`);
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
      return await fetchWithRetry(`${API_BASE_URL}/api/courses`);
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
