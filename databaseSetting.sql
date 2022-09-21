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
    , isAdmin boolean default false
);

create table muas (
    muas_id integer unique
    , foreign key(muas_id) references users(id)
    , total_score integer
    , avg_score integer
    , introduction text
    , join_date date
    , is_new boolean
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

create table reported (
    id serial primary key
    , muas_id integer not null
    , muas_description varchar(255)
    , muas_image varchar(255) not null 
    , users_id integer not null
    ,reason text 
);

create table deleted_portfolio(
  id serial primary key
  , muas_id integer not null
  , muas_description varchar(255)
  , muas_image varchar(255) not null;
);

create table ban(
  id serial primary key
  , muas_id integer not null
  , muas_nickname varchar(255) not null
  , muas_icon varchar(255)
);

insert into categories (categories_name) values ('時間');
insert into categories (categories_name,parent_id) values ('沒有偏好','1');
insert into categories (categories_name,parent_id) values ('早上','1');
insert into categories (categories_name,parent_id) values ('下午','1');
insert into categories (categories_name,parent_id) values ('晚上','1');
insert into categories (categories_name,parent_id) values ('全日','1');
insert into categories (categories_name) values ('風格');
insert into categories (categories_name,parent_id) values ('西式','7');
insert into categories (categories_name,parent_id) values ('中式','7');
insert into categories (categories_name,parent_id) values ('台式','7');
insert into categories (categories_name,parent_id) values ('日式','7');
insert into categories (categories_name,parent_id) values ('韓式','7');
insert into categories (categories_name) values ('服務');
insert into categories (categories_name,parent_id) values ('婚禮','13');
insert into categories (categories_name,parent_id) values ('廣告','13');
insert into categories (categories_name,parent_id) values ('表演','13');
insert into categories (categories_name,parent_id) values ('日常','13');
insert into categories (categories_name,parent_id) values ('一妝一頭','14');
insert into categories (categories_name,parent_id) values ('兩妝兩頭','14');
insert into categories (categories_name,parent_id) values ('戶外','14');
insert into categories (categories_name,parent_id) values ('註冊','14');
insert into categories (categories_name,parent_id) values ('相片','15');
insert into categories (categories_name,parent_id) values ('影片','15');
insert into categories (categories_name,parent_id) values ('舞台劇','16');
insert into categories (categories_name,parent_id) values ('特技化妝','16');
insert into categories (categories_name,parent_id) values ('派對','17');
insert into categories (categories_name,parent_id) values ('約會','17');
insert into categories (categories_name,parent_id) values ('時尚化妝','17');
insert into categories (categories_name) values ('戶外室內');
insert into categories (categories_name,parent_id) values ('沒有偏好','29');
insert into categories (categories_name,parent_id) values ('戶外','29');
insert into categories (categories_name,parent_id) values ('室內','29');
insert into categories (categories_name) values ('地點');
insert into categories (categories_name,parent_id) values ('沒有偏好','33');
insert into categories (categories_name,parent_id) values ('香港島','33');
insert into categories (categories_name,parent_id) values ('九龍','33');
insert into categories (categories_name,parent_id) values ('新界','33');


``````````````````````````````````````````````````````````````````````````````````````````````````
create table portfolio(
    id serial primary key
    ,muas_id integer not null
    , foreign key (muas_id) references muas(muas_id)
    ,mua_portfolio varchar(255) not null
    ,mua_description varchar(255)
)

``````````````````````````````````````````````````````````````````````````````````````````````````
insert into users (username, email, password_hash) values ('Peter', '111', '111'), ('John', '222', '222');
insert into muas (muas_id) values (2), (3);


insert into offers (categories_id, muas_id) values (3, 2),(5, 3);

SELECT username, users.id, users.nickname, muas.icon, muas.avg_score, json_agg(mua_portfolio) as mua_portfolio
  from muas join users on muas_id = users.id 
    left join portfolio on portfolio.muas_id= users.id group by users.id, muas.icon, muas.avg_score;

    
-- SELECT username, users.id from muas join users on muas.muas_id = users.id join offers on muas.muas_id = offers.muas_id;
--------
alter table portfolio add column mua_description varchar(255);

DELETE FROM offers WHERE muas_id = ${sessionId};
DELETE FROM date_matches WHERE muas_id = ${sessionId};


DELETE FROM offers WHERE muas_id = ${sessionId} and categories_id != any(array${tags.cats}::integer[]);


----------------set profilepic to unique for muas_icon to fk it-----------------
-- alter table users add constraint unique_profilepic unique(profilepic);

-- alter table muas add foreign key(icon) references users(profilepic);

----drop muas icon----
alter table muas drop column icon;


select  username, users.id, users.nickname, users.profilepic, muas.avg_score, json_agg(mua_portfolio) as mua_portfolio 
from offers
  left join portfolio on portfolio.muas_id =  offers.muas_id
  left join muas on offers.muas_id = muas.muas_id
  left join users on muas.muas_id = users.id  
  left join date_matches on date_matches.muas_id = users.id
  where (categories_id = 2
   ) group by username, users.id, users.nickname, users.profilepic, muas.avg_score
  order by users.id ;

alter table muas add column total_score integer;
alter table muas add column join_date date;
alter table muas add column is_new boolean;
alter table muas add column comment_qty integer;

update muas set is_new = true where muas_id = 6;
-----------------------------------------------------------------------------beeno version
  with
  blacklist as (
  select
    distinct date_matches.muas_id
  from date_matches
  where date_matches.unavailable_date = any(:dates)
)
, whitelist as (
  select
    distinct offers.muas_id
  from offers
  where offers.categories_id = all(:cat_ids)
)

select
  muas.id as mua_id
, muas.avg_score
, users.profilepic
, users.nickname
, array_agg(portfolio.mua_portfolio)
from muas
inner join users on users.id = muas.users_id
inner join portfolio on portfolio.id = muas.portfolio_id
where muas.muas_id in (select muas_id from whitelist)
  and muas.muas_id not in (select muas_id from blacklist)




   select
    distinct offers.muas_id
  from offers
  where offers.categories_id = 2

  select
    distinct date_matches.muas_id
  from date_matches
  where date_matches.unavailable_date = '2022/09/04'

  select
  muas.muas_id as mua_id
, muas.avg_score
, users.profilepic
, users.nickname

from muas
inner join users on users.id = muas.muas_id


group by muas.muas_id, users.id
, array_agg(portfolio.mua_portfolio)
inner join portfolio on portfolio.id = muas.muas_id


 with
  blacklist as (
  select
    distinct date_matches.muas_id
  from date_matches
  where date_matches.unavailable_date ='2022/09/02'
)
, whitelist as (
  select
    distinct offers.muas_id
  from offers
  where offers.categories_id =  34
)

select
  muas.muas_id as mua_id
, muas.avg_score
, users.profilepic
, users.nickname
, array_agg(portfolio.mua_portfolio) as mua_portfolio
from muas
inner join users on users.id = muas.muas_id
left join portfolio on portfolio.muas_id = muas.muas_id
where muas.muas_id in (select muas_id from whitelist)
  and muas.muas_id not in (select muas_id from blacklist) 
group by muas.muas_id, users.id;


alter table muas add column comment_qty integer;
alter table muas add column comment_qty_enough boolean;
alter table users add column isAdmin boolean default false;
alter table reported add column users_id integer not null;
alter table reported add column reason text;