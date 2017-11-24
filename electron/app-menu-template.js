const { app, shell } = require('electron');

const appMenuTemplate = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      },
      {
          label: 'find',
          accelerator: 'CmdOrCtrl+F',
          click (item, focusedWindow) {
              if (focusedWindow) focusedWindow.webContents.send('global-search');
          }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'GitHub Repository',
        click () { shell.openExternal('https://github.com/wodewone/keepForMac'); }
      },
      {
        label: 'Visit Blog',
        click () { shell.openExternal('http://wodewone.github.io'); }
      },
      {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://electron.atom.io') }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  appMenuTemplate.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences',
        accelerator: process.platform === 'darwin' ? 'Command+,' : 'Ctrl+,',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('toggle-settings');
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  });

  // Window menu.
  appMenuTemplate[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ];
}

module.exports = appMenuTemplate;
