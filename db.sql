create table visitors(
	addr varchar(35),
	t timestamp default now() primary key
)

create table messages(
	name varchar(100),
	email varchar(100),
	msg varchar(1000),
	t timestamp default now() primary key,
	category varchar(100) default 'undef'
)