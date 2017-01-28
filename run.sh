#!/bin/bash
cd /volume

# Pack vendor code into a DLL for massive build speedup
echo "Building vendor DLLs..."
webpack --config=webpack.dll.js

tmux new-session -s dev 'npm run dev || /bin/bash'