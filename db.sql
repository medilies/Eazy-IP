create table visitors(
	address varchar(35),
	timestamp timestamp default now() primary key
)

create table messages(
	name varchar(100),
	email varchar(100),
	msg varchar(1000),
	timestamp timestamp default now() primary key
)