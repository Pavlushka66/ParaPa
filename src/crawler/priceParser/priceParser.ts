import { Decimal } from "decimal.js";
const bonusesRegex = /\+\s*\d+\s+бонусов/g;
const clearNumberRegex = /[^0-9.]+/g;
const comentRegex = /<!--[^-]*-->/g;

export function clearPrice(price: string): Decimal {
    let clear = price.replace(",", ".");
    clear = clear.replace(bonusesRegex, "");
    clear = clear.replace(comentRegex, "");
    clear = clear.replace("м2", "");
    clear = clear.replace("м3", "");
    clear = clear.replace(clearNumberRegex, "");
    return new Decimal(clear);
}