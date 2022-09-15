const date = new Date();
let selectedDates = [];


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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  document.querySelector(".date h1").textContent =
    months[date.getMonth()] + ", " + date.getFullYear();

  document.querySelector(".date p").innerHTML = new Date().toDateString();

  let days = "";

  for (let x = firstDayIndex; x > 0; x--) {
    days += `<div class="prev-date unselectable" id="${date.getFullYear()}-${
      date.getMonth() + 1
    }-${prevLastDay - x + 1}">${prevLastDay - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDay; i++) {
    if (
      i === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear()
    ) {
      days += `<div class="today" id="${date.getFullYear()}-${
        date.getMonth() + 1
      }-${i}">${i}</div>`;
    } else {
      days += `<div id="${date.getFullYear()}-${
        date.getMonth() + 1
      }-${i}">${i}</div>`;
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="next-date unselectable" id="${date.getFullYear()}-${
      date.getMonth() + 1
    }-${j}">${j}</div>`;
  }
  monthDays.innerHTML = days;
};

document.querySelector(".prev").addEventListener("click", () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
  selectDate();
});

document.querySelector(".next").addEventListener("click", () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
  selectDate();
});

document.querySelector(".date p").addEventListener("click", () => {
  date.setMonth(new Date().getMonth());
  date.setFullYear(new Date().getFullYear());
  renderCalendar();
  selectDate();
});

renderCalendar();

// Select date

function selectDate() {
  let days = document.querySelectorAll(".days div");
  // console.log(days);

  for (let date of days) {
    if (selectedDates.filter((word) => word == date.id).length > 0) {
      date.classList.add("selected");
    } else {
      date.classList.remove("selected");
    }
    date.addEventListener("click", () => {
      // console.log(date.id);
      if (
        !date.classList.contains("unselectable") &&
        !date.classList.contains("selected")
      ) {
        selectedDates.push(`unavailable_date = '${date.id}'`);
        date.classList.add("selected")
        // console.log(selectedDates);
      } else if (date.classList.contains("selected")) {
        selectedDates = selectedDates.filter((word) => word !== `unavailable_date = '${date.id}'`);
        date.classList.remove("selected")
        // console.log(selectedDates);
      }
    });
  }
}
selectDate();


