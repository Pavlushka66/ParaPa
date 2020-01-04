import { IPageRequestModel } from "./pageRequestModel";
import Decimal from "decimal.js";

export interface ICrawlerIndexItemModel {
    key: string;
    page: IPageRequestModel;
    result: ICrawlerResult;
}

export interface ICrawlerResult {
    state: CrowlerState,
    value?: Decimal
    error?: Error
}

export enum CrowlerState {
    Unprocessed = "unprocessed",
    Success = "sucess",
    Error = "error"
}