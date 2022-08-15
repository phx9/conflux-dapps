import { CONTRACT_ABI } from 'payment/src/contracts/constants'

export type ResourceMethodsType = "name" | "symbol" | "appOwner" | "totalCharged" | "totalRequests" | "listUser" | "listResources"

export interface ResourceDataSourceType {
    resourceId: string;
    weight: string;
    requests: string;
    submitTimestamp: string;
    action?: string;
}

export interface DataSourceType {
    name: string;
    baseURL: string;
    address: string;
    owner: string;
    earnings: string | number;
}

export interface APPDataSourceType extends Omit<DataSourceType, 'address'> {
    requests: number;
    users: number;
    resources: {
        list: Array<ResourceDataSourceType>,
        total: number
    };
}

export type DefinedContractNamesType = keyof typeof CONTRACT_ABI

export interface PostAPPType {
    name: string;
    url: string;
    weight: number;
    account: string;
}