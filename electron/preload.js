const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStudents: () => ipcRenderer.invoke('get-students'),
  saveStudent: (student) => ipcRenderer.invoke('save-student', student),
  deleteStudent: (id) => ipcRenderer.invoke('delete-student', id),
  checkExpiring: () => ipcRenderer.invoke('check-expiring'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  selectBackgroundImage: () => ipcRenderer.invoke('select-background-image'),
  getBackgroundImageData: () => ipcRenderer.invoke('get-background-image-data'),
  setBackgroundImage: (imagePath) => ipcRenderer.invoke('set-background-image', imagePath),
  resetBackground: () => ipcRenderer.invoke('reset-background'),
  selectProfileAvatar: () => ipcRenderer.invoke('select-profile-avatar'),
  getProfileAvatarData: () => ipcRenderer.invoke('get-profile-avatar-data'),
  resetProfileAvatar: () => ipcRenderer.invoke('reset-profile-avatar'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
});

