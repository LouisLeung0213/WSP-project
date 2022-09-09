create table users (
    id serial primary key
    , username varchar(64) not null
    , email varchar(255) not null
    , profilePic varchar(255) 
    , nickname varchar(255)
    , password_hash varchar(255) not null
);

create table muas (
    id serial primary key
    , mua_id integer 
    , foreign key(mua_id) references users(id)
    , profilo varchar(255)
    , score integer
    , introduction text
);

create table offer(
    id serial primary key
    , category_id integer
    , mua_id integer
    , foreign key(category_id) references category(cat_id)
    , foreign key (mua_id) references muas(mua_id)
);

create table category(
    id serial primary key
    , category_name varchar(255)
    , parent_id integer
    , foreign key (parent_id) references category(id)
);


