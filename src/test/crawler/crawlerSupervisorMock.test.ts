import fetch from 'node-fetch';
import { IPageRequestModel } from '../../models/pageRequestModel';
import { ICookie } from '../../models/cookie';
import CrawlerSupervisor from '../../crawler/crawlerSupervisor';
import { ICrawlerIndexItemModel, ICrawlerResult, CrowlerState } from '../../models/crawlerIndexItemModel';
import Decimal from 'decimal.js';

const { Response } = jest.requireActual('node-fetch');

jest.mock('node-fetch', () => jest.fn());

afterEach(() => {
    jest.clearAllMocks;
});

describe("crawlerSupervisor with node-fetch mocks", () => {
    test("Simple get data", async () => {
        const expectedResponse = "<html><title>title</title><body><h1>123.45</h1></body></html>";
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(new Response(expectedResponse));
        const pages: IPageRequestModel[] = [{
            url: "http://example.com",
            xpath: "//h1",
        }];

        let superviorResultFunction = (crawlerIndex: { [key: string]: ICrawlerIndexItemModel }) => {
            const result: ICrawlerResult = crawlerIndex["http://example.com"].result;
            expect(result.state).toEqual(CrowlerState.Success);
            expect(result.value).toEqual(new Decimal("123.45"));
        };

        const crawlerSupervisor = new CrawlerSupervisor();
        crawlerSupervisor.init(pages, superviorResultFunction);
    });

    test("Price is cleaned", async () => {
        const expectedResponse = "<html><title>title</title><body><h1>123.45<span>м2</span></h1></body></html>";
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(new Response(expectedResponse));
        const pages: IPageRequestModel[] = [{
            url: "http://example.com",
            xpath: "//h1",
        }];

        let superviorResultFunction = (crawlerIndex: { [key: string]: ICrawlerIndexItemModel }) => {
            const result: ICrawlerResult = crawlerIndex["http://example.com"].result;
            expect(result.state).toEqual(CrowlerState.Success);
            expect(result.value).toEqual(new Decimal("123.45"));
        };

        const crawlerSupervisor = new CrawlerSupervisor();
        crawlerSupervisor.init(pages, superviorResultFunction);
    });

    test("Check cookies", async () => {
        const expectedResponse = "<html><title>title</title><body><h1>123.45<span>м2</span></h1></body></html>";
        const mocked = (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(new Response(expectedResponse));
        const cookies: ICookie[] = [{ name: "one", value: "first" }, { name: "two", value: "second" }];
        const pages: IPageRequestModel[] = [{
            url: "http://example.com",
            xpath: "//h1",
            cookies: cookies
        }];

        let superviorResultFunction = (crawlerIndex: { [key: string]: ICrawlerIndexItemModel }) => {
            const result: ICrawlerResult = crawlerIndex["http://example.com"].result;
            expect(result.state).toEqual(CrowlerState.Success);
            expect(result.value).toEqual(new Decimal("123.45"));
            const mockCalls = mocked.mock.calls.length;
            expect(mockCalls).toBeGreaterThanOrEqual(1);
            const requestParams: RequestInit | undefined = mocked.mock.calls[mockCalls - 1][1] as RequestInit | undefined;
            expect(requestParams).not.toBeUndefined();
            expect(requestParams).not.toBeNull();
            const headers = requestParams?.headers as { [key: string]: string } | undefined;
            expect(headers).not.toBeUndefined;
            expect(headers!["cookie"]).toBe("one=first;two=second");
        };

        const crawlerSupervisor = new CrawlerSupervisor();
        crawlerSupervisor.init(pages, superviorResultFunction);
    });

    test("two pages", async () => {
        const expectedResponse = "<html><title>title</title><body><h1>123.45</h1></body></html>";
        (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Response(expectedResponse));
        const pages: IPageRequestModel[] = [{
            url: "http://example.com",
            xpath: "//h1",
        }, {
            url: "http://google.com",
            xpath: "//h1",
        }];

        let superviorResultFunction = (crawlerIndex: { [key: string]: ICrawlerIndexItemModel }) => {
            let item = crawlerIndex["http://google.com"];
            expect(item?.result).not.toBeUndefined();
            let result: ICrawlerResult = item.result;
            expect(result.state).toEqual(CrowlerState.Success);
            expect(result.value).toEqual(new Decimal("123.45"));

            item = crawlerIndex["http://example.com"];
            expect(item?.result).not.toBeUndefined();
            result = item.result;
            expect(result.state).toEqual(CrowlerState.Success);
            expect(result.value).toEqual(new Decimal("123.45"));
        };

        const crawlerSupervisor = new CrawlerSupervisor();
        crawlerSupervisor.init(pages, superviorResultFunction);
    });
});