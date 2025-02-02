import { useContext } from 'react';
import Loading from '../../../components/Loading';
import StarterKitContext from '../../../context/starterKit';
import { shortenString } from '../../../utils';
import { formatDateDivider } from '../../../utils/dates';
import { formatDateTime } from '../utils/messaging';
import { ChatMessageStatus, XmtpChatMessage } from '../utils/types';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { extractCreateServiceDetails, extractID } from '../../../utils/message';
import GigMessageCard from './GigMessageCard';
import ProposalMessageCard from './ProposalMessageCard';


interface IMessageCardProps {
  message: XmtpChatMessage;
  dateHasChanged: boolean;
}



const formatMessage = (message: string, isSender: boolean) => {
  console.log('Raphiraphraph    ' + message);
  const id = extractID(message);

  console.log('Raphiraphraph    ' + id);

  if (id && message.includes('/create-gig')) {
    return <GigMessageCard message={message} isSender={isSender} id={id} />;
  }
  if (message.includes('/create-proposal')) {
    console.log("proposal creation detected");
    return <ProposalMessageCard message={message} isSender={isSender} id={id} />;
  }
  return message;
};

const MessageCard = ({ message, dateHasChanged }: IMessageCardProps) => {
  const { account } = useContext(StarterKitContext);

  const isSender = message.from.toLowerCase() === account?.address?.toLowerCase();

  const messageContent = formatMessage(message.messageContent, isSender);

  return (
    <>
      {dateHasChanged && <DateDivider date={message.timestamp} />}
      {message.from && (
        <div
          className={`flex ${
            isSender ? 'justify-end pr-5' : 'justify-start pl-5'
          } mb-3 items-center`}>
          <div
            className={`py-3 px-4 text-sm ${
              isSender && message.status === ChatMessageStatus.SENT
                ? 'ml-12 bg-[#b2c9f7] text-midnight rounded-bl-2xl rounded-tl-2xl rounded-tr-xl'
                : isSender && message.status === ChatMessageStatus.ERROR
                ? 'ml-12 bg-red-600 rounded-br-2xl rounded-tl-2xl rounded-tr-xl'
                : isSender && message.status === ChatMessageStatus.PENDING
                ? 'ml-12 bg-gray-200 text-midnight rounded-bl-2xl rounded-tl-2xl rounded-tr-xl'
                : 'mr-12 bg-gray-200 text-midnight rounded-br-2xl rounded-tr-2xl rounded-tl-xl'
            }
          text-white`}>
            <span className='pr-1 text-gray-600 text-xs w-[50px]'>
              {formatDateTime(message.timestamp)}
            </span>
            {isSender && message.status === ChatMessageStatus.SENT && (
              <div className={'break-all'}>{messageContent}</div>
            )}
            {!isSender && <div className={'break-all'}>{messageContent}</div>}
            {isSender && message.status === ChatMessageStatus.PENDING && (
              <div className='flex flex-row items-center'>
                <div>
                  <div className={'break-all'}>{messageContent}</div>
                </div>
                <div className='ml-2'>
                  <Loading />
                </div>
              </div>
            )}
            {isSender && message.status === ChatMessageStatus.ERROR && (
              <div className={'break-all'}>{messageContent}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const DateDivider = ({ date }: { date?: Date }): JSX.Element => (
  <div className='flex align-items-center items-center pb-8 pt-4'>
    <div className='grow h-[1px] bg-gray-800' />
    <span className='mx-11 flex-none text-gray-300 text-sm font-semibold'>
      {formatDateDivider(date)}
    </span>
    <div className='grow h-[1px] bg-gray-800' />
  </div>
);

export default MessageCard;
