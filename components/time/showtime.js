import { format,fromUnixTime } from 'date-fns';

export default function Showtime({unixtime,timezone}) {
    const select_date = fromUnixTime(unixtime);
    return (
        <span className="flex flex-col lg:flex-row justify-center lg:justify-start lg:items-center">
            <span>{format(select_date,'yyyy-MM-dd HH:mm')}</span>
            {
                (timezone === false)
                ? null
                : <span className='text-gray-400 ml-0 lg:ml-4'>{format(select_date,'zzzz')}</span>
            }
        </span>
    )
}
