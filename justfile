
start-build:
  npm run start:dev

start-build-prod:
  npm run start

run-docker:
  docker exec -it chat_app_database mysql -u root -p;

#if you want to create a new database:
#CREATE DATABASE IF NOT EXISTS chat_app_database;
#SHOW DATABASES;

