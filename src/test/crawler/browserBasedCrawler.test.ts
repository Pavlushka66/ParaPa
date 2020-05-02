import { IPageRequestModel } from "../../models/pageRequestModel";
import { browserGetNodeText } from "../../crawler/browserBasedCrawler/browserBasedCrawler";

test("example.com h1", async () => {
    const request: IPageRequestModel = {
        url: "http://example.com/",
        xpath: "/html/body/div/h1"
    };

    expect(await browserGetNodeText(request))
        .toBe("Example Domain");
});