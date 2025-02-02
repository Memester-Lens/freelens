import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useProvider, useSigner } from 'wagmi';
import Steps from '../../../components/Steps';
import StarterKitContext from '../../../context/starterKit';
import { useChainId } from '../../../hooks/useChainId';
import useUserByAddress from '../../../hooks/useUserByAddress';
import { XmtpContext } from '../context/XmtpContext';
import useSendMessage from '../hooks/useSendMessage';
import useStreamConversations from '../hooks/useStreamConversations';
import { NON_EXISTING_XMTP_USER_ERROR_MESSAGE } from '../hooks/useStreamMessages';
import { ChatMessageStatus, XmtpChatMessage } from '../utils/types';
import CardHeader from './CardHeader';
import MessageComposer from './MessageComposer';
import MessageList from './MessageList';
import { createService } from '../../../contracts/createService';
import useAllowedTokens from '../../../hooks/useAllowedTokens';
import { extractCreateServiceDetails } from '../../../utils/message';

function Dashboard() {
  const chainId = useChainId();
  const { account, user } = useContext(StarterKitContext);
  const { data: signer } = useSigner({
    chainId,
  });
  const provider = useProvider({ chainId });
  const { providerState, setProviderState } = useContext(XmtpContext);
  const [messageContent, setMessageContent] = useState<string>('');
  const router = useRouter();
  const { address } = router.query;
  const selectedConversationPeerAddress = address as string;
  const [sendingPending, setSendingPending] = useState(false);
  const [messageSendingErrorMsg, setMessageSendingErrorMsg] = useState('');
  const allowedTokenList = useAllowedTokens();

  const { sendMessage } = useSendMessage(
    (selectedConversationPeerAddress as string) ? selectedConversationPeerAddress : '',
    account?.address,
  );
  const peerUser = useUserByAddress(selectedConversationPeerAddress);

  // Listens to new conversations ? ==> Yes, & sets them in "xmtp context". Stream stops "onDestroy"
  useStreamConversations();

  const handleXmtpConnect = async () => {
    if (providerState && providerState.initClient && signer) {
      await providerState.initClient(signer);
    }
  };

  const sendNewMessage = async () => {
    console.log('sendNewMessage')

    if (signer && user && account?.address && messageContent && providerState && setProviderState) {

      let customMessageContent = messageContent;
      // /create-gig Solidity dev nft project for 0.1 MATIC
      if(messageContent.includes('/create-gig')){
        const values = extractCreateServiceDetails(messageContent);
        console.log('sendNewMessage', {allowedTokenList, values})
        const newId = await createService(chainId, signer, provider, user, values, allowedTokenList);
        customMessageContent = customMessageContent + ' | id:' + newId;
      }

      try {
        const response = await sendMessage(customMessageContent);
        setMessageContent('');
      } catch (error) {
        setSendingPending(false);
        setMessageSendingErrorMsg(
          'An error occurred while sending the message. Please try again later.',
        );
        console.error(error);
      } finally {
        setSendingPending(false);
      }
    }
  };

  if (!user) {
    return <Steps />;
  }

  return (
    <div className='mx-auto text-gray-900'>
      {!providerState?.client && account && (
        <div className='flex items-center justify-center pt-16'>
          <button
            type='submit'
            className='bg-redpraha text-white font-bold py-2 px-4 rounded'
            onClick={() => handleXmtpConnect()}>
            Connect to Messaging
          </button>
        </div>
      )}
      {providerState?.client && (
        <div className='-mx-6 -mt-6'>
          <CardHeader peerAddress={selectedConversationPeerAddress} />
          <div className='flex flex-row'>
            {providerState?.client && selectedConversationPeerAddress && (
              <div className='w-full flex flex-col justify-between'>
                <div className='overflow-y-auto'>
                  <MessageList
                    conversationMessages={
                      providerState.conversationMessages.get(selectedConversationPeerAddress) ?? []
                    }
                    selectedConversationPeerAddress={selectedConversationPeerAddress}
                    userId={account?.address as string}
                    peerUserId={selectedConversationPeerAddress}
                    messagesLoading={providerState.loadingMessages}
                    sendingPending={sendingPending}
                    setMessageSendingErrorMsg={setMessageSendingErrorMsg}
                  />
                </div>
                {(!providerState.loadingMessages || messageSendingErrorMsg) && (
                  <MessageComposer
                    messageContent={messageContent}
                    setMessageContent={setMessageContent}
                    sendNewMessage={sendNewMessage}
                    sendingPending={sendingPending}
                    peerUserExistsOnXMTP={
                      messageSendingErrorMsg !== NON_EXISTING_XMTP_USER_ERROR_MESSAGE
                    }
                    peerUserExistsOnTalentLayer={!!selectedConversationPeerAddress}
                  />
                )}
              </div>
            )}
          </div>
          {messageSendingErrorMsg && (
            <div className={'text-center text-xs px-4'}>
              <p className={'text-red-400 ml-1'}>{messageSendingErrorMsg}</p>
            </div>
          )}
          {selectedConversationPeerAddress && !selectedConversationPeerAddress && (
            <div className={'text-center text-xs px-4'}>
              <p className={'text-red-400 ml-1'}>User is not registered</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
