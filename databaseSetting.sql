create database "mua";
create role "mua" with password 'mua' superuser;
alter role "mua" with login;

create table users (
    id serial primary key
    , username varchar(64) not null
    , email varchar(255) not null
    , profilePic varchar(255) 
    , nickname varchar(255)
    , password_hash varchar(255) not null
);

create table muas (
    muas_id integer unique
    , foreign key(muas_id) references users(id)
    , icon varchar(255)
    , avg_score integer
    , introduction text
);

create table categories (
    id serial primary key
    , categories_name varchar(255)
    , parent_id integer
    , foreign key (parent_id) references categories(id)
);

create table offers (
    id serial primary key
    , categories_id integer
    , muas_id integer
    , foreign key(categories_id) references categories(id)
    , foreign key (muas_id) references muas(muas_id)
);


create table ratings (
    id serial primary key
    , users_id integer not null
    , foreign key (users_id) references users(id)
    , muas_id integer not null
    , foreign key (muas_id) references muas(muas_id)
    , score integer not null
);

create table profiles (
    id serial primary key
    , muas_id integer not null
    , foreign key (muas_id) references muas(muas_id)
    , profile_photo varchar(255) not null
);

create table date_matches (
    id serial primary key
    , muas_id integer not null
    , foreign key (muas_id) references muas(muas_id)
    , unavailable_date date
);


insert into categories (categories_name) values ('time');
insert into categories (categories_name,parent_id) values ('no_preference','1');
insert into categories (categories_name,parent_id) values ('morning','1');
insert into categories (categories_name,parent_id) values ('afternoon','1');
insert into categories (categories_name,parent_id) values ('night','1');
insert into categories (categories_name,parent_id) values ('all_day','1');
insert into categories (categories_name) values ('style');
insert into categories (categories_name,parent_id) values ('western','7');
insert into categories (categories_name,parent_id) values ('chinese','7');
insert into categories (categories_name,parent_id) values ('taiwanese','7');
insert into categories (categories_name,parent_id) values ('japanese','7');
insert into categories (categories_name,parent_id) values ('korean','7');
insert into categories (categories_name) values ('service');
insert into categories (categories_name,parent_id) values ('wedding','13');
insert into categories (categories_name,parent_id) values ('advertisement','13');
insert into categories (categories_name,parent_id) values ('performance','13');
insert into categories (categories_name,parent_id) values ('casual','13');
insert into categories (categories_name,parent_id) values ('one_head','14');
insert into categories (categories_name,parent_id) values ('two_head','14');
insert into categories (categories_name,parent_id) values ('outdoor','14');
insert into categories (categories_name,parent_id) values ('registration','14');
insert into categories (categories_name,parent_id) values ('photo','15');
insert into categories (categories_name,parent_id) values ('film','15');
insert into categories (categories_name,parent_id) values ('drama','16');
insert into categories (categories_name,parent_id) values ('stunt','16');
insert into categories (categories_name,parent_id) values ('party','17');
insert into categories (categories_name,parent_id) values ('dating','17');
insert into categories (categories_name,parent_id) values ('fashionable','17');
insert into categories (categories_name) values ('in_out_door');
insert into categories (categories_name,parent_id) values ('no_preference','29');
insert into categories (categories_name,parent_id) values ('indoor','29');
insert into categories (categories_name,parent_id) values ('outdoor','29');
insert into categories (categories_name) values ('location');
insert into categories (categories_name,parent_id) values ('no_preference','33');
insert into categories (categories_name,parent_id) values ('hk_island','33');
insert into categories (categories_name,parent_id) values ('kowloon','33');
insert into categories (categories_name,parent_id) values ('new_ter','33');


``````````````````````````````````````````````````````````````````````````````````````````````````
create table profilo(
    id serial primary key
    ,muas_id integer not null
    , foreign key (muas_id) references muas(muas_id)
    ,mua_profilo varchar(255) not null
)

