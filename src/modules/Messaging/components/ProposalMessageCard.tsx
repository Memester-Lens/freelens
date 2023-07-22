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



export const ProposalMessageCard = ({message, isSender, id}: {message: string, isSender: boolean, id:string}) => {
    console.log('debugging1' + id)
    const details = extractCreateServiceDetails(message)
    const chainId = useChainId();
    const { user, account } = useContext(StarterKitContext);
    const { data: signer } = useSigner({
      chainId,
    });
    const provider = useProvider({ chainId });
    const router = useRouter();
    const { address } = router.query;
    const selectedConversationPeerAddress = address as string;
    const { sendMessage } = useSendMessage(
      (selectedConversationPeerAddress as string) ? selectedConversationPeerAddress : '',
      account?.address,
    );
  
    if (!user) {
      return <Loading />;
    }

    const handleProposalValidation = async(id: string) => {
        if(!signer){
            return null;
        }
        const about = `We have approved your proposal for ${id} and are preparing the payment`;
        //const newId = await createProposal(chainId, signer, provider, user, service, about);
        //sendMessage(`/create-proposal proposal created | id:${newId}`)
        return;
    }
    
    console.log('formatMessage', message, details, id)
    if (isSender) {
        return (
            <div className='text-dark text-center font-bold'>
            <br />
            Here is my proposal for ID {id} 
            </div>
        );
    } else {
        return (
          <div className='text-dark text-center font-bold'>
          <br />
          Here is my proposal for ID {id} 
          <br />
          <br />
          <br />
          <div className='text-dark text-left'>    
          </div>
          <button 
          type='submit'
          className='bg-redpraha text-white font-bold py-2 px-4 rounded'
          onClick={() => handleProposalValidation(id)}>
          Accept proposal and pay 0.1 MATIC
          </button>
          <br /> 
          <br /> 
        </div>
      );
    
    } 
}

export default ProposalMessageCard;
