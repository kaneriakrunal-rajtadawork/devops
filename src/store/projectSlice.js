import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name:null,
  projectId: null,
  description: null,
  id: null,
};


const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProject(state, action) {
      state.name = action.payload.name;
      state.projectId = action.payload.projectId;
      state.description = action.payload.description;
      state.id = action.payload.id;
    },
    clearProject(state) {
      state.name = null;
      state.projectId = null;
      state.description = null;
      state.id = null;
    },
  },
});


export const { setProject, clearProject } = projectSlice.actions;
export default projectSlice.reducer;