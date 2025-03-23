@echo off
echo Starting Windows-compatible Next.js development server

:: Set development environment
set NODE_ENV=development

:: Clean .next directory if it exists
if exist .next (
  echo Cleaning .next directory...
  rd /s /q .next
)

:: Install dependencies if needed
echo Checking dependencies...
call npm install --if-present

:: Fix potential Windows path issues
echo Running path fix script...
node fix-windows-path.js

:: Start the dev server
echo Starting Next.js development server...
call npx next dev

echo Server stopped
pause 