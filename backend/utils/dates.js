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

// Chỉ số tháng tuyệt đối để so sánh (yyyy*12 + (mm-1)).
exports.monthIndex = (month) => {
    const [mm, yyyy] = String(month).split("/").map(Number);
    if (!mm || !yyyy) return NaN;
    return yyyy * 12 + (mm - 1);
};

// true nếu `month` nằm SAU `ref` (mặc định là tháng hiện tại).
exports.isFutureMonth = (month, ref) => {
    const refIdx = ref !== undefined ? exports.monthIndex(ref) : exports.monthIndex(exports.monthStr(new Date()));
    const mIdx = exports.monthIndex(month);
    if (Number.isNaN(refIdx) || Number.isNaN(mIdx)) return false;
    return mIdx > refIdx;
};

