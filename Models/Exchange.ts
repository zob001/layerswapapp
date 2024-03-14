import { Network, Token } from "./Network";

export class Exchange {
    display_name: string;
    name: string;
    logo: string;
    token_groups: {
        symbol: string;
        logo: string
    }[]
    metadata: {
        o_auth: {
            connect_url: string,
            authorize_url: string
        } | null
        listing_date: string
    }
}

export class ExchangeNetwork {
    token: Token;
    network: Network;
    fee: {
        total_fee: number;
        total_fee_in_usd: number
    }
}