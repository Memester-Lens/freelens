import { Provider } from '@wagmi/core';
import { ethers, Signer } from 'ethers';
import { IFormValues } from '../components/Form/ServiceForm';
import { getConfig } from '../config';
import ServiceRegistry from '../contracts/ABI/TalentLayerService.json';
import { IToken, IUser } from '../types';
import { postToIPFS } from '../utils/ipfs';
import { getServiceSignature } from '../utils/signature';
import { createMultiStepsTransactionToast, showErrorTransactionToast } from '../utils/toast';
import { parseRateAmount } from '../utils/web3';

export const createService = async (
  chainId: number,
  signer: Signer,
  provider: Provider,
  user: IUser,
  values: IFormValues,
  allowedTokenList: IToken[],
): Promise<number | undefined> => {
  const config = getConfig(chainId);

  console.log('allowedTokenList', allowedTokenList);

  try {
    const token = allowedTokenList.find(token => token.symbol === values.rateToken);
    if (!token) {
      console.error('invalid token');
      return;
    }
    const parsedRateAmount = await parseRateAmount(
      values.rateAmount.toString(),
      values.rateToken,
      token.decimals,
    );
    const parsedRateAmountString = parsedRateAmount.toString();
    const cid = await postToIPFS(
      JSON.stringify({
        title: values.title,
        about: values.about,
        keywords: values.keywords,
        rateToken: token.address,
        rateAmount: parsedRateAmountString,
      }),
    );

    // Get platform signature
    const signature = await getServiceSignature({ profileId: Number(user?.id), cid });

    const contract = new ethers.Contract(
      config.contracts.serviceRegistry,
      ServiceRegistry.abi,
      signer,
    );

    const tx = await contract.createService(
      user?.id,
      process.env.NEXT_PUBLIC_PLATFORM_ID,
      cid,
      signature,
    );

    const newId = await createMultiStepsTransactionToast(
      chainId,
      {
        pending: 'Creating your job...',
        success: 'Congrats! Your job has been added',
        error: 'An error occurred while creating your job',
      },
      provider,
      tx,
      'service',
      cid,
    );

    return newId;
  } catch (error: any) {
    showErrorTransactionToast(error);
  }
};