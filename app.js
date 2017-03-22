'use strict';

/**
*******Task*******
Write a program that excepts a single parameter,
an array of integers from 0 to 30. Those numbers are days in a month.
Find a best possible monthly fare (a combination of weekly and daily passes or montly pass) if:
daily pass: 2 dollars;
weekly pass: 7 dollars (it's really a 7-day pass; it can start on any day,
and it's valid for 7 consequtive days from the day of purchase);
monthly pass: 25 dollars.

subtask for me:
write the program without using for loops. use recursive algorithms instead
**/

const config = {
  msg: {
    passCombo: "Your combo is",
    noWeeks: "No weeks worth mentioning. You'll be better off with getting only daily passes",
    oneWeekOnly: "Your combo is 1 weekly pass, everything else you do daily",
    monthlyOption: "Oh boy, you take a bus too often. You need to go for a monthly pass",
    illegalData: "Data must be an array which may include any positive integers from 0 to 30. Numbers can't be repeated"
  },
  passPrice: {
    daily: 2,
    weekly: 7,
    monthly: 25
  },
  sortDirection: {
    highToLow: 'highToLow',
    lowToHigh: 'lowToHigh'
  }
};

function hasRepeatingNumbers(days, index, originalDays, repeatingDays) {
  const currentDay = days[index];

  if (!currentDay) {
    return !!repeatingDays.length;
  } else {
    if (originalDays.indexOf(currentDay) === -1) {
      originalDays.push(currentDay);
    } else {
      repeatingDays.push(currentDay);
    }
    return hasRepeatingNumbers(days, index + 1, originalDays, repeatingDays);
  }
}

function isDataValid(days) {
  const isNotEmptyArray = typeof days === "object" && days.length;
  const isRepeatingNumber = hasRepeatingNumbers(days, 0, [], []);

  if (isNotEmptyArray && !isRepeatingNumber) {
    const illegalValues = days.filter(day => 
      typeof day !== 'number' ||
      typeof day === 'number' && day < 0 ||
      typeof day === 'number' && day > 30);

    return !illegalValues.length;
  } else {
    return false;
  }
}

// number of days in a week to make it worth purchasing a weekly pass instead of daily passes
const minEfficientWeek = getMinEfficientWeek(config.passPrice.daily, config.passPrice.weekly, [], 0);

function getMinEfficientWeek (dayPass, weekPass, daysStore, daysSum) {
  if (daysSum > weekPass) {
    return daysStore.length;
  } else {
    daysStore.push(dayPass);

    return getMinEfficientWeek(dayPass, weekPass, daysStore, daysSum + dayPass);
  }
};

// create all the possible combinations of weeks from intended days of commuting
function createWeeks(days) {
  let possibleWeeks = [];

  days.map(day => possibleWeeks.push(createOnePotentialWeek(day, [])));

  return possibleWeeks;
}

function createOnePotentialWeek(currentDay, week) {
  if (week.length === 7) {
    return week;
  } else {
    week.push(currentDay);

    return createOnePotentialWeek(currentDay + 1, week);
  }
}

// get amount of days of usage of a weekly pass, if we decided to buy it in a particular week
function getOneWeekEfficiency(days, week) {
  return days.filter(day => week.indexOf(day) !== -1);
}

// get amount of days of usage of a weekly pass for all possible weeks
function getWeeksEfficiency(days) {
  const weeks = createWeeks(days);

  return weeks.map(week => getOneWeekEfficiency(days, week));
}

// get all weeks which could make sense to buy a weekly pass for instead of daily passes
function getWeekCandidates(days) {
  return getWeeksEfficiency(days).filter(week => week.length >= minEfficientWeek);
}

// sort all potential weeks from high to low, for we're interested in weeks with most days of usage in them
function rankWeeksCandidates(days) {
  const weeksCandidates = getWeekCandidates(days);

  if (weeksCandidates.length) {
    return sortWeeks(weeksCandidates);
  }
}

function sortWeeks(weeks) {
  return weeks.sort((a,b) => {
    if (a.length === b.length) {
        return a[0] - b[0];
    } else {
      return b.length - a.length;
    }
  });
}

// check if a current day in a week is unique
function isUniqueDay(currentWeekDay, uniqueWeeks) {
  return uniqueWeeks[0].indexOf(currentWeekDay) === -1;
}

function isUniqueDayRecursively(currentWeekDay, uniqueWeeks, index) {
  const isDayNotInUniqueWeeks = uniqueWeeks[index].indexOf(currentWeekDay) === -1;

  if (index === 0) {
    return isDayNotInUniqueWeeks;
  } else {
    return isDayNotInUniqueWeeks && isUniqueDayRecursively(currentWeekDay, uniqueWeeks, index - 1);
  }
}

