import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Helper to handle fetch responses and handle non-JSON errors gracefully
 */
const handleResponse = async (response, defaultError) => {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || defaultError);
    return data;
  } else {
    // This handles the "Unexpected token E" issue when the gateway returns a proxy error (HTML)
    const text = await response.text();
    console.error("Non-JSON Error Response:", text);
    throw new Error("Internal service error or server is down. Please try again later.");
  }
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch('https://chaicode-q85o.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await handleResponse(response, 'Registration failed');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for signup OTP verification
export const verifySignupOtp = createAsyncThunk(
  'auth/verifySignupOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://chaicode-q85o.onrender.com/api/auth/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await handleResponse(response, 'Signup verification failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('https://chaicode-q85o.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response, 'Login failed');
      
      // Store in localStorage after successful response handling
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting user profile
export const deleteProfile = createAsyncThunk(
  'auth/deleteProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await fetch('https://chaicode-q85o.onrender.com/api/auth/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` },
      });

      if (response.status === 204) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return true;
      }
      
      return await handleResponse(response, 'Deletion failed');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for forgot password request
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch('https://chaicode-q85o.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await handleResponse(response, 'Failed to send OTP');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for verification
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://chaicode-q85o.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return await handleResponse(response, 'OTP verification failed');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for resetting password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://chaicode-q85o.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      return await handleResponse(response, 'Password reset failed');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Retrieve initial state from localStorage if it exists to persist session
const initialToken = localStorage.getItem('token') || null;
const initialUserStr = localStorage.getItem('user');
let initialUser = null;
try {
  if (initialUserStr) {
    initialUser = JSON.parse(initialUserStr);
  }
} catch {
  initialUser = null;
}

const initialState = {
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken,
  loading: false,
  error: null,
  resetEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setResetEmail: (state, action) => {
      state.resetEmail = action.payload;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // User created, but not verified yet. We do not set auth state yet.
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(verifySignupOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifySignupOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(verifySignupOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(deleteProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state) => { state.loading = false; })
      .addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; state.resetEmail = null; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { loginSuccess, logout, clearError, setResetEmail } = authSlice.actions;
export default authSlice.reducer;
