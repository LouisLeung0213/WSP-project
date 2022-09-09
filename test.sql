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
    , mua_id integer unique /* foreign key must refer to unique or primary key */
    , foreign key(mua_id) references users(id)
    , profilo varchar(255)
    , score integer
    , introduction text
    CONSTRAINT mua_id UNIQUE (mua_id)
);

create table offer(
    id serial primary key
    , category_id integer
    , mua_id integer
    , foreign key(category_id) references category(id)
    , foreign key (mua_id) references muas(mua_id)
);

create table category(
    id serial primary key
    , category_name varchar(255)
    , parent_id integer
    , foreign key (parent_id) references category(id)
);

insert into category (category_name) values ('time');
insert into category (category_name,parent_id) values ('no_preference','1');
insert into category (category_name,parent_id) values ('morning','1');
insert into category (category_name,parent_id) values ('afternoon','1');
insert into category (category_name,parent_id) values ('night','1');
insert into category (category_name,parent_id) values ('all_day','1');
insert into category (category_name) values ('style');
insert into category (category_name,parent_id) values ('western','7');
insert into category (category_name,parent_id) values ('chinese','7');
insert into category (category_name,parent_id) values ('taiwanese','7');
insert into category (category_name,parent_id) values ('japanese','7');
insert into category (category_name,parent_id) values ('korean','7');
insert into category (category_name) values ('service');
insert into category (category_name,parent_id) values ('wedding','13');
insert into category (category_name,parent_id) values ('advertisement','13');
insert into category (category_name,parent_id) values ('performance','13');
insert into category (category_name,parent_id) values ('casual','13');
insert into category (category_name,parent_id) values ('one_head','14');
insert into category (category_name,parent_id) values ('two_head','14');
insert into category (category_name,parent_id) values ('outdoor','14');
insert into category (category_name,parent_id) values ('registration','14');
insert into category (category_name,parent_id) values ('photo','15');
insert into category (category_name,parent_id) values ('film','15');
insert into category (category_name,parent_id) values ('drama','16');
insert into category (category_name,parent_id) values ('stunt','16');
insert into category (category_name,parent_id) values ('party','17');
insert into category (category_name,parent_id) values ('dating','17');
insert into category (category_name,parent_id) values ('fashionable','17');
insert into category (category_name) values ('in_out_door');
insert into category (category_name,parent_id) values ('no_preference','29');
insert into category (category_name,parent_id) values ('indoor','29');
insert into category (category_name,parent_id) values ('outdoor','29');
insert into category (category_name) values ('location');
insert into category (category_name,parent_id) values ('no_preference','33');
insert into category (category_name,parent_id) values ('hk_island','33');
insert into category (category_name,parent_id) values ('kowloon','33');
insert into category (category_name,parent_id) values ('new_ter','33');



