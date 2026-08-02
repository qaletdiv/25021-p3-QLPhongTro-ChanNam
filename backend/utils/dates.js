exports.monthStr = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${mm}/${date.getFullYear()}`;
};

exports.nextMonthOf = (month) => {
    const [mm, yyyy] = String(month).split("/").map(Number);
    const m = mm === 12 ? 1 : mm + 1;
    const ny = mm === 12 ? yyyy + 1 : yyyy;
    return `${String(m).padStart(2, "0")}/${ny}`;
};
