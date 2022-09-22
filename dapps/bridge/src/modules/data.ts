import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import LocalStorage from 'localstorage-enhance';
import { innerTokenListUrl as crossSpaceTokenListUrl } from 'cross-space/src/components/TokenList/tokenListStore';
import { isEqual } from 'lodash-es';
import CFXIcon from 'common/assets/chains/Conflux.svg';
import BSCIcon from 'common/assets/chains/BSC.svg';
import BTCIcon from 'common/assets/chains/BTC.svg';
import EthereumIcon from 'common/assets/chains/Ethereum.svg';
import HECOIcon from 'common/assets/chains/HECO.svg';
import OECIcon from 'common/assets/chains/OEC.svg';

interface DataStore {
    data?: Record<string, any>;
    sourceChain?: string;
    sourceChains?: Array<string>;
    destinationChain?: string;
    destinationChains?: Array<string>;
    token?: string;
    tokens?: Array<string>;
}

export const dataStore = create(
    subscribeWithSelector(
        () =>
            ({
                data: (LocalStorage.getItem('data', 'bridge') as Array<any>) ?? undefined,
                sourceChain: (LocalStorage.getItem('sourceChain', 'bridge') as string) ?? undefined,
                sourceChains: (LocalStorage.getItem('sourceChains', 'bridge') as Array<string>) ?? undefined,
                destinationChain: (LocalStorage.getItem('destinationChain', 'bridge') as string) ?? undefined,
                destinationChains: (LocalStorage.getItem('destinationChains', 'bridge') as Array<string>) ?? undefined,
                token: (LocalStorage.getItem('token', 'bridge') as string) ?? undefined,
                tokens: (LocalStorage.getItem('tokens', 'bridge') as Array<string>) ?? undefined,
            } as DataStore)
    )
);

export const map: Record<'chain' | 'shuttleFlowFromTokenAddress' | 'receiveSymbol' | 'chainsIcon' | 'tokensIcon', any> = LocalStorage.getItem('map', 'bridge') as any || {
    chain: {
        'Conflux Core': 'cfx',
        Ethereum: 'eth',
        'BSC Chain': 'bsc',
        OKExChain: 'oec',
        'HECO Chain': 'heco',
        Bitcoin: 'btc',
    },
    shuttleFlowFromTokenAddress: {},
    receiveSymbol: {},
    tokensIcon: {},
    chainsIcon: {
        'Conflux eSpace': CFXIcon,
        'Conflux Core': CFXIcon,
        Ethereum: EthereumIcon,
        'BSC Chain': BSCIcon,
        OKExChain: OECIcon,
        'HECO Chain': HECOIcon,
        Bitcoin: BTCIcon,
    }
};

