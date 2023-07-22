import { useContext } from 'react';
import { createProposal } from '../../../contracts/createProposal';
import { useChainId } from '../../../hooks/useChainId';
import { extractCreateServiceDetails, extractID } from '../../../utils/message';
import StarterKitContext from '../../../context/starterKit';
import { useProvider, useSigner } from 'wagmi';
import useServiceById from '../../../hooks/useServiceById';
import { useRouter } from 'next/router';
import useSendMessage from '../hooks/useSendMessage';
import Loading from '../../../components/Loading';



export const GigMessageCard = ({message, isSender, id}: {message: string, isSender: boolean, id:string}) => {
    const details = extractCreateServiceDetails(message)

    const chainId = useChainId();
    const { user, account } = useContext(StarterKitContext);
    const { data: signer } = useSigner({
      chainId,
    });
    const provider = useProvider({ chainId });
    const service = useServiceById(id);
    const router = useRouter();
    const { address } = router.query;
    const selectedConversationPeerAddress = address as string;
    const { sendMessage } = useSendMessage(
      (selectedConversationPeerAddress as string) ? selectedConversationPeerAddress : '',
      account?.address,
    );
  
    if (!service || !user) {
      return <Loading />;
    }

    const handleProposalCreation = async(id: string) => {
        if(!signer){
            return null;
        }

        const about = `After chatting together on HelloWork, I accept working on the ${service.id} and the asked condition`;
        const newId = await createProposal(chainId, signer, provider, user, service, about);
        sendMessage(`/create-proposal proposal created | id:${newId}`)
        return;
    }

    
    console.log('formatMessage', message, details, id)
    if (isSender) {
        return (
            <div className='bg-white text-dark text-center font-bold'>
            <br />
            Here is a new gig that may interest you!  
            <br />
            <br />
            <br />
            <div className='bg-white text-dark text-left'>
                Id: {id}
                <br />
            Description: {details.title}
            <br /> 
            <br /> 
            Bounty: {details.rateAmount} {details.rateToken}
            </div>
            <br />
            <br /> 
            <br /> 
            <img
            src='/images/home/hero/homer.png'
            alt='homer image'
            className='mx-auto max-w-full'
            />
            </div>
        );
    } else {
        return (
          <div className='bg-white text-dark text-center font-bold'>
          <br />
          Here is a new gig that may interest you!  
          <br />
          <br />
          <br />
          <div className='bg-white text-dark text-left'>
          Id: {id}
                <br />
          Description: {details.title}
          <br /> 
          <br /> 
          Bounty: {details.rateAmount} {details.rateToken}
          </div>
          <br />
          <button 
          type='submit'
          className='bg-redpraha text-white font-bold py-2 px-4 rounded'
          onClick={() => handleProposalCreation(id)}>
          I am interested
          </button>
          <br /> 
          <br /> 
          <img
          src='/images/home/hero/homer.png'
          alt='homer image'
          className='mx-auto max-w-full'
          />
        </div>
      );
    
    } 
}

export default GigMessageCard;
