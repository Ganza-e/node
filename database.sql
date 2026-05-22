create database StudentManagement;

use StudentManagement;

CREATE TABLE users(
id int auto_increment primary key,
name varchar(100),
age int(10),
email varchar(100),
salary decimal(10,2),
isActive boolean,
password varchar(255)
);


