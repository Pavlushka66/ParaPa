import { IPageRequestModel } from "../../models/pageRequestModel";
import { thinGetNodeText } from "../../crawler/thin/thinCrawler";

test('example.com h1', async () => {
    const request: IPageRequestModel = {
        url: "http://example.com/",
        xpath: "/html/body/div/h1"
    };

    expect(await thinGetNodeText(request))
        .toBe("Example Domain");
});