type users = {
  id: number;
  email: string; //not null
  profilePic: string; //not null with default
  nickname: string; // not null
  username: string; //not null
  password_hash: string; //not null
};

type muas = {
  id: number; //pk and fk users.id
  description: string;
  offer: offer_type;
};

type offer_type = {
  id: number;
  time: time_type;
  style: style_type;
  service: service_type;
};

type time_type = {
  no_preference: Boolean;
  morning: Boolean;
  afternoon: Boolean;
  night: Boolean;
  all_day: Boolean;
};

type style_type = {
  western: Boolean;
  chinese: Boolean;
  taiwanese: Boolean;
  japanese: Boolean;
  korean: Boolean;
};

type service_type = {
  wedding: wedding_type;
};

type wedding_type = {
  id: number;
  one_make_up: Boolean;
  two_make_up: Boolean;
  go_out: Boolean;
};
