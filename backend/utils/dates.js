exports.monthStr = (date) => {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${mm}/${date.getFullYear()}`;
};
