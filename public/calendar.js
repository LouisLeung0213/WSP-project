const date = new Date();
let selectedDates = [];
let selectedDatesStr = [];
let selectedDatesMua = [];

let params = new URL(document.location).searchParams;
let paramsName = params.get("id");

const renderCalendar = () => {
  // console.log(date);
  date.setDate(1);

  const monthDays = document.querySelector(".days");

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  const prevLastDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    0
  ).getDate();

  const firstDayIndex = date.getDay();

  const lastDayIndex = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDay();

  const nextDays = 7 - lastDayIndex - 1;

  const months = [
    "1 月",
    "2 月",
    "3 月",
    "4 月",
    "5 月",
    "6 月",
    "7 月",
    "8 月",
    "9 月",
    "10 月",
    "11 月",
    "12 月",
  ];

  document.querySelector(".date h1").textContent =
    date.getFullYear() + " 年" + " " + months[date.getMonth()];

  document.querySelector(".date p").innerHTML =
    "今天: " + new Date().toDateString();

  let days = "";

  function generateDateId(i) {
    let showMonth;
    let showDate;
    if (date.getMonth() + 1 < 10) {
      showMonth = `0${date.getMonth() + 1}`;
    } else {
      showMonth = date.getMonth() + 1;
    }
    if (i < 10) {
      showDate = `0${i}`;
    } else {
      showDate = i;
    }
    let dateId = `${date.getFullYear()}/${showMonth}/${showDate}`;
    return dateId;
  }

  for (let x = firstDayIndex; x > 0; x--) {
    days += `<div class="prev-date" id=${generateDateId(prevLastDay - x + 1)}>${
      prevLastDay - x + 1
    }</div>`;
  }

  for (let i = 1; i <= lastDay; i++) {
    if (
      i === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear()
    ) {
      days += `<div class="today selectable" id=${generateDateId(
        i
      )}>${i}</div>`;
    } else {
      days += `<div class="selectable" id=${generateDateId(i)}>${i}</div>`;
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="next-date" id=${generateDateId(j)}>${j}</div>`;
  }
  monthDays.innerHTML = days;
};

document.querySelector(".prev").addEventListener("click", () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
  selectDate();
  showAvailableDate();
});

document.querySelector(".next").addEventListener("click", () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
  selectDate();
  showAvailableDate();
});

document.querySelector(".date p").addEventListener("click", () => {
  date.setMonth(new Date().getMonth());
  date.setFullYear(new Date().getFullYear());
  renderCalendar();
  selectDate();
  showAvailableDate();
});

renderCalendar();

// Select date

function selectDate() {
  let days = document.querySelectorAll(".days div");
  fetch(`/filter?id=${paramsName}`)
    .then((res) => res.json())
    .then((categories) => {
      for (let date of days) {
        if ((paramsName == null) & date.classList.contains("selectable")) {
          if (selectedDatesStr.filter((word) => word == date.id).length > 0) {
            date.classList.add("selected");
          } else {
            date.classList.remove("selected");
          }
        }

        if (categories.currentUser == paramsName || paramsName == null) {
          if (date.classList.contains("selectable")) {
            date.classList.add("editable");
          }
          date.addEventListener("click", () => {
            if (
              date.classList.contains("selectable") &&
              !date.classList.contains("selected")
            ) {
              selectedDatesStr.push(date.id);
              selectedDates.push(date.id);
              selectedDatesMua = selectedDatesMua.filter(
                (word) => word !== date.id
              );
              date.classList.add("selected");
              // console.log(selectedDates);
            } else if (date.classList.contains("selected")) {
              selectedDatesStr = selectedDatesStr.filter(
                (word) => word !== date.id
              );
              selectedDates = selectedDates.filter((word) => word !== date.id);
              selectedDatesMua.push(date.id);
              date.classList.remove("selected");
            }
          });
        }
      }
    });
}

selectDate();
