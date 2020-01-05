import { IPageRequestModel } from 'models/pageRequestModel';
import fetch, {RequestInit} from "node-fetch";
import { formatCookies } from '../../utils/crowlerHelpers';

export function thinGetNodeText(page: IPageRequestModel): Promise<string> {
    return new Promise((resolve, reject) => {

        let requestParams: RequestInit | undefined;
        if (!!page.cookies && page.cookies.length > 0)
            requestParams = {
                headers: {
                    cookie: formatCookies(page.cookies) 
                }
            };

        fetch(page.url, requestParams)
            .then(response => {
                if (!response.ok)
                    reject(new Error(`HTML respnse state is not Ok, the real status [${response.status}:${response.statusText}], url:[${page.url}]`));
                return response.text();
            })
            .then(html => {
                resolve(thinGetNodeTextFromHtml(html, page.xpath))})
            .catch(e => reject(e));
    })
}

export function thinGetNodeTextFromHtml(html: string, xpath: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/xml');
    var node = document
        .evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        .singleNodeValue as HTMLElement;
    return node.innerHTML;
}