@echo off
echo Running Git Push... > deploy_log.txt
git push origin HEAD >> deploy_log.txt 2>&1
echo. >> deploy_log.txt
echo Running Firebase Deploy... >> deploy_log.txt
firebase deploy >> deploy_log.txt 2>&1
echo Done. >> deploy_log.txt
