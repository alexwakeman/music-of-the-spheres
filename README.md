# Usage

`npm install`

`gulp build`

`node server/index.js`

Uses Spotify OAuth to access their API. You will need to get an API client ID and secret to perform oAuth,
and update the example-config.json, and `server/oauth.js` file to reflect this.


TODO:
- [DONE] Stats for visualizing relationships - Popularity, genre share
- [DONE] Save state to session storage
- [DONE] Clear session storage (start over) button
- Refresh API token automatically
- [DONE] Improve login screen
- [DONE] Improve styling of main app, genre tags
- [DONE] Right-click menu?
- [DONE] Drag click over sphere should not activate related
- [DONE] Hover cursor over related turns to pointer, show grab / grabbed cursor
- [DONE] Clear DOM when clicking related
- Loading spinner when waiting
- [DONE] Show related artist info
- [DONE] Get genre similarity statistic
- [DONE] Allow clicking of text, make hover over text highlight sphere
- [DONE] Align text with camera by placing it adjacent to sphere face segment whose normal is closest to the camera
- [DONE] If popularity is over 50, accentuate sphere size, if less, diminish size by scalar factor
- [DONE] Scroll visited artists to bottom
- [DONE] Factor out Spotify API keys into JSON, include example version in git repo
- [DONE] Cursor over text on panels should be pointer
- [DONE] Optimise the hover check so it does not need to iterate over all related spheres
- Fix back and forwards browser navigation

# Next phase:
- Connect all related artist that are clicked, avoid repeats, allow navigating around
the "solar system"
- Keyboard controls navigation around
- Currently the camera rotates, switch to rotating the objects instead
- Allow genre navigating as well as artist (click genres)
