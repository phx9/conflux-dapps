import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import CustomScrollbar from 'custom-react-scrollbar';
import Navbar from 'common/modules/Navbar';
import { LocaleContext } from 'common/hooks/useI18n';
import { ModeContext } from 'common/hooks/useMode';
import Sidebar from 'hub/src/modules/Sidebar';
import CrossSpace from 'cross-space/src/modules';
import BscEspace from 'bsc-espace/src/modules';
import Airdrop from 'airdrop/src/modules';
import ESpaceBridgeEnter from 'hub/src/modules/ESpaceBridgeEnter';
import ShuttleFlowNavbarEnhance from 'hub/src/modules/NavbarEnhance/ShuttleFlow';
import useCurrentDapp from 'hub/src/hooks/useCurrentDapp';
import ShuttleFlowIcon from 'hub/src/assets/shuttle-flow.svg';
import CrossSpaceIcon from 'hub/src/assets/cross-space.svg';
import AirdropIcon from 'hub/src/assets/Airdrop.svg';
import { hideAllToast } from 'common/components/showPopup/Toast';
import LocalStorage from 'localstorage-enhance';
import './App.css';

export const dapps = [
    {
        name: 'eSpace Bridge',
        icon: CrossSpaceIcon,
        path: 'espace-bridge',
        element: <ESpaceBridgeEnter />,
        index: true,
    },
    {
        name: 'ShuttleFlow',
        icon: ShuttleFlowIcon,
        path: 'shuttle-flow',
        NavbarEnhance: {
            type: 'childRoutes' as 'childRoutes',
            Content: <ShuttleFlowNavbarEnhance />,
        }
    },
    {
        name: 'eSpace Airdrop',
        icon: AirdropIcon,
        path: 'espace-airdrop',
        element: <Airdrop />,
    },
];

const App = () => {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const last = LocalStorage.getItem('mode') as 'light' || 'light';
        if (last === 'light' || last === 'dark') return last;
        return 'light';
    });

    useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    const handleSwitchMode = useCallback(() => {
        setMode((pre) => {
            const mode = pre === 'light' ? 'dark' : 'light';
            LocalStorage.setItem({ key: 'mode', data: mode});
            return mode;
        });
    }, []);


    const [locale, setLocal] = useState<'zh' | 'en'>(() => {
        const last = LocalStorage.getItem('locale') as 'en' | 'zh';
        if (last === 'en' || last === 'zh') return last;
        return (navigator.language.includes('zh') ? 'en' : 'en')
    });
    const handleSwitchLocale = useCallback(() => setLocal(preLocale => {
        const locale = preLocale === 'zh' ? 'en' : 'zh';
        LocalStorage.setItem({ key: 'locale', data: locale});
        return locale;
    }), []);

    return (
        <ModeContext.Provider value={mode}>
            <LocaleContext.Provider value={locale}>
                <Router>
                    <Sidebar />
                    <DappContent handleSwitchLocale={handleSwitchLocale} handleSwitchMode={handleSwitchMode} />
                </Router>
            </LocaleContext.Provider>
        </ModeContext.Provider>
    );
};

const DappContent: React.FC<{ handleSwitchLocale?: () => void; handleSwitchMode?: () => void }> = ({ handleSwitchLocale, handleSwitchMode }) => {
    const currentDapp = useCurrentDapp();

    const { pathname } = useLocation();
    useEffect(() => {
        hideAllToast();
    }, [pathname]);

    return (
        <CustomScrollbar contentClassName="main-scroll">
            <Navbar
                handleSwitchLocale={handleSwitchLocale}
                handleSwitchMode={handleSwitchMode}
                dappName={currentDapp.name}
                dappIcon={currentDapp.icon}
                Enhance={currentDapp.NavbarEnhance}
            />
            <Routes>
                <Route key='espace-bridge' path='espace-bridge' element={<Outlet />}>
                    <Route index element={<ESpaceBridgeEnter />}  />
                    <Route key='cross-space' path='cross-space' element={<CrossSpace />} />
                    <Route key='bsc-espace-cfx' path='bsc-espace-cfx' element={<BscEspace />} />
                </Route>
                <Route key='espace-airdrop' path='espace-airdrop' element={<Airdrop />} />
                {dapps
                    .filter((dapp) => !dapp.element)
                    .map(({ path }) => (
                        <Route key={path} path={path + '/*'} element={<div id={path} />} />
                    ))}
                <Route path="*" element={<Navigate to="espace-bridge"/>} />
            </Routes>
        </CustomScrollbar>
    );
};

export default App;
