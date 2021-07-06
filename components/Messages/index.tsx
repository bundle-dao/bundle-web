import { message } from 'antd';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';

export const txMessage = (tx: TransactionResponse) => {
    const hide = message.loading(
        <>
            Transaction has been submitted and can be viewed{' '}
            <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>
    );
    setTimeout(hide, 5000);
};

export const withdrawMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Withdrawal successful, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const harvestMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Rewards have been successfuly harvested, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const unlockMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Rewards have been successfully unlocked, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const depositMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Deposit successful, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const approveMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Token successfully approved, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const swapMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Swap completed successfuly, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const mintMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Bundle minted successfuly, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const burnMessage = (tx: TransactionReceipt) => {
    message.success(
        <>
            Bundle redeemed successfuly, your transaction can be verified{' '}
            <a href={`https://bscscan.com/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                here
            </a>
        </>,
        5
    );
};

export const errorMessage = (reason: string) => {
    message.error(<>The submitted transaction has failed for reason: "{reason}"</>, 5);
};

export const chainErrorMessage = (chainId: number | undefined) => {
    message.error(<>Chain ID "{chainId ? chainId : 0}" not supported</>, 5);
};
