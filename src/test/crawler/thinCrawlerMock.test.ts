import fetch from 'node-fetch';
import { thinGetNodeText } from "../../crawler/thin/thinCrawler";
import { IPageRequestModel } from '../../models/pageRequestModel';
import { ICookie } from '../../models/cookie';

const { Response } = jest.requireActual('node-fetch');

jest.mock('node-fetch', () => jest.fn());

afterEach(() => {
    jest.clearAllMocks;
});

describe("thinCrawler with node-fetch mocks", () => {
    test("Simple get data", async () => {
        const expectedResponse = "<html><title>title</title><body><span>span</span><h2>second header</h2><h1>first header</h1></body></html>";
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(new Response(expectedResponse));
        const page: IPageRequestModel = {
            url: "http://example.com",
            xpath: "//h1",
        };

        const response = await thinGetNodeText(page)
        expect(response).toBe("first header");
    });

    test("Check cookies", async () => {
        const expectedResponse = "<html><title>title</title><body><span>span</span><h2>second header</h2><h1>first header</h1></body></html>";
        const mocked = (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(new Response(expectedResponse));
        const cookies: ICookie[] = [{ name: "one", value: "first" }, { name: "two", value: "second" }];
        const page: IPageRequestModel = {
            url: "http://example.com",
            xpath: "//h1",
            cookies: cookies
        };

        const response = await thinGetNodeText(page)
        const mockCalls = mocked.mock.calls.length;
        expect(mockCalls).toBeGreaterThanOrEqual(1);
        const requestParams: RequestInit | undefined = mocked.mock.calls[mockCalls - 1][1] as RequestInit | undefined;
        expect(requestParams).not.toBeUndefined;
        expect(requestParams).not.toBeNull;
        const headers = requestParams?.headers as { [key: string]: string } | undefined;
        expect(headers).not.toBeUndefined;
        expect(headers!["cookie"]).toBe("one=first;two=second");
    });
});