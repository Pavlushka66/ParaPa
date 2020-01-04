import { Decimal } from "decimal.js";
const bonusesRegex = /\+\s*\d+\s+бонусов/gi;
const clearNumberRegex = /[^0-9.]+/g;
const comentRegex = /<!--[^-]*-->/g;
const subM23Regex = /м<sup>[23]<\/sup>/ig;
const subRegex = /^(.*)<sup>([^<]+)<\/sup>(.*)$/i;
const stripTagRegex = /<[^>]+>/g;

export function clearPrice(price: string): Decimal {
    let clear = price.replace(",", ".");
    clear = clear.replace(subM23Regex, ""); // м^2 м^3
    const match = subRegex.exec(clear); // sometimes cents placed in <sub> tag
    if (match && match.length === 4) {
        clear = `${match[1]}.${match[2]}${match[3]}`;
    }
    clear = clear.replace(bonusesRegex, "");
    clear = clear.replace(comentRegex, "");
    clear = clear.replace(stripTagRegex, "");
    clear = clear.replace("м2", "");
    clear = clear.replace("м3", "");
    clear = clear.replace(clearNumberRegex, "");
    return new Decimal(clear);
}