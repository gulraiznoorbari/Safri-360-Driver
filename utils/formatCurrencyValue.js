export const formatCurrencyWithCommas = (amount) => {
        const formattedAmount = amount && amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return formattedAmount;
    };