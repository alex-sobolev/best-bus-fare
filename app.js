'use strict';

/**
*******Task*******
Write a program that excepts a single parameter,
an array of integers from 0 to 30. Those numbers are days in a month.
Find a best possible monthly fare if:
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
    highToLow: 'topToBottom',
    lowToHigh: 'bottomToTop'
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
function createWeeks(days, possibleWeeks, singlePossibleWeek, dayForWeekStart, currentDay) {
  if (days[dayForWeekStart] !== 0 && !days[dayForWeekStart]) {
    return possibleWeeks;
  } else {
    if (singlePossibleWeek.length === 7) {
      possibleWeeks.push(singlePossibleWeek);

      createWeeks(days, possibleWeeks, [], dayForWeekStart + 1, days[dayForWeekStart + 1]);
    } else {
      singlePossibleWeek.push(currentDay);

      createWeeks(days, possibleWeeks, singlePossibleWeek, dayForWeekStart, currentDay + 1);
    }
  }
  return possibleWeeks;
}

// get amount of days of usage of a weekly pass, if we decided to buy it in a particular week
function getOneWeekEfficiency(days, week) {
  return days.filter(day => week.indexOf(day) !== -1);
}

// get amount of days of usage of a weekly pass for all possible weeks
function getWeeksEfficiency(days) {
  const weeks = createWeeks(days, [], [], 0, days[0]);

  return weeks.map(week => getOneWeekEfficiency(days, week));
}

// get all weeks which could make sense to buy a weekly pass for instead of daily passes
function weeksCandidates(days) {
  return getWeeksEfficiency(days).filter(week => week.length >= minEfficientWeek);
}

// sort all potential weeks from high to low, for we're interested in weeks with most days of usage in them
function rankWeeksCandidates(days, direction) {

  if (weeksCandidates(days).length) {
    return weeksCandidates(days).sort((a,b) => {
      if (a.length === b.length) {
        if (direction === config.sortDirection.lowToHigh) {
          return a[0] - b[0];
        } else {
          return b[0] - a[0];
        }
      } else {
        return b.length - a.length;
      }
    });
  }
}

// make sure sorted weeks candidates for weekly passes have only original days in them.
// Compare from top to bottom since we're interested in keeping the weeks with most days in them.
// And we can sacrifice the weeks with fewer days in them to save the weeks with most days when needed.

function getOriginalDaysInWeek(currentWeekDay, originalWeeks, index) {
  const isDayNotInOriginalWeeks = originalWeeks[index].indexOf(currentWeekDay) === -1;

  if (index === 0) {
    return isDayNotInOriginalWeeks;
  }

  return isDayNotInOriginalWeeks && getOriginalDaysInWeek(currentWeekDay, originalWeeks, index - 1);
}

function getOriginalWeekFullCapacity(firstWeekDay, potentialWeek) {
  if (potentialWeek.length === 7) {
    return potentialWeek;
  } else {
    potentialWeek.push(firstWeekDay);

    return getOriginalWeekFullCapacity(firstWeekDay + 1, potentialWeek);
  }
}

function maximizeWeekUsage(currentWeek, previousWeek, previousWeekPotential) {
  const isWeekWorthSacrifice = previousWeek.length >= currentWeek.length;

  currentWeek.map(day => {
    if (isWeekWorthSacrifice && previousWeek.indexOf(day) === -1 && previousWeekPotential.indexOf(day) > -1) {
      previousWeek.push(day);
      currentWeek.splice(currentWeek.indexOf(day), 1);
    }
  });
}

function getWeeksWinners(days, weeksCandidates) {
  const dayPrice = config.passPrice.daily;
  const weekPrice = config.passPrice.weekly;
  let result;

  if (!weeksCandidates) {
    result = `${config.msg.noWeeks} : ${days.length * dayPrice} dollars`;
  } else if (weeksCandidates && weeksCandidates.length === 1) {
    result = `${config.msg.oneWeekOnly} : ${(days.length - weeksCandidates[0].length) * dayPrice + weekPrice} dollars`;
  } else {
    weeksCandidates.reduce((originalWeeks,currentWeek) => {
      if (!originalWeeks.length) {
        originalWeeks.push(currentWeek);
      } else {
        const originalDaysInWeek = currentWeek.filter(currentWeekDay => getOriginalDaysInWeek(currentWeekDay, originalWeeks, originalWeeks.length - 1));
        const previousOriginalWeek = originalWeeks[originalWeeks.length - 1];
        const weekPotential = getOriginalWeekFullCapacity(previousOriginalWeek[0], []);

        maximizeWeekUsage(originalDaysInWeek, previousOriginalWeek, weekPotential);

        if (originalDaysInWeek.length >= minEfficientWeek) {
          originalWeeks.push(originalDaysInWeek);
        }
      }

      return result = originalWeeks;
    }, []);
  }

  return result;
}

function getAmountOfDaysInBuyingWeeks(weeks) {
  return weeks
    .map(week => week.length)
    .reduce((a,b) => a + b, 0);
}

function getBestFare(days) {
  const isDataLegal = isDataValid(days);

  if(!isDataLegal) {
    return config.msg.illegalData;
  }

  const weeklyBuys1 = getWeeksWinners(days, rankWeeksCandidates(days, config.sortDirection.lowToHigh));
  const weeklyBuys2 = getWeeksWinners(days, rankWeeksCandidates(days, config.sortDirection.highToLow));
  const dayPrice = config.passPrice.daily;
  const weekPrice = config.passPrice.weekly;
  const monthPrice = config.passPrice.monthly;
  const monthlyOption = config.msg.monthlyOption;
  let finalWeekBuysPrice;
  let finalPrice;

  if (typeof weeklyBuys1 === 'string') {
    finalPrice = weeklyBuys1;
  } else {
    const daysInBuyingWeeks1 = getAmountOfDaysInBuyingWeeks(weeklyBuys1);
    const daysInBuyingWeeks2 = getAmountOfDaysInBuyingWeeks(weeklyBuys2);
    const prelimPrice1 = (days.length - daysInBuyingWeeks1) * dayPrice + weeklyBuys1.length * weekPrice;
    const prelimPrice2 = (days.length - daysInBuyingWeeks2) * dayPrice + weeklyBuys2.length * weekPrice;

    if (prelimPrice1 < prelimPrice2 || prelimPrice1 === prelimPrice2) {
      finalWeekBuysPrice = prelimPrice1;
    } else {
      finalWeekBuysPrice = prelimPrice2;
    }

    let msg;

    if (finalWeekBuysPrice === prelimPrice1) {
      msg = `${config.msg.passCombo} ${weeklyBuys1.length} weekly and ${days.length - daysInBuyingWeeks1} daily`;
    } else {
      msg = `${config.msg.passCombo} ${weeklyBuys2.length} weekly and ${days.length - daysInBuyingWeeks2} daily`;
    }

    finalPrice = finalWeekBuysPrice < monthPrice ? `${msg}: ${finalWeekBuysPrice} dollars` : `${monthlyOption}: ${monthPrice} dollars`;
  }

  return finalPrice;
}

/**
***** Unit tests ******
**/
const intendedDays1 = [0,1,4,6,8,9,11,12]; // configurable; intended days of commuting in a particular month
const intendedDays2 = [1,2,5,7,8,22,24,27,28,29,30];
const intendedDays3 = [1,3,5,7,8,9,11,13,14,15,17,19,21,23,25];
const intendedDays4 = [1,3,5,7,17,18,19,22,23,24,27,28,29,30];
const intendedDays5 = [19,21,22,23,25,26,27,28,29,30];

const bestFare1 = getBestFare(intendedDays1);
const bestFare2 = getBestFare(intendedDays2);
const bestFare3 = getBestFare(intendedDays3);
const bestFare4 = getBestFare(intendedDays4);
const bestFare5 = getBestFare(intendedDays5);

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
