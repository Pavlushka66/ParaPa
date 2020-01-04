import {ICookie} from "./cookie"

export interface IPageRequestModel {
    url: string;
    xpath: string;
    cookies?: ICookie[];
}