Promise.all([
    fetch('https://www.confluxhub.io/rpcsponsor', {
        body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'getTokenList', params: [] }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
    })
        .then((res) => res.json())
        .then((res) => res?.result),
    fetch(crossSpaceTokenListUrl).then((res) => res.json()),
]).then(([sfData, csData]: [any, Record<string, Array<any>>]) => {
    const data: any = {
        'Conflux eSpace': {
            Ethereum: {
                CFX: [['Space Bridge', 'Shuttle Flow']],
                ETH: [['Space Bridge', 'Shuttle Flow'], 'Multichain'],
                WETH: ['cBridge'],
                USDT: [['Space Bridge', 'Shuttle Flow'], 'Multichain', 'cBridge'],
                USDC: [['Space Bridge', 'Shuttle Flow'], 'Multichain', 'cBridge'],
                WBTC: [['Space Bridge', 'Shuttle Flow'], 'Multichain', 'cBridge'],
                DAI: [['Space Bridge', 'Shuttle Flow'], 'cBridge'],
                BNB: ['Multichain'],
                BUSD: ['Multichain'],
            },
            'BSC Chain': {
                CFX: ['Chain Bridge', 'Multichain'],
                BNB: ['Multichain'],
                BUSD: ['Multichain'],
                USDT: ['Multichain'],
                USDC: ['Multichain'],
                WBTC: ['Multichain'],
                DAI: ['Multichain'],
                ETH: ['Multichain'],
            },
        },
        "BSC Chain": {
            'Conflux eSpace': {
                CFX: ['Chain Bridge', 'Multichain'],
                BNB: ['Multichain'],
                BUSD: ['Multichain'],
                USDT: ['Multichain'],
                USDC: ['Multichain'],
                WBTC: ['Multichain'],
                DAI: ['Multichain'],
                ETH: ['Multichain'],
            }
        },
        Ethereum: {
            'Conflux eSpace': {
                CFX: [['Space Bridge', 'Shuttle Flow']],
                ETH: [['Space Bridge', 'Shuttle Flow'], 'Multichain'],
                WETH: ['cBridge'],
                USDT: [['Space Bridge', 'Shuttle Flow'], 'Multichain', 'cBridge'],
                USDC: [['Space Bridge', 'Shuttle Flow'], 'Multichain', 'cBridge'],
                WBTC: [['Space Bridge', 'Shuttle Flow'], 'Multichain', 'cBridge'],
                DAI: [['Space Bridge', 'Shuttle Flow'], 'cBridge'],
                BNB: ['Multichain'],
                BUSD: ['Multichain'],
            }
        }
    };
    Object.keys(map.chain).forEach((chain) => {
        if (!data[chain]) {
            data[chain] = {};
        }
        if (chain === 'Conflux Core') {
            data['Conflux Core']['Conflux eSpace'] = {};
            data['Conflux eSpace']['Conflux Core'] = {};
            map.receiveSymbol['Conflux Core'] = {};
            map.receiveSymbol['Conflux eSpace'] = {};
            map.receiveSymbol['Conflux Core']['Conflux eSpace'] = {};
            map.receiveSymbol['Conflux eSpace']['Conflux Core'] = {};
            [...csData.core_native_tokens, ...csData.evm_native_tokens].forEach((item: Record<string, string>) => {
                data['Conflux Core']['Conflux eSpace'][item.core_space_symbol] = 'Space Bridge';
                map.receiveSymbol['Conflux Core']['Conflux eSpace'][item.core_space_symbol] = item.evm_space_symbol;
                data['Conflux eSpace']['Conflux Core'][item.evm_space_symbol] = 'Space Bridge';
                map.receiveSymbol['Conflux eSpace']['Conflux Core'][item.evm_space_symbol] = item.core_space_symbol;
                map.tokensIcon[item.core_space_symbol] = item.icon;
                map.tokensIcon[item.evm_space_symbol] = item.icon;
            });
        } else {
            const tokens = sfData
                .filter((item: any) => item.origin === map.chain[chain] || item.to_chain === map.chain[chain])
                .filter((asset: any) => asset.in_token_list === 1 && asset.supported === 1);

            tokens?.forEach((token: any) => {
                if (!data[chain]['Conflux Core']) {
                    data[chain]['Conflux Core'] = {};
                }
                data[chain]['Conflux Core'][token.reference_symbol] = ['Shuttle Flow'];
                if (!map.shuttleFlowFromTokenAddress[chain]) {
                    map.shuttleFlowFromTokenAddress[chain] = {};
                }
                map.shuttleFlowFromTokenAddress[chain][token.reference_symbol] = token.reference;

                if (!map.receiveSymbol[chain]) {
                    map.receiveSymbol[chain] = {};
                }
                if (!map.receiveSymbol[chain]['Conflux Core']) {
                    map.receiveSymbol[chain]['Conflux Core'] = {};
                }
                map.receiveSymbol[chain]['Conflux Core'][token.reference_symbol] = token.symbol;
                map.tokensIcon[token.reference_symbol] = token.icon;


                if (!data['Conflux Core'][chain]) {
                    data['Conflux Core'][chain] = {};
                }
                data['Conflux Core'][chain][token.symbol] = ['Shuttle Flow'];

                if (!map.shuttleFlowFromTokenAddress['Conflux Core']) {
                    map.shuttleFlowFromTokenAddress['Conflux Core'] = {};
                }
                map.shuttleFlowFromTokenAddress['Conflux Core'][token.symbol] = token.ctoken;

                if (!map.receiveSymbol['Conflux Core']) {
                    map.receiveSymbol['Conflux Core'] = {};
                }
                if (!map.receiveSymbol['Conflux Core'][chain]) {
                    map.receiveSymbol['Conflux Core'][chain] = {};
                }
                map.receiveSymbol['Conflux Core'][chain][token.symbol] = token.reference_symbol;
                map.tokensIcon[token.symbol] = token.icon;
            });
        }
    });

    const { data: preData, sourceChain: preSourceChain, sourceChains: preSourceChains } = dataStore.getState();
    if (!isEqual(preData, data)) {
        dataStore.setState({ data });
        LocalStorage.setItem({ data, key: 'data', namespace: 'bridge' });
    }

    const sourceChains = Object.keys(data);
    if (!isEqual(preSourceChains, sourceChains)) {
        dataStore.setState({ sourceChains });
        LocalStorage.setItem({ data: sourceChains, key: 'sourceChains', namespace: 'bridge' });
    }

    if (!preSourceChain || !sourceChains.includes(preSourceChain)) {
        dataStore.setState({ sourceChain: 'Conflux Core' });
        LocalStorage.setItem({ data: 'Conflux Core', key: 'sourceChain', namespace: 'bridge' });
        const destinationChain = resetDestinationChains('Conflux Core')!;
        resetTokens('Conflux Core', destinationChain);
    }

    LocalStorage.setItem({ data: map, key: 'map', namespace: 'bridge' })
});

