export const humanPhoneNumber = (number) => {
    if (!number) return;
    try {
        const reExp = new RegExp(/(\d*)(\d{3})(\d{3})(\d{4})/g);
        const [__, ext, areaCode, fn, ln] = reExp.exec(number);
        return `+${ext} ${areaCode} ${fn} ${ln}`;
    } catch {
        return number;
    }
};
