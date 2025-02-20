export interface Holiday {
  date: string;
  name: string;
}

export const getPortugueseHolidays = (
  year: number = new Date().getFullYear()
): Holiday[] => {
  return [
    { date: `${year}-01-01`, name: "New Year's Day" },
    { date: `${year}-04-18`, name: "Good Friday" },
    { date: `${year}-04-20`, name: "Easter Sunday" },
    { date: `${year}-04-25`, name: "Liberation Day" },
    { date: `${year}-05-01`, name: "Labour Day" },
    { date: `${year}-06-10`, name: "National Day" },
    { date: `${year}-06-19`, name: "Corpus Christi" },
    { date: `${year}-08-15`, name: "Assumption Day" },
    { date: `${year}-10-05`, name: "Republic Day" },
    { date: `${year}-11-01`, name: "All Saints' Day" },
    { date: `${year}-12-01`, name: "Independence Restoration Day" },
    { date: `${year}-12-08`, name: "Immaculate Conception" },
    { date: `${year}-12-25`, name: "Christmas Day" },
  ];
};
