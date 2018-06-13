#!/bin/bash
cd /volume

tmux new-session -s dev 'npm run dev || /bin/bash'

/bin/bash
