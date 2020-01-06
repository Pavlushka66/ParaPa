import * as puppeteer from 'puppeteer';

export class Browser {
    private static instance: Browser;
    private static browser: puppeteer.Browser | undefined;
    private static instanceSalt: string;
    private static lastPageIndex: number = 0;
    private static pageIndex: puppeteer.Page[];

    private constructor() {
        //https://gist.github.com/6174/6062387
        Browser.instanceSalt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public static getInstance(): Browser {
        if (!Browser.instance) {
            Browser.instance = new Browser();
        }

        return Browser.instance;
    }

    public openNewTab(): Promise<IBrowserPage> {
        return new Promise((resolve, reject) => {
            if (!Browser.browser) {
                puppeteer.launch().then(b => {
                    Browser.browser = b;
                }, e => reject(e));
            }
            Browser.browser!.newPage()
                .then(p => {
                    const page: IBrowserPage = {
                        browserInstanceSalt: Browser.instanceSalt,
                        browserPageIndex: Browser.lastPageIndex++
                    }
                    Browser.pageIndex[page.browserPageIndex] = p;
                    resolve(page);
                },
                    e => reject(e));
        });
    }

    public openUrlInPage(page: IBrowserPage, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const innerPage = Browser.extractPageFromIndex(page);
                innerPage.goto(url).then(
                    response => {
                        if (!response) {
                            reject(new Error(`Browser returned a empty answer for url [${url}]`));
                        }
                        if (!response!.ok()) {
                            reject(new Error(`Response status for url [${url}] is [${response!.status}:${response!.statusText}]`));
                        }
                        resolve();
                    },
                    e => reject(e)
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    public waitElementTextByXpath(page: IBrowserPage, xpath: string, timeout: number = 15000): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const innerPage = Browser.extractPageFromIndex(page);
                const options: puppeteer.WaitForSelectorOptions = { visible: false, timeout: timeout };
                innerPage.waitForXPath(xpath, options)
                    .then(element => element.getProperty("textContent"))
                    .then(property => property.jsonValue())
                    .then(value => resolve(value as string | undefined))
                    .catch(e => reject(e));
            } catch (error) {
                reject(error);
            }
        });
    }

    public getElementTextByXpathWithoutWait(page: IBrowserPage, xpath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const innerPage = Browser.extractPageFromIndex(page);
                innerPage.$x(xpath)
                    .then(array => {
                        if (array.length === 0) {
                            reject(new Error(`Page [${innerPage.url()}] does not contains xpath [${xpath}]`));
                        }
                        return array[0].getProperty("textContent")
                    })
                    .then(property => property.jsonValue())
                    .then(value => resolve(value as string | undefined))
                    .catch(e => reject(e));
            } catch (error) {
                reject(error);
            }
        });
    }

    public closePage(page: IBrowserPage): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const innerPage = Browser.extractPageFromIndex(page);
                Browser.pageIndex.splice(page.browserPageIndex, 1);
                innerPage.close().then(() => resolve, e => reject(e));
            } catch (error) {
                reject(error);
            }
        });
    }

    public closeBrowser(): Promise<void> {
        return new Promise((resolve, reject) => {
            Browser.pageIndex = [];
            if (!Browser.browser) {
                resolve();
            }
            Browser.browser!.close().then(() => resolve, e => reject(e));
        });
    }

    private static extractPageFromIndex(page: IBrowserPage): puppeteer.Page {
        if (page.browserInstanceSalt !== Browser.instanceSalt) {
            throw new Error("Your page salt isn't the same as current Browser's instance salt, maybe wrong insance or instanse not exists any more.");
        }
        if (typeof Browser.pageIndex[page.browserPageIndex] === 'undefined') {
            throw new Error("Seems like your page has been closed");
        }
        return Browser.pageIndex[page.browserPageIndex];
    }
}

export interface IBrowserPage {
    browserInstanceSalt: string;
    browserPageIndex: number;
}