const resetDestinationChains = (sourceChain: string, resetDestinationChain = true) => {
    const { data } = dataStore.getState();
    if (!sourceChain || !data) {
        dataStore.setState({ destinationChains: undefined, destinationChain: undefined });
        return;
    }
    const destinationChains = Object.keys(data[sourceChain] ?? Object.create(null));
    dataStore.setState({ destinationChains });
    LocalStorage.setItem({ data: destinationChains, key: 'destinationChains', namespace: 'bridge' });
    if (resetDestinationChain) {
        dataStore.setState({ destinationChain: destinationChains[0] });
        LocalStorage.setItem({ data: destinationChains[0], key: 'destinationChain', namespace: 'bridge' });
    }
    return destinationChains[0];
};

const resetTokens = (sourceChain: string, destinationChain: string, resetToken = true) => {
    const { data } = dataStore.getState();
    if (!sourceChain || !destinationChain || !data) {
        dataStore.setState({ destinationChains: undefined, destinationChain: undefined });
        return;
    }
    const tokens = Object.keys(data[sourceChain]?.[destinationChain] ?? Object.create(null));
    dataStore.setState({ tokens });
    LocalStorage.setItem({ data: tokens, key: 'tokens', namespace: 'bridge' });
    if (resetToken) {
        dataStore.setState({ token: tokens[0] });
        LocalStorage.setItem({ data: tokens[0], key: 'token', namespace: 'bridge' });
    }
    return tokens;
};

const selector = {
    data: (state: DataStore) => state.data,
    sourceChain: (state: DataStore) => state.sourceChain,
    sourceChains: (state: DataStore) => state.sourceChains,
    destinationChain: (state: DataStore) => state.destinationChain,
    destinationChains: (state: DataStore) => state.destinationChains,
    token: (state: DataStore) => state.token,
    tokens: (state: DataStore) => state.tokens,
};

export const useData = () => dataStore(selector.data);
export const useSourceChain = () => dataStore(selector.sourceChain);
export const useSourceChains = () => dataStore(selector.sourceChains);
export const useDestinationChain = () => dataStore(selector.destinationChain);
export const useDestinationChains = () => dataStore(selector.destinationChains);
export const useToken = () => dataStore(selector.token);
export const useTokens = () => dataStore(selector.tokens);
export const handleSourceChainChange = (sourceChain: string) => {
    if (sourceChain === dataStore.getState().destinationChain) {
        handleReverse();
        return;
    }
    LocalStorage.setItem({ data: sourceChain, key: 'sourceChain', namespace: 'bridge' });
    dataStore.setState({ sourceChain });
    const destinationChain = resetDestinationChains(sourceChain)!;
    resetTokens(sourceChain, destinationChain);
};

export const handleDestinationChainChange = (destinationChain: string) => {
    if (destinationChain === dataStore.getState().sourceChain) {
        handleReverse();
        return;
    }
    const sourceChain = dataStore.getState().sourceChain!;
    LocalStorage.setItem({ data: destinationChain, key: 'destinationChain', namespace: 'bridge' });
    dataStore.setState({ destinationChain });
    resetTokens(sourceChain, destinationChain);
};

export const handleTokenChange = (token: string) => {
    LocalStorage.setItem({ data: token, key: 'token', namespace: 'bridge' });
    dataStore.setState({ token });
};

export const handleReverse = () => {
    const { sourceChain, destinationChain, token } = dataStore.getState();
    LocalStorage.setItem({ data: sourceChain, key: 'destinationChain', namespace: 'bridge' });
    LocalStorage.setItem({ data: destinationChain, key: 'sourceChain', namespace: 'bridge' });
    dataStore.setState({ sourceChain: destinationChain, destinationChain: sourceChain });
    resetDestinationChains(destinationChain!, false)!;
    const reversedToken = map.receiveSymbol?.[sourceChain!]?.[destinationChain!]?.[token!];
    const newTokens = resetTokens(destinationChain!, sourceChain!, false);
    if (newTokens?.includes(reversedToken)) {
        dataStore.setState({ token: reversedToken });
        LocalStorage.setItem({ data: reversedToken, key: 'token', namespace: 'bridge' });
    }
};



export const afterSpaceBridge = ({ sourceChain, destinationChain }: { sourceChain: string; destinationChain: string; }) => {
    if (sourceChain === 'Conflux Core' || destinationChain === 'Conflux Core') return 'Conflux eSpace';
    else if (sourceChain === 'Conflux eSpace' || destinationChain === 'Conflux eSpace') return 'Conflux Core';
    return '';
}