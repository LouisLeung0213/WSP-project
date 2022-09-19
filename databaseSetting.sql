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