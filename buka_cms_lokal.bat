@echo off
title Toskaa Studio - Local CMS Admin
color 0b
set "PATH=C:\Users\indra.permana\.gemini\antigravity\bin\nodejs;C:\Users\indra.permana\AppData\Local\Programs\Git\cmd;%PATH%"
cd /d "%~dp0"
echo Menjalankan Toskaa Local CMS di http://localhost:4321 ...
start "" "http://localhost:4321"
node.exe cms-server.mjs
pause
