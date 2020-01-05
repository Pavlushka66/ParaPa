import { IPageRequestModel } from "models/pageRequestModel";

export function thinGetNodeText(page: IPageRequestModel): Promise<string> {
    return new Promise((resolve, reject) => {

        // let requestParams: RequestInit | undefined;
        // if (!!page.cookies && page.cookies.length > 0)
        //     requestParams = {
        //         headers: {
        //             cookie: formatCookies(page.cookies) 
        //         }
        //     };

        // fetch(page.url, requestParams)
        //     .then(response => {
        //         if (!response.ok)
        //             reject(new Error(`HTML respnse state is not Ok, the real status [${response.status}:${response.statusText}], url:[${page.url}]`));
        //         return response.text();
        //     })
        //     .then(html => {
        //         resolve(thinGetNodeTextFromHtml(html, page.xpath))})
        //     .catch(e => reject(e));
    })
}