function getUniqueDaysInWeek(week, uniqueWeeks) {
  const realWeeks = [uniqueWeeks[0]];

  return week.filter(day => isUniqueDay(day, uniqueWeeks));
}

function getUniqueDaysInWeekRecursively(week, uniqueWeeks) {
  return week.filter(day => isUniqueDayRecursively(day, uniqueWeeks, uniqueWeeks.length - 1));
}

function getWorthyUniqueWeeksSet(weeks, uniqueWeeks) {
  weeks.map(week => {
    const filteredWeek = getUniqueDaysInWeek(week, uniqueWeeks);

    if (filteredWeek.length >= minEfficientWeek) {
      uniqueWeeks.push(filteredWeek);
    }
  });

  sortWeeks(uniqueWeeks);

  const recursivelyFilteredWeeks = getWorthyUniqueWeeksSetRecursively(uniqueWeeks, [uniqueWeeks[0]]);

  return recursivelyFilteredWeeks;
}

function getWorthyUniqueWeeksSetRecursively(weeks, uniqueWeeks) {
  weeks.map(week => {
    const recursivelyFilteredWeek = getUniqueDaysInWeekRecursively(week, uniqueWeeks);

    if (recursivelyFilteredWeek.length >= minEfficientWeek) {
      uniqueWeeks.push(recursivelyFilteredWeek);
    }
  });

  return uniqueWeeks;
}

function getAllUniqueWeeksSets(weeks, uniqueWeeks, index) {
  if (!weeks[index]) {
    return uniqueWeeks;
  } else {
    uniqueWeeks.push(getWorthyUniqueWeeksSet(weeks, [weeks[index]]));

    return getAllUniqueWeeksSets(weeks, uniqueWeeks, index + 1);
  }
}

function getAmountOfDaysInBuyingWeeks(weeks) {
  return weeks
    .map(week => week.length)
    .reduce((total, daysInWeek) => total + daysInWeek, 0);
}

function getBestFare(days) {
  const dayPrice = config.passPrice.daily;
  const weekPrice = config.passPrice.weekly;
  const monthPrice = config.passPrice.monthly;
  const rankedWeeks = rankWeeksCandidates(days);
  const allWeeksOptions = getAllUniqueWeeksSets(rankedWeeks, [], 0);
  const fareOptions = [];

  allWeeksOptions.map(weeksSet => {
    const daysInWeeksSet = getAmountOfDaysInBuyingWeeks(weeksSet);
    const totalPrice = (weeksSet.length * weekPrice) + ((days.length - daysInWeeksSet) * dayPrice);

    fareOptions.push(totalPrice);
  });
  console.log(fareOptions);
  const bestTotalPrice = Math.min(...fareOptions);
  const bestOptionIndex = fareOptions.indexOf(bestTotalPrice);
  const bestWeeksSet = allWeeksOptions[bestOptionIndex];
  const bestCombo = `${bestWeeksSet.length} weekly and ${days.length - getAmountOfDaysInBuyingWeeks(bestWeeksSet)} daily: ${bestTotalPrice} dollars`;

  return bestCombo;
}

/**
***** Unit tests ******
**/
const intendedDays1 = [0,1,4,6,8,9,11,12]; // configurable; intended days of commuting in a particular month
const intendedDays2 = [1,2,5,7,8,22,24,27,28,29,30];
const intendedDays3 = [1,3,5,7,8,9,11,13,14,15,17,19,21,23,25];
const intendedDays4 = [1,3,5,7,17,18,19,22,23,24,27,28,29,30];
const intendedDays5 = [19,21,22,23,25,26,27,28,29,30];
const intendedDays6 = [1,3,4,5,6,7,8,9,10,12,13];

const bestFare1 = getBestFare(intendedDays1);
const bestFare2 = getBestFare(intendedDays2);
const bestFare3 = getBestFare(intendedDays3);
const bestFare4 = getBestFare(intendedDays4);
const bestFare5 = getBestFare(intendedDays5);
const bestFare6 = getBestFare(intendedDays6);

console.log(`should be equal to "1 weekly and 3 daily":
${bestFare1}`);
console.log(`should be equal to "2 weekly and 2 daily":
${bestFare2}`);
console.log(`should be equal to "3 weekly and 1 daily":
${bestFare3}`);
console.log(`should be equal to "3 weekly and 0 daily":
${bestFare4}`);
console.log(`should be equal to "2 weekly and 0 daily":
${bestFare5}`);
console.log(`should be equal to "2 weekly and 0 daily":
${bestFare6}`);
