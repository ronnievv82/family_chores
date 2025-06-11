#!/bin/bash

# Navigate to backend directory and start backend server
cd backend
nohup npm start > backend.log 2>&1 &

# Navigate back to root and start frontend server
cd ..
nohup npm run dev > frontend.log 2>&1 &

echo "Backend and frontend servers started."
