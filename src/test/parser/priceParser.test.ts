import { clearPrice } from "../../crawler/priceParser/priceParser";
import Decimal from "decimal.js";

test("simple parse string", () => {
    expect (clearPrice("1.2")).toStrictEqual(new Decimal("1.2"));
});

test("parse with comma", () => {
    expect (clearPrice("1,2")).toStrictEqual(new Decimal("1.2"));
});

test("parse with extra text", () => {
    expect (clearPrice("extra 1,2 extra")).toStrictEqual(new Decimal("1.2"));
});

test("parse zero", () => {
    expect (clearPrice("0")).toStrictEqual(new Decimal("0"));
});

test("parse with + N бонусов", () => {
    expect (clearPrice("1,2 + 100500 бонусов")).toStrictEqual(new Decimal("1.2"));
});

test("parse with м2", () => {
    expect (clearPrice("1,2 за м2")).toStrictEqual(new Decimal("1.2"));
});

test("parse with м3", () => {
    expect (clearPrice("1,2 /м3")).toStrictEqual(new Decimal("1.2"));
});

test("parse remove empty cents", () => {
    expect (clearPrice("1,00")).toStrictEqual(new Decimal("1"));
});

test("parse replace <sup> to .", () => {
    expect (clearPrice("1<sup>20</sup>")).toStrictEqual(new Decimal("1.2"));
});

test("parse removes м<sup>2</sup>", () => {
    expect (clearPrice("1 м<sup>2</sup>")).toStrictEqual(new Decimal("1"));
});

test("parse removes м<sup>3</sup>", () => {
    expect (clearPrice("1 м<sup>3</sup>")).toStrictEqual(new Decimal("1"));
});

test("parse strip tags", () => {
    expect (clearPrice("5<h1>fff</h1>")).toStrictEqual(new Decimal("5"));
});