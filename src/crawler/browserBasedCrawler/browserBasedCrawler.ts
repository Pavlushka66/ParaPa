import { IPageRequestModel } from "models/pageRequestModel";
import { Browser } from "./browser";

export function browserGetNodeText(page: IPageRequestModel): Promise<string> {
    return new Promise((resolve, reject) => {
        const browser = Browser.getInstance();
        browser.openNewTab()
        .then(tab => {
            browser.openUrlInPage(tab, page.url)
            .then(() => browser.waitElementTextByXpath(tab, page.xpath, 15000))
            .then(value => resolve(value))
            .catch(error => reject(error))
            .finally(() => browser.closePage(tab))
        }, error => reject(error));
    })
}