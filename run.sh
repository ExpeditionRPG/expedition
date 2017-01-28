#!/bin/bash
cd /volume

# Pack vendor code into a DLL for massive build speedup
echo "Building vendor DLLs..."
webpack --config=webpack.dll.js

tmux new-session -s dev 'npm run dev'

echo "tmux session ended. If this is the first time you're running, please run \"npm install\" to install node packages."

/bin/bash