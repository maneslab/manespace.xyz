import { BellIcon } from '@heroicons/react/outline';
import { format,fromUnixTime } from 'date-fns';
import {getGoogleCalendarUrl} from 'helper/calendar'
import useTranslation from 'next-translate/useTranslation'

export default function Cal({text,details,begin_time,end_time = null}) {
    
    const begin_date = fromUnixTime(begin_time);
    const end_date = (end_time) ? fromUnixTime(end_time) : fromUnixTime(begin_time + 3600);

    let begin_str = format(begin_date,'yyyyMMdd')+'T'+format(begin_date,'HHmmss');
    let end_str =  format(end_date,'yyyyMMdd')+'T'+format(end_date,'HHmmss');

    let {t} = useTranslation('common');

    let url = getGoogleCalendarUrl(
        text,
        begin_str,
        end_str,
        details
    )

    return (
        <div class="tooltip" data-tip={t('add to google calendar')}>
        <a className="" target="_blank" href={url}>
            <BellIcon className='w-5 h-5'/>
        </a>
        </div>
    )
}
