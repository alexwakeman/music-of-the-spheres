# Usage

`npm install`

`gulp build`

`node server/index.js`

Uses Spotify OAuth to access their API



TODO:
- [DONE] Stats for visualizing relationships - Popularity, genre share 
- Save state to session storage / clear session storage (start over)
- Refresh API token automatically
- Improve login screen
- Improve styling of main app, genre tags
- Right-click menu? 
- Hover mouse turns to hand, show draggable cursor
- Clear DOM when clicking related
- Loading spinner when waiting
- Show related artist info
- Allow clicking of text, make hover over text highlight sphere
- Align text with camera by placing it adjacent to sphere face segment whose normal
is closest to the camera

# Next phase:
- Connect all related artist that are clicked, avoid repeats, allow navigating around
the "solar system"
- Keyboard controls navigation around
- Currently the camera rotates, switch to rotating the objects instead
- Allow genre navigating as well as artist
