import { IPageRequestModel } from "../models/pageRequestModel";
import { ICrawlerIndexItemModel, ICrawlerResult, CrowlerState } from "../models/crawlerIndexItemModel";
import { thinGetNodeText } from "./thinCrawler/thinCrawler";
import { formatCookies } from "../utils/crowlerHelpers";
import { clearPrice } from "./priceParser/priceParser";
import { browserGetNodeText } from "./browserBasedCrawler/browserBasedCrawler";
import logger from "../infrastructure/logger/logger";

export default class CrawlerSupervisor {
    private crawlerIndex: { [key: string]: ICrawlerIndexItemModel } = {};
    private unprocessedPagesInIndex: number = 0;
    private hostsForBrowser: string[] = [];
    private onWorkDone?(crawlerIndex: { [key: string]: ICrawlerIndexItemModel }): void;

    public init(pages: IPageRequestModel[],
        hostsForBrowser: string[],
        onWorkDone: (crawlerIndex: { [key: string]: ICrawlerIndexItemModel }) => void): void {

        this.onWorkDone = onWorkDone;
        this.hostsForBrowser = hostsForBrowser;
        pages.map(page => this.push(page));
    }

    private push(page: IPageRequestModel): boolean {
        if (!this.onWorkDone) {
            throw new Error("Don;t have callback in case when work will be done, call init first");
        }
        if (this.engagePage(page)) {
            const itemResult: ICrawlerResult = {
                state: CrowlerState.Unprocessed
            };
            const shouldUseBrowser = !!this.hostsForBrowser.find(host => page.url.indexOf(host) > -1);
            const item: ICrawlerIndexItemModel = {
                key: page.url,
                page: page,
                result: itemResult,
                forBrowser: shouldUseBrowser
            };
            this.crawlerIndex[page.url] = item;
            this.unprocessedPagesInIndex++;
            this.processItem(item);
            return true;
        }
        return false;
    }

    private engagePage(page: IPageRequestModel): boolean {
        return true;
    }

    private processItem(item: ICrawlerIndexItemModel): void {
        (item.forBrowser ? browserGetNodeText(item.page) : thinGetNodeText(item.page))
            .then(
                result => {
                    try {
                        var price = clearPrice(result);
                        item.result.value = price;
                        item.result.state = CrowlerState.Success;
                    } catch (parsingError) {
                        let e = new Error(`Error ocured while trying to parse price from page [${item.page.url}] value [${result}] [${parsingError.message}]`);
                        e.stack = e.stack?.split('\n').slice(0, 2).join('\n') + '\n' +
                            parsingError.stack;
                        this.catchItemProcessingError(item, e)
                    }
                    try {
                        this.checkWorkIsDone();
                    } catch (callbackError) {
                        logger.error(`Error ocured while trying execute callback function [${callbackError.message}]`, callbackError);
                    }
                },
                e => this.catchItemProcessingError(item, e)
            );
    }

    private catchItemProcessingError(item: ICrawlerIndexItemModel, error: Error): void {
        item.result.state = CrowlerState.Error;
        item.result.error = error;
        logger.error(`Page process was failed, error ocured url:[${item.page.url}], xpath:[${item.page.xpath}], ` +
            `cookies:[${formatCookies(item.page.cookies)}], error:[${error.message}]`, error);
        this.checkWorkIsDone();
    }

    private checkWorkIsDone() {
        if (--this.unprocessedPagesInIndex < 1) {
            if (!this.onWorkDone) {
                throw new Error("Can't finish work of CrawlerSupervisor cause onWorkDone callback is undefined");
            }
            this.onWorkDone(this.crawlerIndex);
        }
    }
}