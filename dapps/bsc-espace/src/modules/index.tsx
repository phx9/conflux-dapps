import React, { useState, useEffect, useCallback } from 'react';
import cx from 'clsx';
import useI18n from 'common/hooks/useI18n';
import { completeDetect as completeDetectEthereum } from '@cfxjs/use-wallet-react/ethereum';
import { startSub, useHasPeggedCFX } from 'bsc-espace/src/store';
import Send from 'bsc-espace/src/modules/Send';
import Claim from 'bsc-espace/src/modules/Claim';
import Redeem from 'bsc-espace/src/modules/Redeem';
import LocalStorage from 'localstorage-enhance';
import './index.css';

const transitions = {
    en: {
        transfer_assets: 'CFX Cross-chain',
        between_space: 'Between Binance Smart Chain and Conflux eSpace.',
    },
    zh: {
        transfer_assets: 'CFX 跨链',
        between_space: '在 Binance Smart Chain 和 Conflux eSpace 之间。',
    },
} as const;

const steps = [
    {
        title: 'Send CFX',
        desc: 'Send CFX on the start chain first.',
    },
    {
        title: 'Claim CFX',
        desc: 'Claim CFX on the destination chain.',
    },
    {
        title: 'Redeem',
        title_detail: 'Redeem peggedCFX',
        desc: 'You can redeem your peggedCFX here.',
    },
];

const App: React.FC = () => {
    const i18n = useI18n(transitions);
    const hasPeggedCFX = useHasPeggedCFX();

    useEffect(() => {
        let unsub: undefined | (() => void);
        completeDetectEthereum().then(() => unsub = startSub());
        
        return () => {
            if (typeof unsub === 'function') {
                unsub();
            }
        }
    }, []);

    const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(() => {
        const last = LocalStorage.getItem('step', 'bsc-espace');
        if (last === 0 || last === 1 || last === 2) {
            return last as 0 | 1 | 2;
        }
        return 0;
    });

    const changeCurrentStep = useCallback((step: typeof currentStep) => {
        LocalStorage.setItem({ key: 'step', data: step, namespace: 'bsc-espace' });
        setCurrentStep(step);
    }, []);

    useEffect(() => {
        if (currentStep === 2 && hasPeggedCFX === false) {
            setCurrentStep(0);
        }
    }, [currentStep, hasPeggedCFX]);

    return (
        <div className="relative w-[480px] mx-auto pt-[16px] mb-24px">
            <div className="pl-[32px] font-medium	text-[28px] leading-[36px] text-[#3D3F4C]">{i18n.transfer_assets}</div>
            <div className="pl-[32px] text-[16px] leading-[22px] mt-[4px] text-[#A9ABB2]">{i18n.between_space}</div>

            <div className={cx('mt-[24px] bsc-espace-module', currentStep === 2 && 'min-h-[372px]')}>
                <Steps currentStep={currentStep} changeCurrentStep={changeCurrentStep} hasPeggedCFX={hasPeggedCFX} />

                {currentStep === 0 && <Send />}
                {currentStep === 1 && <Claim />}
                {currentStep === 2 && <Redeem />}
            </div>
        </div>
    );
};

const Steps: React.FC<{ currentStep: 0 | 1 | 2; changeCurrentStep: (step: 0 | 1 | 2) => void; hasPeggedCFX?: boolean }> = ({
    currentStep,
    changeCurrentStep,
    hasPeggedCFX,
}) => {
    return (
        <>
            <div className={cx('flex justify-between items-center pr-[28px]')}>
                {steps.map((step, index) => (
                    <React.Fragment key={step.title}>
                        <div
                            id={`bsc-espace-step-${index}`}
                            className={cx(
                                'flex items-center cursor-pointer transition-opacity',
                                !hasPeggedCFX && index === 2 && 'opacity-0 pointer-events-none'
                            )}
                            onClick={() => changeCurrentStep(index as 0 | 1 | 2)}
                        >
                            {index !== 2 && (
                                <div
                                    className={cx(
                                        'mr-[8px] w-[24px] h-[24px] leading-[24px] rounded-full text-center text-[14px]',
                                        currentStep === index ? 'text-white bg-[#808BE7]' : 'text-[#A9ABB2] bg-[#F7F8FA]'
                                    )}
                                >
                                    {index + 1}
                                </div>
                            )}
                            {(currentStep === index || index === 2) && (
                                <span className={cx('text-[16px]', currentStep === index ? 'text-[#3D3F4C] font-medium' : 'text-[#898D9A] font-normal')}>
                                    {currentStep === 2 ? step.title_detail : step.title}
                                </span>
                            )}
                        </div>
                        {index !== 2 && (
                            <div
                                className={cx(
                                    'w-[40px] border-[1px] border-dashed border-[#A9ABB2] transition-opacity',
                                    !hasPeggedCFX && index === 1 && 'opacity-0'
                                )}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className={cx('mt-[24px] mb-[16px] text-[14px] text-[#898D9A] transition-opacity', !hasPeggedCFX && currentStep === 2 && 'opacity-0')}>
                {steps[currentStep].desc}
                {currentStep === 1 && (
                    <a href="https://conflux-faucets.com/" target="_blank" rel="noopener" className="block mt-[4px] text-[12px] !text-[#808be7] underline">
                        No CFX for gas? Check this community maintained faucet
                    </a>
                )}
            </div>
        </>
    );
};

export default App;
