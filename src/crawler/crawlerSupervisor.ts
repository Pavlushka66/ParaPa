import { IPageRequestModel } from "../models/pageRequestModel";
import { ICrawlerIndexItemModel, ICrawlerResult, CrowlerState } from "../models/crawlerIndexItemModel";
import { thinGetNodeText } from "./thinCrawler/thinCrawler";
import { formatCookies } from "../utils/crowlerHelpers";
import { clearPrice } from "./priceParser/priceParser";

export default class CrawlerSupervisor {
    private crawlerIndex: { [key: string]: ICrawlerIndexItemModel } = {};
    private unprocessedPagesInIndex: number = 0;
    private onWorkDone?(crawlerIndex: { [key: string]: ICrawlerIndexItemModel }): void;

    public init(pages: IPageRequestModel[], 
        onWorkDone: (crawlerIndex: { [key: string]: ICrawlerIndexItemModel }) => void): void {
        this.onWorkDone = onWorkDone;
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
            const item: ICrawlerIndexItemModel = {
                key: page.url,
                page: page,
                result: itemResult
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

    private processItem(item: ICrawlerIndexItemModel) {
        thinGetNodeText(item.page)
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
                        console.log(`Error ocured while trying execute callback function [${callbackError.message}]`);
                    }
                },
                e => this.catchItemProcessingError(item, e)
            );
    }

    private catchItemProcessingError(item: ICrawlerIndexItemModel, error: Error): void {
        item.result.state = CrowlerState.Error;
        item.result.error = error;
        console.log(`Page process was failed, error ocured url:[${item.page.url}], xpath:[${item.page.xpath}], ` +
            `cookies:[${formatCookies(item.page.cookies)}], error:[${error.message}]`);
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