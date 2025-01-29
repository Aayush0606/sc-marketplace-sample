import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Role, User } from '../../types/user';
import { LOGIN_URL, SIGNUP_URL } from '../../constants/api_constants';
import network_service, { NetworkException } from '../../utils/network_service';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const getInitialUser = (): User | null => {
  const token = localStorage.getItem('token');
  if (token) {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode<DecodedToken>(token);
    return {
      id: decodedToken.id,
      email: decodedToken.email,
      displayName: decodedToken.username,
      fullName: decodedToken.username,
      avatarUrl: `https://robohash.org/${decodedToken.username}?set=set3`,
      role:decodedToken.role
    } as User; 
  }
  return null;
};

const initialState: AuthState = {
  user: getInitialUser(),
  status: 'idle',
  error: null,
};



export interface DecodedToken {
  id: string;
  email: string;
  username: string;
  role:Role
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    const payload ={
      username : username,
      password :password
    }

    var response;
    try {
      response = await network_service.post<any>({url:LOGIN_URL,body:payload});
    }catch (error) {
      const exc= error as NetworkException;
      console.log(exc)
      console.log(exc.message);
      console.log(exc.status);
    }

    const token = response?.data['token'];
      if (!token) {
        throw new Error('Token not found in response'); 
      }

    localStorage.setItem('token', token);

    // Decode JWT
    const decodedToken = jwtDecode<DecodedToken>(token);

    // Return the user object
    return {
      id: decodedToken.id,
      email: decodedToken.email,
      displayName: decodedToken.username,
      fullName: decodedToken.username,
      avatarUrl: `https://robohash.org/${decodedToken.username}?set=set3`,
      role:decodedToken.role
    } as User;
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ email, password,name ,username }: { email: string; password: string,name:string, username:string }) => {
    const payload ={
      username : username,
      email:email,
      fullName : name,
      password :password
    }

    var response;
    try {
      response = await network_service.post<any>({url:SIGNUP_URL,body:payload});
    }catch (error) {
      const exc= error as NetworkException;
      console.log(exc)
      console.log(exc.message);
      console.log(exc.status);
    }


    const token = response?.data['token'];
      if (!token) {
        throw new Error('Token not found in response');
      }

    localStorage.setItem('token', token);

    // Decode JWT
    const decodedToken = jwtDecode<DecodedToken>(token);
    
    return {
      id: decodedToken.id,
      email:decodedToken.email,
      displayName: decodedToken.username,
      fullName: name,
      avatarUrl: `https://robohash.org/${decodedToken.username}?set=set3`,
      role:decodedToken.role
    } as User;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to login';
        // state.error = action.payload || 'Failed to login';
      })
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to sign up';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;