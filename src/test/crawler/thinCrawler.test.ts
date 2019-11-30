import { IPageRequestModel } from "../../models/pageRequestModel";
import { thinGetNodeText, thinGetNodeTextFromHtml } from "../../crawler/thin/thinCrawler";

test("example.com h1", async () => {
    const request: IPageRequestModel = {
        url: "http://example.com/",
        xpath: "/html/body/div/h1"
    };

    expect(await thinGetNodeText(request))
        .toBe("Example Domain");
});

test("extract node from html", () => {
    const result =
        thinGetNodeTextFromHtml("<body><span>bar</span><span itemprop='price'>foo</span></body>",
            "//*[@itemprop='price']");
    expect(result).toBe("foo");
});

test("extract node inner html", () => {
    const result =
        thinGetNodeTextFromHtml("<body><span itemprop='price'>foo<sup>bar</sup></span></body>",
            "//*[@itemprop='price']");
    expect(result).toBe("foo<sup>bar</sup>");
});