import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedRepo:null,
  isRepoAvailable: false,
  selectedBranch: null,
};


const repoSlice = createSlice({
  name: 'repo',
  initialState,
  reducers: {
    setRepo(state, action) {
      state.selectedRepo = action.payload;
    },
    clearRepo(state) {
      state.selectedRepo = null;
    },
    setIsRepoAvailable(state, action) {
      state.isRepoAvailable = action.payload;
    },
    setSelectedBranch(state, action) {
      state.selectedBranch = action.payload;
    }
  },
});


export const { setRepo, clearRepo, setIsRepoAvailable, setSelectedBranch } = repoSlice.actions;
export default repoSlice.reducer;