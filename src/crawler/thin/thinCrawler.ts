import { IPageRequestModel } from 'models/pageRequestModel';
import fetch from 'node-fetch';

export function thinGetNodeText(page: IPageRequestModel): Promise<string> {
    return new Promise((resolve, reject) => {
        fetch(page.url)
            .then(response => {
                if (!response.ok)
                    reject(new Error(`HTML respnse state is not Ok, the real status [${response.status}:${response.statusText}], url:[${page.url}]`));
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const document = parser.parseFromString(html, 'text/xml');
                var node = document
                    .evaluate(page.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                    .singleNodeValue as HTMLElement;
                    resolve(node.innerHTML);

            })
            .catch(e => reject(e));
    })
}